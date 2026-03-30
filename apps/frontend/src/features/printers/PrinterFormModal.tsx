import { useEffect, useState } from "react";
import type { PrinterFormData, PrinterSummary } from "@tisk/shared";

import type { PrinterProfileOption } from "../../api/printers";
import { Modal } from "../../components/Modal";

interface PrinterFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  printer: PrinterSummary | null;
  profiles: PrinterProfileOption[];
  onClose: () => void;
  onSubmit: (payload: PrinterFormData) => Promise<void>;
}

const emptyForm: PrinterFormData = {
  name: "",
  ipAddress: "",
  location: "",
  department: "",
  notes: "",
  model: "",
  snmpCommunity: "public",
  profileId: "",
  isActive: true
};

export function PrinterFormModal({
  open,
  mode,
  printer,
  profiles,
  onClose,
  onSubmit
}: PrinterFormModalProps) {
  const [form, setForm] = useState<PrinterFormData>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (printer) {
      setForm({
        name: printer.name,
        ipAddress: printer.ipAddress,
        location: printer.location ?? "",
        department: printer.department ?? "",
        notes: printer.notes ?? "",
        model: printer.model ?? "",
        snmpCommunity: printer.snmpCommunity,
        profileId: printer.profileId ?? "",
        isActive: printer.isActive
      });
      return;
    }

    setForm(emptyForm);
  }, [open, printer]);

  return (
    <Modal
      open={open}
      title={mode === "create" ? "Přidat tiskárnu" : "Upravit tiskárnu"}
      onClose={onClose}
    >
      <form
        className="grid gap-5 md:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault();
          setIsSubmitting(true);
          setError(null);

          try {
            await onSubmit(form);
            onClose();
          } catch (submitError) {
            setError(
              submitError instanceof Error ? submitError.message : "Tiskárnu se nepodařilo uložit."
            );
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <div>
          <label className="label" htmlFor="name">
            Název
          </label>
          <input
            id="name"
            className="field"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="ipAddress">
            IP adresa
          </label>
          <input
            id="ipAddress"
            className="field"
            value={form.ipAddress}
            onChange={(event) =>
              setForm((current) => ({ ...current, ipAddress: event.target.value }))
            }
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="location">
            Lokalita
          </label>
          <input
            id="location"
            className="field"
            value={form.location ?? ""}
            onChange={(event) =>
              setForm((current) => ({ ...current, location: event.target.value }))
            }
          />
        </div>

        <div>
          <label className="label" htmlFor="department">
            Oddělení
          </label>
          <input
            id="department"
            className="field"
            value={form.department ?? ""}
            onChange={(event) =>
              setForm((current) => ({ ...current, department: event.target.value }))
            }
          />
        </div>

        <div>
          <label className="label" htmlFor="model">
            Model
          </label>
          <input
            id="model"
            className="field"
            value={form.model ?? ""}
            onChange={(event) => setForm((current) => ({ ...current, model: event.target.value }))}
          />
        </div>

        <div>
          <label className="label" htmlFor="profileId">
            Profil parseru
          </label>
          <select
            id="profileId"
            className="field"
            value={form.profileId ?? ""}
            onChange={(event) =>
              setForm((current) => ({ ...current, profileId: event.target.value }))
            }
          >
            <option value="">Auto detect / standard</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="label" htmlFor="snmpCommunity">
            SNMP community
          </label>
          <input
            id="snmpCommunity"
            className="field"
            value={form.snmpCommunity}
            onChange={(event) =>
              setForm((current) => ({ ...current, snmpCommunity: event.target.value }))
            }
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="label" htmlFor="notes">
            Poznámka
          </label>
          <textarea
            id="notes"
            className="field min-h-28"
            value={form.notes ?? ""}
            onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
          />
        </div>

        <label className="flex items-center gap-3 md:col-span-2">
          <input
            type="checkbox"
            checked={Boolean(form.isActive)}
            onChange={(event) =>
              setForm((current) => ({ ...current, isActive: event.target.checked }))
            }
          />
          <span className="text-sm text-slate-700">Tiskárna je aktivní a bude se pollovat.</span>
        </label>

        {error ? <div className="md:col-span-2 text-sm text-danger">{error}</div> : null}

        <div className="flex justify-end gap-3 md:col-span-2">
          <button type="button" className="button-secondary" onClick={onClose}>
            Zrušit
          </button>
          <button type="submit" className="button-primary" disabled={isSubmitting}>
            {isSubmitting ? "Ukládám..." : mode === "create" ? "Přidat" : "Uložit změny"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
