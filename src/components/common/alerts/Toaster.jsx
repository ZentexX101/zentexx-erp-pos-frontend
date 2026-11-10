import { LuCircleAlert, LuCircleCheck, LuInfo, LuTriangleAlert, LuX } from "react-icons/lu";
import { Slide, ToastContainer } from "react-toastify";

const icons = {
  success: { Icon: LuCircleCheck, tone: "bg-emerald-50 text-emerald-600 ring-emerald-100" },
  error: { Icon: LuCircleAlert, tone: "bg-red-50 text-red-600 ring-red-100" },
  warning: { Icon: LuTriangleAlert, tone: "bg-amber-50 text-amber-600 ring-amber-100" },
  info: { Icon: LuInfo, tone: "bg-blue-50 text-blue-600 ring-blue-100" },
};

const ToastIcon = ({ type }) => {
  const { Icon, tone } = icons[type] ?? icons.info;
  return (
    <span className={`flex h-8 w-8 items-center justify-center rounded-full ring-4 ${tone}`}>
      <Icon className="h-4.5 w-4.5" aria-hidden="true" />
    </span>
  );
};

const CloseButton = ({ closeToast }) => (
  <button
    type="button"
    onClick={closeToast}
    className="-mr-1 self-start rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
    aria-label="Close notification"
  >
    <LuX className="h-4 w-4" aria-hidden="true" />
  </button>
);

// react-toastify container, mounted once in main.jsx. Show one from anywhere with
// `import { toast } from "react-toastify"` → toast.success("...") / toast.error("...").
// Mutation hooks don't call it themselves: they declare meta: { success } and main.jsx's MutationCache shows it.
// The card look (white card, coloured left edge, thin progress bar) lives in index.css under "Toasts".
const Toaster = () => (
  <ToastContainer
    position="top-right"
    autoClose={3500}
    newestOnTop
    limit={4}
    closeOnClick
    pauseOnHover
    pauseOnFocusLoss={false}
    draggable
    theme="light"
    transition={Slide}
    icon={ToastIcon}
    closeButton={CloseButton}
    style={{ zIndex: 200 }}
  />
);

export default Toaster;
