import Spinner from "./Spinner";

const FullPageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Spinner className="h-8 w-8 text-brand" />
    </div>
  );
};

export default FullPageLoader;
