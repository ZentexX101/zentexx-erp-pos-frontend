import { useState } from "react";
import { LuLogOut } from "react-icons/lu";
import { useAuth } from "../../hooks/useAuth";
import Button from "../common/buttons/Button";
import ConfirmModal from "../common/modals/ConfirmModal";
import SettingsCard from "./SettingsCard";

// Signs the user out on every device, this one included
const SessionsCard = () => {
  const { logoutAll } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <SettingsCard title="Signed-in devices" description="Lost a phone or used a shared computer? End every session at once.">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">You'll be signed out here too and will need your password to sign back in.</p>
        <Button variant="dangerOutline" onClick={() => setConfirmOpen(true)} className="shrink-0">
          <LuLogOut className="size-4" aria-hidden="true" />
          Sign out everywhere
        </Button>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={logoutAll}
        title="Sign out of all devices?"
        message="Every session, including this one, will end right away."
        confirmLabel="Sign out everywhere"
        danger
      />
    </SettingsCard>
  );
};

export default SessionsCard;
