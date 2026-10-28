import { useEffect, useId } from "react";
import Icon from "../icons/Icon";

const SIZES = {
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

// placement "right": full-height panel that slides in from the right (forms, details).
// placement "center": small dialog in the middle (confirmations such as delete).
const PLACEMENTS = {
  right: {
    container: "flex justify-end",
    panel: "h-full animate-slide-in-right shadow-2xl",
  },
  center: {
    container: "flex items-center justify-center p-4",
    panel: "max-h-[90vh] animate-zoom-in overflow-hidden rounded-xl shadow-2xl",
  },
};

// footer: action buttons pinned at the bottom (omit for a Close button, false for none).
// A form inside can submit from the footer with <Button type="submit" form="<form id>">.
const Modal = ({ isOpen, onClose, title, subtitle, children, footer, size = "md", placement = "right" }) => {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => e.key === "Escape" && onClose();
    const previousOverflow = document.body.style.overflow;
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 ${PLACEMENTS[placement].container}`}>
      <div className="absolute inset-0 animate-fade-in bg-slate-900/50" onClick={onClose} aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={`relative flex w-full flex-col bg-white ${PLACEMENTS[placement].panel} ${SIZES[size]}`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {title && (
              <h2 id={titleId} className="text-lg font-semibold text-slate-900">
                {title}
              </h2>
            )}
            {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

        {footer !== false && (
          <footer className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3 sm:px-6">
            {footer ?? (
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
              >
                Close
              </button>
            )}
          </footer>
        )}
      </aside>
    </div>
  );
};

export default Modal;

// Example:
// <Modal isOpen={open} onClose={() => setOpen(false)} title="Title" size="lg">
//   <p>Content</p>
// </Modal>
