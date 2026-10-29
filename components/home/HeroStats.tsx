// Placeholder figures — replace with real data once the platform has it.
const stats = [
  { value: "10K+", label: "Learners" },
  { value: "500+", label: "Courses" },
  { value: "2K+", label: "Library Resources" },
  { value: "50+", label: "Expert Instructors" },
];

export default function HeroStats() {
  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white/70 shadow-soft backdrop-blur-sm sm:mt-14 lg:mt-20">
      <dl className="grid grid-cols-2 md:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex flex-col items-center gap-1 px-4 py-6 text-center sm:py-7 ${
              i % 2 === 1 ? "border-l border-slate-200" : ""
            } ${i >= 2 ? "border-t border-slate-200 md:border-t-0" : ""} ${
              i === 2 ? "md:border-l" : ""
            }`}
          >
            <dt className="order-2 text-sm font-medium text-slate-600">
              {stat.label}
            </dt>
            <dd className="order-1 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
