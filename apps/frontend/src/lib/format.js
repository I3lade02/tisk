export function formatDateTime(value) {
    if (!value) {
        return "Neznámé";
    }
    return new Intl.DateTimeFormat("cs-CZ", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(new Date(value));
}
export function formatNumber(value) {
    if (value === null || value === undefined) {
        return "Unknown";
    }
    return new Intl.NumberFormat("cs-CZ").format(value);
}
export function formatPercent(value) {
    if (value === null || value === undefined) {
        return "Unknown";
    }
    return `${value} %`;
}
