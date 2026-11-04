import { Link, useLocation } from "react-router";
import { staffFilePath } from "../../constants/routes";
import PersonCell from "./PersonCell";

// A person's name in an HR list, opening their whole file
const PersonLink = ({ person }) => {
  const inBranch = useLocation().pathname.startsWith("/branch");
  return (
    <Link
      to={staffFilePath(person._id, inBranch)}
      title="See everything about them"
      className="block min-w-0 rounded-lg outline-none hover:opacity-75 focus-visible:ring-2 focus-visible:ring-brand/20"
    >
      <PersonCell person={person} />
    </Link>
  );
};

export default PersonLink;
