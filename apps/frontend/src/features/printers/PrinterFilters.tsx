import { startTransition } from "react";

export type StatusFilter = "all" | "online" | "offline" | "warning" | "error";

interface PrinterFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  locationFilter: string;
  onLocationFilterChange: (value: string) => void;
  activeFilter: "all" | "active" | "inactive";
  onActiveFilterChange: (value: "all" | "active" | "inactive") => void;
  locations: string[];
}

export function PrinterFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  locationFilter,
  onLocationFilterChange,
  activeFilter,
  onActiveFilterChange,
  locations
}: PrinterFiltersProps) {
  return (
    <div className="panel p-5">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <label className="label" htmlFor="search">
            Vyhledávání
          </label>
          <input
            id="search"
            className="field"
            placeholder="Název, IP nebo model"
            value={search}
            onChange={(event) =>
              startTransition(() => {
                onSearchChange(event.target.value);
              })
            }
          />
        </div>

        <div>
          <label className="label" htmlFor="statusFilter">
            Stav
          </label>
          <select
            id="statusFilter"
            className="field"
            value={statusFilter}
            onChange={(event) =>
              startTransition(() => {
                onStatusFilterChange(event.target.value as StatusFilter);
              })
            }
          >
            <option value="all">Vše</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>

        <div>
          <label className="label" htmlFor="locationFilter">
            Lokalita
          </label>
          <select
            id="locationFilter"
            className="field"
            value={locationFilter}
            onChange={(event) =>
              startTransition(() => {
                onLocationFilterChange(event.target.value);
              })
            }
          >
            <option value="">Vše</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="activeFilter">
            Evidence
          </label>
          <select
            id="activeFilter"
            className="field"
            value={activeFilter}
            onChange={(event) =>
              startTransition(() => {
                onActiveFilterChange(event.target.value as "all" | "active" | "inactive");
              })
            }
          >
            <option value="all">Vše</option>
            <option value="active">Aktivní</option>
            <option value="inactive">Neaktivní</option>
          </select>
        </div>
      </div>
    </div>
  );
}
