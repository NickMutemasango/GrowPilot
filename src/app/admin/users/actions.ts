"use server";

import { requireAdmin } from "@/lib/admin/service";
import { getUserStore } from "@/lib/admin/user-store";
import {
  approveApplication,
  reactivateUser,
  rejectApplication,
  removeRole,
  suspendUser,
  type ActionResult,
} from "@/lib/admin/users";
import { getCurrentStudent } from "@/lib/auth/session";

/*
 * User-management actions on the server. Each one checks again that the
 * caller is an administrator (never trusting the page), applies the rules
 * in src/lib/admin/users.ts, then saves the change and its audit entry
 * together. The rules are shared with the browser, so a decision the
 * screen allows is the same decision the server allows.
 */

export type UserActionRequest =
  | { kind: "approve"; userId: string }
  | { kind: "reject"; userId: string; reason: string }
  | { kind: "suspend"; userId: string; reason: string }
  | { kind: "reactivate"; userId: string }
  | { kind: "remove-role"; userId: string; role: "instructor" | "admin" };

export async function userAction(request: UserActionRequest): Promise<{ ok: boolean; message: string }> {
  await requireAdmin("/admin/users");
  const me = await getCurrentStudent();
  const store = getUserStore();
  if (!me || !store) {
    return { ok: false, message: "Account changes aren't available yet, so nothing was changed." };
  }

  // Load the target and every administrator, so "last administrator" checks are accurate.
  const users = await store.loadForAction([me.id, request.userId]);
  const actor = { id: me.id };
  let result: ActionResult;
  switch (request.kind) {
    case "approve":
      result = approveApplication(users, actor, request.userId);
      break;
    case "reject":
      result = rejectApplication(users, actor, request.userId, request.reason);
      break;
    case "suspend":
      result = suspendUser(users, actor, request.userId, request.reason);
      break;
    case "reactivate":
      result = reactivateUser(users, actor, request.userId);
      break;
    case "remove-role":
      if (request.role !== "instructor" && request.role !== "admin") return { ok: false, message: "That role can't be changed here." };
      result = removeRole(users, actor, request.userId, request.role);
      break;
    default:
      return { ok: false, message: "That action isn't recognised." };
  }
  if (!result.ok) return result;

  const changed = result.users.find((user) => user.id === request.userId);
  if (changed) await store.saveUser(changed);
  await store.appendAudit(result.audit);
  return { ok: true, message: result.message };
}
