export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Neznámé";
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "Unknown";
  }

  return new Intl.NumberFormat("cs-CZ").format(value);
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "Unknown";
  }

  return `${value} %`;
}
