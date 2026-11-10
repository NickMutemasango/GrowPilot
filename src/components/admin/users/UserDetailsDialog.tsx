"use client";

import { useEffect, useId, useRef } from "react";
import { Ban, RotateCcw, ShieldOff, UserMinus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCertificateDate } from "@/lib/certificates/format";
import type { ManagedUser } from "@/types/admin-users";
import { AccountStatusBadge, ApplicationBadge, RoleBadge } from "./badges";
import { closeDialog } from "@/lib/ui/close-dialog";

type UserDetailsDialogProps = {
  user: ManagedUser | null;
  /** The signed-in administrator, so their own account can't be suspended or demoted. */
  actorId: string;
  onClose: () => void;
  onSuspend: (user: ManagedUser) => void;
  onReactivate: (user: ManagedUser) => void;
  onRemoveRole: (user: ManagedUser, role: "instructor" | "admin") => void;
};

/** Everything an administrator may see about one account, plus the actions allowed on it. No passwords or payment details, ever. */
export function UserDetailsDialog({ user, actorId, onClose, onSuspend, onReactivate, onRemoveRole }: UserDetailsDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (user && !dialog.open) dialog.showModal();
    if (!user && dialog.open) closeDialog(dialog);
  }, [user]);

  const isSelf = user?.id === actorId;
  const isInstructor = user?.roles.includes("instructor") ?? false;
  const isAdmin = user?.roles.includes("admin") ?? false;

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(40rem,calc(100vw-2rem))] overflow-y-auto rounded-3xl border border-line bg-surface p-0 text-ink shadow-menu backdrop:bg-ink/50"
    >
      {user && (
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 id={titleId} className="text-2xl font-bold tracking-tight break-words">
                {user.fullName}
              </h2>
              <p className="text-base break-all text-ink-muted">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              title="Close details"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-ink-muted hover:bg-secondary hover:text-ink"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          <dl className="mt-5 grid gap-x-6 gap-y-3 text-base sm:grid-cols-2">
            <Detail label="Account role">
              <span className="flex flex-wrap gap-1.5">
                {user.roles.map((role) => (
                  <RoleBadge key={role} role={role} />
                ))}
              </span>
            </Detail>
            <Detail label="Account status">
              <AccountStatusBadge status={user.status} />
            </Detail>
            <Detail label="Registration date">{formatCertificateDate(user.joinedAt)}</Detail>
            <Detail label="Enrolled courses">{user.enrolledCourses}</Detail>
            <Detail label="Completed courses">{user.completedCourses}</Detail>
            {(isInstructor || user.application) && (
              <>
                <Detail label="Created courses">{user.createdCourses}</Detail>
                <Detail label="Published courses">{user.publishedCourses}</Detail>
                <Detail label="Instructor application">
                  {user.application ? <ApplicationBadge status={user.application.status} /> : "None on record"}
                </Detail>
              </>
            )}
          </dl>
          {user.application?.rejectionReason && (
            <p className="mt-3 rounded-xl bg-canvas p-3 text-base text-ink">
              <strong className="font-semibold">Rejection reason:</strong> {user.application.rejectionReason}
            </p>
          )}

          <section aria-labelledby={`${titleId}-actions`} className="mt-6 border-t border-line pt-5">
            <h3 id={`${titleId}-actions`} className="text-lg font-bold text-ink">
              Account Actions
            </h3>
            {isSelf ? (
              <p className="mt-2 text-base text-ink-muted">
                This is your own account. You can&apos;t suspend it or remove your own administrator access.
              </p>
            ) : (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {user.status === "active" ? (
                  <Button variant="secondary" onClick={() => onSuspend(user)} className="border-[#b42318]! text-[#b42318]! hover:bg-[#FDECEA]!">
                    <Ban aria-hidden="true" className="size-5" />
                    Suspend Account
                  </Button>
                ) : (
                  <Button onClick={() => onReactivate(user)}>
                    <RotateCcw aria-hidden="true" className="size-5" />
                    Reactivate Account
                  </Button>
                )}
                {isInstructor && (
                  <Button variant="secondary" onClick={() => onRemoveRole(user, "instructor")}>
                    <UserMinus aria-hidden="true" className="size-5" />
                    Remove Instructor Access
                  </Button>
                )}
                {isAdmin && (
                  <Button variant="secondary" onClick={() => onRemoveRole(user, "admin")}>
                    <ShieldOff aria-hidden="true" className="size-5" />
                    Remove Administrator Access
                  </Button>
                )}
              </div>
            )}
            <p className="mt-4 text-sm text-ink-muted">
              Instructor access is given by approving an application. Administrator access is only given by the platform
              owner, not from this page. Suspending an account keeps its purchases, progress and certificates.
            </p>
          </section>
        </div>
      )}
    </dialog>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-line pb-2">
      <dt className="text-sm font-semibold text-ink-muted">{label}</dt>
      <dd className="font-semibold text-ink">{children}</dd>
    </div>
  );
}
