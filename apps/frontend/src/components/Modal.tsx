import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/45 px-4 py-10 backdrop-blur-sm">
      <div className="panel w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-line/80 px-6 py-4">
          <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
          <button type="button" className="button-secondary px-3 py-2" onClick={onClose}>
            Zavřít
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
