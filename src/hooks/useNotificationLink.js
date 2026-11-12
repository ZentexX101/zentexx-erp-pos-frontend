import { useCallback } from "react";
import { isMainAdmin } from "../constants/roles";
import { hasPermission } from "../utils/access";
import { useAuth } from "./useAuth";
import { useBranch } from "./useBranch";
import { CARD_PAGES } from "./useCardLink";

// Where a notification leads: linkOf(notification) -> { to, onClick } or undefined (nothing to open).
// - branch users: their branch's page (if they may open it)
// - main admins: the all-branch page if there is one; otherwise the branch's page, entering that branch
//   on the way (only when the notification is about one branch)
export const useNotificationLink = () => {
  const { user } = useAuth();
  const { activeBranch, enterBranch } = useBranch();
  const mainAdmin = isMainAdmin(user);

  return useCallback(
    (notification) => {
      const page = CARD_PAGES[notification.page];
      if (!page || (page.permission && !hasPermission(user, page.permission))) return undefined;
      if (!mainAdmin) return page.branch ? { to: page.branch } : undefined;
      if (page.main) return { to: page.main };
      const branch = notification.branches?.length === 1 ? notification.branches[0] : null;
      if (!page.branch || !branch) return undefined;
      return {
        to: page.branch,
        onClick: () => {
          if (String(activeBranch?._id) !== String(branch._id)) enterBranch(branch);
        },
      };
    },
    [user, mainAdmin, activeBranch, enterBranch],
  );
};
