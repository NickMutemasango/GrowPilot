import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ManagedUser } from "@/types/admin-users";
import {
  approveApplication,
  filterUsers,
  paginate,
  pendingApplications,
  reactivateUser,
  rejectApplication,
  removeRole,
  summariseUsers,
  suspendUser,
} from "./users.ts";

function user(id: string, changes: Partial<ManagedUser> = {}): ManagedUser {
  return {
    id,
    fullName: `User ${id}`,
    email: `${id}@example.com`,
    roles: ["student"],
    status: "active",
    joinedAt: "2026-10-01T00:00:00Z",
    enrolledCourses: 0,
    completedCourses: 0,
    application: null,
    createdCourses: 0,
    publishedCourses: 0,
    ...changes,
  };
}

const application = (status: "pending" | "approved" | "rejected" = "pending") => ({
  status,
  title: "Tutor",
  bio: "Teaches.",
  expertise: ["Email"],
  appliedAt: "2026-11-01T00:00:00Z",
  reviewedAt: null,
  rejectionReason: null,
});

const ADMIN = { id: "admin" };
function world(): ManagedUser[] {
  return [
    user("admin", { fullName: "Ama Owusu", email: "ama@growpilot.example", roles: ["student", "admin"] }),
    user("john", { fullName: "John Moyo", email: "JOHN@example.com" }),
    user("grace", { fullName: "Grace Okafor", roles: ["student", "instructor"], application: application("approved") }),
    user("kofi", { fullName: "Kofi Mensah", application: application() }),
    user("ruth", { fullName: "Ruth Banda", status: "suspended" }),
  ];
}

describe("search and filters", () => {
  const filters = { query: "", role: "all", status: "all", application: "all" } as const;

  it("finds users by name or email, ignoring capitals", () => {
    assert.deepEqual(filterUsers(world(), { ...filters, query: "john" }).map((u) => u.id), ["john"]);
    assert.deepEqual(filterUsers(world(), { ...filters, query: "  GROWPILOT.example " }).map((u) => u.id), ["admin"]);
    assert.deepEqual(filterUsers(world(), { ...filters, query: "nobody" }), []);
  });

  it("filters by role, account status and application status, together with search", () => {
    assert.deepEqual(filterUsers(world(), { ...filters, role: "instructor" }).map((u) => u.id), ["grace"]);
    assert.deepEqual(filterUsers(world(), { ...filters, role: "admin" }).map((u) => u.id), ["admin"]);
    assert.deepEqual(filterUsers(world(), { ...filters, status: "suspended" }).map((u) => u.id), ["ruth"]);
    assert.deepEqual(filterUsers(world(), { ...filters, application: "pending" }).map((u) => u.id), ["kofi"]);
    assert.deepEqual(filterUsers(world(), { ...filters, role: "student", query: "ko" }).map((u) => u.id), ["kofi"]);
  });

  it("splits results into pages", () => {
    const result = paginate([1, 2, 3, 4, 5], 2, 2);
    assert.deepEqual(result, { items: [3, 4], page: 2, pageCount: 3, total: 5 });
    assert.equal(paginate([1, 2], 99, 10).page, 1);
  });

  it("counts users for the summary cards", () => {
    assert.deepEqual(summariseUsers(world()), { total: 5, activeStudents: 2, activeInstructors: 1, suspended: 1 });
  });
});

describe("instructor applications", () => {
  it("gives instructor access only when an application is approved", () => {
    const result = approveApplication(world(), ADMIN, "kofi");
    assert.ok(result.ok);
    const kofi = result.users.find((u) => u.id === "kofi")!;
    assert.deepEqual(kofi.roles, ["student", "instructor"]);
    assert.equal(kofi.application?.status, "approved");
    assert.equal(result.message, "Kofi Mensah has been approved as an instructor.");
    assert.equal(result.audit.action, "instructor-approved");
    assert.equal(result.audit.adminId, "admin");
  });

  it("rejects without giving any access, and keeps the optional reason", () => {
    const result = rejectApplication(world(), ADMIN, "kofi", "  Please add more detail.  ");
    assert.ok(result.ok);
    const kofi = result.users.find((u) => u.id === "kofi")!;
    assert.deepEqual(kofi.roles, ["student"]);
    assert.equal(kofi.application?.rejectionReason, "Please add more detail.");
    assert.equal(result.audit.reason, "Please add more detail.");
  });

  it("won't review the same application twice", () => {
    const approved = approveApplication(world(), ADMIN, "kofi");
    assert.ok(approved.ok);
    assert.equal(rejectApplication(approved.users, ADMIN, "kofi", "").ok, false);
    assert.equal(approveApplication(approved.users, ADMIN, "kofi").ok, false);
  });

  it("lists pending applications only", () => {
    assert.deepEqual(pendingApplications(world()).map((u) => u.id), ["kofi"]);
  });
});

