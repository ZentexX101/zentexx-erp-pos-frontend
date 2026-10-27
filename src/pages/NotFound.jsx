import { Link } from "react-router";
import { ROUTES } from "../constants/routes";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
      <p className="text-5xl font-bold text-slate-300">404</p>
      <h1 className="text-lg font-semibold text-slate-900">Page not found</h1>
      <Link to={ROUTES.HOME} className="text-sm font-medium text-blue-600 hover:underline">
        Go home
      </Link>
    </div>
  );
};

export default NotFound;
