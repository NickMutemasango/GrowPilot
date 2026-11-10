import { CircleCheck, CircleX, Inbox } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCertificateDate } from "@/lib/certificates/format";
import type { ManagedUser } from "@/types/admin-users";
import { AdminEmptyState } from "../AdminEmptyState";
import { ApplicationBadge } from "./badges";

type InstructorApplicationsProps = {
  applicants: ManagedUser[];
  onApprove: (user: ManagedUser) => void;
  onReject: (user: ManagedUser) => void;
};

/** "Instructor Applications": pending requests to teach, oldest first. */
export function InstructorApplications({ applicants, onApprove, onReject }: InstructorApplicationsProps) {
  return (
    <section aria-labelledby="applications-heading">
      <h2 id="applications-heading" className="text-2xl font-bold tracking-tight text-ink">
        Instructor Applications
      </h2>
      {applicants.length === 0 ? (
        <div className="mt-4">
          <AdminEmptyState icon={Inbox} title="No Pending Applications">
            You&apos;re all caught up! There are no instructor applications awaiting review.
          </AdminEmptyState>
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(min(100%,22rem),1fr))] gap-4">
          {applicants.map((user) => {
            const application = user.application!;
            return (
              <li key={user.id} className="flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-header">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-ink">{user.fullName}</p>
                    <p className="text-base break-all text-ink-muted">{user.email}</p>
                  </div>
                  <ApplicationBadge status={application.status} />
                </div>
                <p className="mt-3 font-semibold text-ink">{application.title}</p>
                <p className="mt-1 text-base text-ink">{application.bio}</p>
                {application.expertise.length > 0 && (
                  <ul aria-label="Areas of expertise" className="mt-3 flex flex-wrap gap-2">
                    {application.expertise.map((item) => (
                      <li key={item} className="rounded-full bg-secondary px-2.5 py-0.5 text-sm font-semibold text-primary-strong">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-3 text-sm text-ink-muted">Applied {formatCertificateDate(application.appliedAt)}</p>
                <div className="mt-auto flex flex-col gap-2 pt-4 sm:flex-row">
                  <Button onClick={() => onApprove(user)} className="w-full sm:flex-1">
                    <CircleCheck aria-hidden="true" className="size-5" />
                    Approve<span className="sr-only"> {user.fullName}</span>
                  </Button>
                  <Button variant="secondary" onClick={() => onReject(user)} className="w-full sm:flex-1">
                    <CircleX aria-hidden="true" className="size-5" />
                    Reject<span className="sr-only"> {user.fullName}</span>
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
