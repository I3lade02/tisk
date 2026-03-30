# Tisk Monitor

Lehká interní webová aplikace pro monitoring síťových tiskáren přes SNMP v2c. Projekt je navržený pro lokální firemní síť a jednoduchý provoz na Linuxu nebo Raspberry Pi bez cloudu, bez externích API a bez Dockeru.

## Architektura

- `apps/backend`: Express API, SNMP polling, SQLite, scheduler a servis statického frontendu v produkci
- `apps/frontend`: React + TypeScript + Tailwind dashboard a detail tiskárny
- `packages/shared`: sdílené TypeScript typy a validační schémata
- `deploy`: systemd service pro Raspberry Pi

### Provozní model

- Backend pravidelně načítá aktivní tiskárny přes SNMP.
- Každý poll ukládá poslední stav do `printers.last_*` polí a zároveň zapisuje historii do SQLite tabulek.
- Frontend v produkci servíruje přímo backend z `apps/frontend/dist`, takže na Raspberry Pi běží jedna interní služba.
- Vendor-specific odlišnosti řeší `profile registry` v backendu, takže lze postupně přidávat profily bez zásahu do UI nebo databázového modelu.

## Struktura projektu

```text
tisk/
├── apps/
│   ├── backend/
│   │   └── src/
│   │       ├── api/routes
│   │       ├── config
│   │       ├── db/repositories
│   │       ├── services/polling
│   │       ├── services/snmp/profiles
│   │       ├── scripts
│   │       └── utils
│   └── frontend/
│       └── src/
│           ├── api
│           ├── components
│           ├── features/dashboard
│           ├── features/printers
│           ├── hooks
│           ├── lib
│           └── pages
├── packages/
│   └── shared/
└── deploy/
```

## MVP funkce

- evidence tiskáren včetně SNMP community, lokality, oddělení a aktivního stavu
- REST API pro CRUD tiskáren, detail, historii, dashboard summary a nastavení aplikace
- scheduler s konfigurovatelným intervalem
- SNMP v2c čtení standardních Printer MIB OID
- parser tonerů, trayů, page counteru a základního statusu
- interpretace nevalidních hodnot `-2` a `-3` jako `unknown`
- historie připravená pro budoucí grafy a alerty
- ukázkový profil `Develop ineo+ 250i`
- seed skript s ukázkovými daty pro test UI bez reálné tiskárny

## Databáze

SQLite obsahuje minimálně tyto entity:

- `printers`
- `printer_status_history`
- `toner_levels_history`
- `tray_status_history`
- `app_settings`

`printers` navíc drží poslední snapshot pro rychlý dashboard bez drahých dotazů do historie.

## SNMP a profily

Backend používá standardní OID pro:

- model zařízení
- stav zařízení
- tonery
- page counter
- papírové zásobníky
- volitelné alert tabulky, pokud je tiskárna vrací

Profilový systém:

- `standard parser`: základní zpracování standardních OID
- `develop-ineo-plus-250i`: ukázkový vendor/model profil s normalizací názvů tonerů

Další profily přidáte do `apps/backend/src/services/snmp/profiles`.

## Lokální spuštění

### 1. Instalace závislostí

```bash
cd ~/Desktop/tisk
npm install
```

### 2. Konfigurace

```bash
cp .env.example .env
```

V `.env` upravte hlavně:

- `DB_PATH`
- `PORT`
- `POLL_INTERVAL_SECONDS`
- `TONER_WARNING_THRESHOLD`
- `SNMP_TIMEOUT_MS`
- `SNMP_MOCK_MODE`

### 3. Seed ukázkových dat

```bash
npm run seed
```

### 4. Development

```bash
npm run dev
```

- frontend: `http://localhost:5173`
- backend API: `http://localhost:4000`

### 5. Produkční build

```bash
npm run build
```

### 6. Produkční start

```bash
npm run start -w @tisk/backend
```

V produkci backend automaticky servíruje i zbuilděný frontend z `apps/frontend/dist`.

## Raspberry Pi deployment

### Doporučený přístup

- Node.js 22 LTS
- jedna služba přes `systemd`
- SQLite soubor na lokálním disku
- frontend servírovat přímo z Express backendu

To je pro Raspberry Pi jednodušší než oddělený reverse proxy a má to menší provozní režii.

### Potřebné balíčky

Na Raspberry Pi OS / Debian:

```bash
sudo apt update
sudo apt install -y git build-essential python3 make g++
```

Pak nainstalujte Node.js 22 a npm.

### Deployment flow

```bash
sudo mkdir -p /opt/tisk-monitor
sudo chown -R pi:pi /opt/tisk-monitor
cd /opt/tisk-monitor
git clone <repo> .
npm install
cp .env.example .env
npm run seed
npm run build
```

### systemd service

Ukázkový soubor je v [deploy/tisk-monitor.service](/home/ondra/Desktop/tisk/deploy/tisk-monitor.service).

Instalace:

```bash
sudo cp deploy/tisk-monitor.service /etc/systemd/system/tisk-monitor.service
sudo systemctl daemon-reload
sudo systemctl enable --now tisk-monitor.service
sudo systemctl status tisk-monitor.service
```

## API přehled

- `GET /api/printers`
- `GET /api/printers/:id`
- `POST /api/printers`
- `PUT /api/printers/:id`
- `DELETE /api/printers/:id`
- `GET /api/printers/:id/history`
- `POST /api/printers/:id/poll`
- `GET /api/dashboard/summary`
- `GET /api/settings`
- `PUT /api/settings`

## Seed a mock režim

- `npm run seed` vloží ukázkovou tiskárnu `Develop ineo+ 250i` a sample snapshot.
- `SNMP_MOCK_MODE=true` přepne backend do mock SNMP režimu, užitečné pro demo nebo vývoj bez tiskárny.

## Budoucí rozšíření

### Alerty

- přidat tabulku `alert_events`
- generovat události při přechodu do `warning/error/offline`
- oddělit pravidla alertů od polling logiky

### Email notifikace

- lokální SMTP relay nebo interní firemní SMTP
- throttling notifikací podle typu chyby
- mapování upozornění na konkrétní lokalitu nebo oddělení

### Grafy historie

- endpointy agregující historii po hodinách nebo dnech
- samostatná frontend sekce pro trend tonerů a dostupnosti
- retention policy pro starší data

### Více vendor-specific OID map

- registr profilů rozšířit o `oidOverrides`
- fallback na standardní OID, vendor mapy pouze jako doplněk
- přidat profily třeba pro Konica Minolta, HP, Brother, Kyocera

## Poznámky k výkonu

- SQLite bez ORM snižuje overhead
- polling je omezený konfigurovatelnou konkurencí
- backend a frontend lze provozovat jako jednu službu
- žádné cloudové závislosti při runtime
