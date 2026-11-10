import { BookOpen, Clock, CreditCard, GraduationCap, UserCheck, Users } from "lucide-react";
import type { AdminOverviewData, AdminStat } from "@/lib/admin/service";
import { AdminStatsCard } from "./AdminStatsCard";
import { PendingCoursesPreview } from "./PendingCoursesPreview";
import { RecentActivityList } from "./RecentActivityList";

const cards: Record<AdminStat["id"], { title: string; description: string; icon: typeof Users }> = {
  students: { title: "Total Students", description: "Registered student accounts.", icon: Users },
  instructors: { title: "Total Instructors", description: "Instructors teaching on GrowPilot.", icon: GraduationCap },
  published: { title: "Published Courses", description: "Live in the course catalogue.", icon: BookOpen },
  pending: { title: "Pending Course Approvals", description: "Submitted by instructors, waiting for review.", icon: Clock },
  purchases: { title: "Confirmed Purchases", description: "Paid course orders that were verified.", icon: CreditCard },
  enrolments: { title: "Active Enrolments", description: "Students currently enrolled in a course.", icon: UserCheck },
};

/** The admin home page. */
export function AdminOverview({ data, today }: { data: AdminOverviewData; today: string }) {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-base font-semibold text-primary">{today}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Welcome to GrowPilot Admin</h1>
        <p className="mt-2 text-lg text-ink-muted">Here&apos;s an overview of what&apos;s happening across your learning platform.</p>
      </header>

      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          Platform figures
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {data.stats.map((stat) => {
            const card = cards[stat.id];
            return <AdminStatsCard key={stat.id} {...card} value={stat.value} source={stat.source} />;
          })}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <RecentActivityList items={data.activity} sample={false} />
        <PendingCoursesPreview courses={data.pending} sample={false} />
      </div>
    </div>
  );
}
