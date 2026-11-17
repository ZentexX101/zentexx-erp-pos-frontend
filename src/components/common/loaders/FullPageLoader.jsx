import { getBusinessName, splitBusinessName } from "../../../utils/businessName";

// Branded splash while the session (and the branch) is checked. Same markup and CSS (.splash in
// index.html) as the splash shown before the JS loads, so a reload looks like one loader.
// The name is the last one saved (Settings > Shop), read without a request.
const FullPageLoader = () => {
  const { main, rest } = splitBusinessName(getBusinessName());
  return (
    <div className="splash" role="status" aria-label="Loading">
      <div className="splash-logo">
        <span className="splash-main">{main}</span>
        {rest && <span className="splash-rest">{rest}</span>}
      </div>
      <div className="splash-track">
        <div className="splash-bar" />
      </div>
      <p className="splash-text">Loading your workspace</p>
    </div>
  );
};

export default FullPageLoader;
