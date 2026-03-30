import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Modal } from "../../components/Modal";
export function SettingsModal({ open, settings, onClose, onSubmit }) {
    const [form, setForm] = useState({
        pollIntervalSeconds: 300,
        tonerWarningThreshold: 15,
        historyRetentionDays: 90
    });
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    useEffect(() => {
        if (!open || !settings) {
            return;
        }
        setForm({
            pollIntervalSeconds: settings.pollIntervalSeconds,
            tonerWarningThreshold: settings.tonerWarningThreshold,
            historyRetentionDays: settings.historyRetentionDays
        });
    }, [open, settings]);
    return (_jsx(Modal, { open: open, title: "Nastaven\u00ED monitoringu", onClose: onClose, children: _jsxs("form", { className: "grid gap-5 md:grid-cols-2", onSubmit: async (event) => {
                event.preventDefault();
                setIsSubmitting(true);
                setError(null);
                try {
                    await onSubmit(form);
                    onClose();
                }
                catch (submitError) {
                    setError(submitError instanceof Error ? submitError.message : "Nastavení se nepodařilo uložit.");
                }
                finally {
                    setIsSubmitting(false);
                }
            }, children: [_jsxs("div", { children: [_jsx("label", { className: "label", htmlFor: "pollIntervalSeconds", children: "Interval pollingu (s)" }), _jsx("input", { id: "pollIntervalSeconds", type: "number", min: 60, className: "field", value: form.pollIntervalSeconds, onChange: (event) => setForm((current) => ({
                                ...current,
                                pollIntervalSeconds: Number(event.target.value)
                            })), required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "label", htmlFor: "tonerWarningThreshold", children: "Warning pr\u00E1h toneru (%)" }), _jsx("input", { id: "tonerWarningThreshold", type: "number", min: 1, max: 99, className: "field", value: form.tonerWarningThreshold, onChange: (event) => setForm((current) => ({
                                ...current,
                                tonerWarningThreshold: Number(event.target.value)
                            })), required: true })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "label", htmlFor: "historyRetentionDays", children: "Retence historie (dny)" }), _jsx("input", { id: "historyRetentionDays", type: "number", min: 1, className: "field", value: form.historyRetentionDays ?? "", onChange: (event) => setForm((current) => ({
                                ...current,
                                historyRetentionDays: event.target.value ? Number(event.target.value) : null
                            })) })] }), error ? _jsx("div", { className: "md:col-span-2 text-sm text-danger", children: error }) : null, _jsxs("div", { className: "flex justify-end gap-3 md:col-span-2", children: [_jsx("button", { type: "button", className: "button-secondary", onClick: onClose, children: "Zru\u0161it" }), _jsx("button", { type: "submit", className: "button-primary", disabled: isSubmitting, children: isSubmitting ? "Ukládám..." : "Uložit" })] })] }) }));
}
