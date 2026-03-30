import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Modal } from "../../components/Modal";
const emptyForm = {
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
export function PrinterFormModal({ open, mode, printer, profiles, onClose, onSubmit }) {
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState(null);
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
    return (_jsx(Modal, { open: open, title: mode === "create" ? "Přidat tiskárnu" : "Upravit tiskárnu", onClose: onClose, children: _jsxs("form", { className: "grid gap-5 md:grid-cols-2", onSubmit: async (event) => {
                event.preventDefault();
                setIsSubmitting(true);
                setError(null);
                try {
                    await onSubmit(form);
                    onClose();
                }
                catch (submitError) {
                    setError(submitError instanceof Error ? submitError.message : "Tiskárnu se nepodařilo uložit.");
                }
                finally {
                    setIsSubmitting(false);
                }
            }, children: [_jsxs("div", { children: [_jsx("label", { className: "label", htmlFor: "name", children: "N\u00E1zev" }), _jsx("input", { id: "name", className: "field", value: form.name, onChange: (event) => setForm((current) => ({ ...current, name: event.target.value })), required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "label", htmlFor: "ipAddress", children: "IP adresa" }), _jsx("input", { id: "ipAddress", className: "field", value: form.ipAddress, onChange: (event) => setForm((current) => ({ ...current, ipAddress: event.target.value })), required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "label", htmlFor: "location", children: "Lokalita" }), _jsx("input", { id: "location", className: "field", value: form.location ?? "", onChange: (event) => setForm((current) => ({ ...current, location: event.target.value })) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", htmlFor: "department", children: "Odd\u011Blen\u00ED" }), _jsx("input", { id: "department", className: "field", value: form.department ?? "", onChange: (event) => setForm((current) => ({ ...current, department: event.target.value })) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", htmlFor: "model", children: "Model" }), _jsx("input", { id: "model", className: "field", value: form.model ?? "", onChange: (event) => setForm((current) => ({ ...current, model: event.target.value })) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", htmlFor: "profileId", children: "Profil parseru" }), _jsxs("select", { id: "profileId", className: "field", value: form.profileId ?? "", onChange: (event) => setForm((current) => ({ ...current, profileId: event.target.value })), children: [_jsx("option", { value: "", children: "Auto detect / standard" }), profiles.map((profile) => (_jsx("option", { value: profile.id, children: profile.name }, profile.id)))] })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "label", htmlFor: "snmpCommunity", children: "SNMP community" }), _jsx("input", { id: "snmpCommunity", className: "field", value: form.snmpCommunity, onChange: (event) => setForm((current) => ({ ...current, snmpCommunity: event.target.value })), required: true })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "label", htmlFor: "notes", children: "Pozn\u00E1mka" }), _jsx("textarea", { id: "notes", className: "field min-h-28", value: form.notes ?? "", onChange: (event) => setForm((current) => ({ ...current, notes: event.target.value })) })] }), _jsxs("label", { className: "flex items-center gap-3 md:col-span-2", children: [_jsx("input", { type: "checkbox", checked: Boolean(form.isActive), onChange: (event) => setForm((current) => ({ ...current, isActive: event.target.checked })) }), _jsx("span", { className: "text-sm text-slate-700", children: "Tisk\u00E1rna je aktivn\u00ED a bude se pollovat." })] }), error ? _jsx("div", { className: "md:col-span-2 text-sm text-danger", children: error }) : null, _jsxs("div", { className: "flex justify-end gap-3 md:col-span-2", children: [_jsx("button", { type: "button", className: "button-secondary", onClick: onClose, children: "Zru\u0161it" }), _jsx("button", { type: "submit", className: "button-primary", disabled: isSubmitting, children: isSubmitting ? "Ukládám..." : mode === "create" ? "Přidat" : "Uložit změny" })] })] }) }));
}
