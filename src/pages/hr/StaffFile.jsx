import { LuArrowLeft } from "react-icons/lu";
import { Link, useLocation, useParams } from "react-router";
import Alert from "../../components/common/alerts/Alert";
import PersonFile from "../../components/hr/me/PersonFile";
import { ROUTES } from "../../constants/routes";
import { useStaffFileData } from "../../hooks/useHrApi";

// An admin looking at one staff member: everything that person sees on their own page, read-only
const StaffFile = () => {
  const { id } = useParams();
  const inBranch = useLocation().pathname.startsWith("/branch");
  const { data, isLoading, error } = useStaffFileData(id);
  const back = inBranch ? ROUTES.BRANCH_HR_STAFF : ROUTES.HR_STAFF;

  return (
    <div className="space-y-4">
      <Link to={back} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 print:hidden">
        <LuArrowLeft className="size-4" aria-hidden="true" />
        Staff History
      </Link>
      <Alert>{error?.message}</Alert>
      {isLoading && !data ? (
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200/60" aria-hidden="true" />
      ) : (
        data && <PersonFile data={data} staffId={id} title={data.user.name} branchName={data.user.branch?.name} />
      )}
    </div>
  );
};

export default StaffFile;
