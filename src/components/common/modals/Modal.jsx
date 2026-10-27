import { useEffect } from "react";

const SIZES = {
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

// footer: custom action buttons; omit for a Close button, or pass false for none
const Modal = ({ isOpen, onClose, title, children, footer, size = "md", className = "" }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className={`relative my-auto w-full rounded-lg bg-white p-6 shadow-lg ${SIZES[size]} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {title && <div className="mb-4 border-b border-slate-200 pb-2 pr-8 text-lg font-semibold text-slate-900">{title}</div>}
        <div>{children}</div>

        {footer !== false && (
          <div className="mt-6 flex justify-end gap-2">
            {footer ?? (
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

// Example:
// <Modal isOpen={open} onClose={() => setOpen(false)} title="Title" size="lg">
//   <p>Content</p>
// </Modal>
