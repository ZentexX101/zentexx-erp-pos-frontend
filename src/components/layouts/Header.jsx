import { Link } from "react-router";
import { getHomePath, ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";

const Header = () => {
  const { user, loading } = useAuth();

  return (
    <div className="flex items-center justify-between bg-gray-800 text-white p-4">
      <Link to={ROUTES.HOME} className="font-semibold">
        Zentexx ERP
      </Link>
      {!loading && (
        <Link
          to={user ? getHomePath(user) : ROUTES.LOGIN}
          className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-700"
        >
          {user ? "Dashboard" : "Sign in"}
        </Link>
      )}
    </div>
  );
};

export default Header;
