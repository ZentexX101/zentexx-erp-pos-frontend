import darkLogo from "../../../assets/decent-logo-dark.png";
import { BUSINESS_NAME } from "../../../constants/app";

// Branded splash while the session (and the branch) is checked. Same markup and CSS (.splash in
// index.html) as the splash shown before the JS loads, so a reload looks like one loader.
const FullPageLoader = () => (
  <div className="splash" role="status" aria-label="Loading">
    <img className="splash-logo" src={darkLogo} alt={BUSINESS_NAME} draggable="false" />
    <div className="splash-track">
      <div className="splash-bar" />
    </div>
    <p className="splash-text">Loading your workspace</p>
  </div>
);

export default FullPageLoader;
