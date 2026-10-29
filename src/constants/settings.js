import { LuShieldCheck, LuUserRound } from "react-icons/lu";

// Tabs on the Settings page (?tab=<key>)
export const SETTINGS_TABS = [
  { key: "account", label: "Account", hint: "Your profile details", icon: LuUserRound },
  { key: "security", label: "Security", hint: "Password and sign-ins", icon: LuShieldCheck },
];
