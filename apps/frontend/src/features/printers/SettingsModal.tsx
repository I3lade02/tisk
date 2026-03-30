import { useEffect, useState } from "react";
import type { AppSettings, SettingsFormData } from "@tisk/shared";

import { Modal } from "../../components/Modal";

interface SettingsModalProps {
  open: boolean;
  settings: AppSettings | null;
  onClose: () => void;
  onSubmit: (payload: SettingsFormData) => Promise<void>;
}

export function SettingsModal({ open, settings, onClose, onSubmit }: SettingsModalProps) {
  const [form, setForm] = useState<SettingsFormData>({
    pollIntervalSeconds: 300,
    tonerWarningThreshold: 15,
    historyRetentionDays: 90
  });
  const [error, setError] = useState<string | null>(null);
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

  return (
    <Modal open={open} title="Nastavení monitoringu" onClose={onClose}>
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
              submitError instanceof Error ? submitError.message : "Nastavení se nepodařilo uložit."
            );
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <div>
          <label className="label" htmlFor="pollIntervalSeconds">
            Interval pollingu (s)
          </label>
          <input
            id="pollIntervalSeconds"
            type="number"
            min={60}
            className="field"
            value={form.pollIntervalSeconds}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                pollIntervalSeconds: Number(event.target.value)
              }))
            }
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="tonerWarningThreshold">
            Warning práh toneru (%)
          </label>
          <input
            id="tonerWarningThreshold"
            type="number"
            min={1}
            max={99}
            className="field"
            value={form.tonerWarningThreshold}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                tonerWarningThreshold: Number(event.target.value)
              }))
            }
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="label" htmlFor="historyRetentionDays">
            Retence historie (dny)
          </label>
          <input
            id="historyRetentionDays"
            type="number"
            min={1}
            className="field"
            value={form.historyRetentionDays ?? ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                historyRetentionDays: event.target.value ? Number(event.target.value) : null
              }))
            }
          />
        </div>

        {error ? <div className="md:col-span-2 text-sm text-danger">{error}</div> : null}

        <div className="flex justify-end gap-3 md:col-span-2">
          <button type="button" className="button-secondary" onClick={onClose}>
            Zrušit
          </button>
          <button type="submit" className="button-primary" disabled={isSubmitting}>
            {isSubmitting ? "Ukládám..." : "Uložit"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
