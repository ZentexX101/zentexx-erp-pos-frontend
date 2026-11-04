import PersonFile from "../../components/hr/me/PersonFile";
import { useBranch } from "../../hooks/useBranch";
import { useMyHrData } from "../../hooks/useHrApi";

// A staff member's own page
const MyHr = () => {
  const { activeBranch } = useBranch();
  const { data, isLoading } = useMyHrData();

  if (isLoading || !data) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200/60" aria-hidden="true" />;

  return <PersonFile data={data} title={`Hello, ${data.user.name.split(" ")[0]}`} branchName={activeBranch?.name} />;
};

export default MyHr;
