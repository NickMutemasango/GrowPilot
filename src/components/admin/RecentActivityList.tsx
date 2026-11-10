import { CreditCard, FilePlus2, Inbox, UserCheck, UserPlus } from "lucide-react";
import type { ActivityItem } from "@/lib/admin/service";
import { AdminEmptyState } from "./AdminEmptyState";

const icons: Record<ActivityItem["kind"], typeof UserPlus> = {
  account: UserPlus,
  course: FilePlus2,
  enrolment: UserCheck,
  payment: CreditCard,
};

const when = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" });

/** "Recent Platform Activity": what happened, and when. */
export function RecentActivityList({ items, sample }: { items: ActivityItem[]; sample: boolean }) {
  return (
    <section aria-labelledby="activity-heading" className="flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-header sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="activity-heading" className="text-xl font-bold text-ink">
          Recent Platform Activity
        </h2>
        {sample && items.length > 0 && <SampleTag />}
      </div>
      {items.length === 0 ? (
        <div className="mt-4">
          <AdminEmptyState icon={Inbox} title="No recent activity to display." />
        </div>
      ) : (
        <ol className="mt-4 divide-y divide-line">
          {items.map((item) => {
            const Icon = icons[item.kind];
            return (
              <li key={item.id} className="flex items-start gap-3 py-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-base text-ink">{item.text}</p>
                  <time dateTime={item.at} className="text-sm text-ink-muted">
                    {when.format(new Date(item.at))} UTC
                  </time>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

export function SampleTag() {
  return <span className="rounded-full bg-accent/35 px-2.5 py-0.5 text-sm font-semibold text-[#6b4e00]">Sample</span>;
}