describe("suspending and reactivating", () => {
  it("suspends, keeping roles and course records, and reactivates", () => {
    const users = world().map((u) => (u.id === "grace" ? { ...u, enrolledCourses: 3, completedCourses: 1 } : u));
    const suspended = suspendUser(users, ADMIN, "grace", "Reported misuse");
    assert.ok(suspended.ok);
    const grace = suspended.users.find((u) => u.id === "grace")!;
    assert.equal(grace.status, "suspended");
    assert.deepEqual([grace.roles, grace.enrolledCourses, grace.completedCourses], [["student", "instructor"], 3, 1]);
    assert.equal(suspended.audit.reason, "Reported misuse");

    const back = reactivateUser(suspended.users, ADMIN, "grace");
    assert.ok(back.ok);
    assert.equal(back.users.find((u) => u.id === "grace")!.status, "active");
  });

  it("doesn't bring back a role that was removed separately", () => {
    const removed = removeRole(world(), ADMIN, "grace", "instructor");
    assert.ok(removed.ok);
    const suspended = suspendUser(removed.users, ADMIN, "grace", "");
    assert.ok(suspended.ok);
    const back = reactivateUser(suspended.users, ADMIN, "grace");
    assert.ok(back.ok);
    assert.deepEqual(back.users.find((u) => u.id === "grace")!.roles, ["student"]);
  });

  it("won't let administrators suspend themselves or the last administrator", () => {
    assert.equal(suspendUser(world(), ADMIN, "admin", "").message, "You can't suspend your own account.");
    const twoAdmins = [...world(), user("admin2", { roles: ["student", "admin"] })];
    assert.equal(suspendUser(twoAdmins, ADMIN, "admin2", "").ok, true);
    const lone = [user("admin2", { roles: ["student", "admin"] }), user("admin", { roles: ["student", "admin"], status: "suspended" })];
    assert.equal(suspendUser(lone, { id: "admin2" }, "admin2", "").ok, false);
  });

  it("explains when nothing needs doing", () => {
    assert.equal(suspendUser(world(), ADMIN, "ruth", "").message, "This account is already suspended.");
    assert.equal(reactivateUser(world(), ADMIN, "john").message, "This account is already active.");
  });
});

describe("who can act, and role changes", () => {
  it("refuses everyone who isn't an active administrator", () => {
    for (const actor of [{ id: "john" }, { id: "grace" }, { id: "ruth" }, { id: "stranger" }]) {
      assert.equal(suspendUser(world(), actor, "kofi", "").message, "Only an active administrator can do this.");
      assert.equal(approveApplication(world(), actor, "kofi").ok, false);
    }
    const suspendedAdmin = world().map((u) => (u.id === "admin" ? { ...u, status: "suspended" as const } : u));
    assert.equal(approveApplication(suspendedAdmin, ADMIN, "kofi").ok, false);
  });

  it("never removes your own or the last administrator access", () => {
    assert.equal(removeRole(world(), ADMIN, "admin", "admin").message, "You can't remove your own administrator access.");
    const twoAdmins = [...world(), user("admin2", { roles: ["student", "admin"] })];
    const removed = removeRole(twoAdmins, ADMIN, "admin2", "admin");
    assert.ok(removed.ok);
    assert.deepEqual(removed.users.find((u) => u.id === "admin2")!.roles, ["student"]);
  });

  it("removes instructor access but keeps the instructor's courses", () => {
    const users = world().map((u) => (u.id === "grace" ? { ...u, createdCourses: 2, publishedCourses: 1 } : u));
    const removed = removeRole(users, ADMIN, "grace", "instructor");
    assert.ok(removed.ok);
    const grace = removed.users.find((u) => u.id === "grace")!;
    assert.deepEqual([grace.roles, grace.createdCourses, grace.publishedCourses], [["student"], 2, 1]);
    assert.equal(removed.audit.previousValue, "student, instructor");
  });
});
