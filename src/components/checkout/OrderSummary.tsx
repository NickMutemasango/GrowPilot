import Image from "next/image";
import { UserRound } from "lucide-react";
import { formatMoney } from "@/lib/payments/money";
import type { Course } from "@/types/course";
import type { CheckoutQuote } from "@/types/payments";

/** What the student is buying and exactly what they will pay. */
export function OrderSummary({ course, quote }: { course: Course; quote: CheckoutQuote }) {
  const rows = [
    { label: "Course price", value: formatMoney(quote.priceMinor, quote.currency) },
    ...(quote.fees.length
      ? quote.fees.map((fee) => ({ label: fee.label, value: formatMoney(fee.amountMinor, quote.currency) }))
      : [{ label: "Fees", value: "None" }]),
  ];

  return (
    <section aria-labelledby="summary-heading" className="rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-7">
      <h2 id="summary-heading" className="text-xl font-bold text-ink">
        Order Summary
      </h2>

      <div className="mt-5 flex gap-4">
        <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-xl bg-secondary sm:w-36">
          <Image src={course.image.src} alt={course.image.alt} fill sizes="144px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <p className="text-lg leading-snug font-bold text-ink">{course.title}</p>
          <p className="mt-1 flex items-center gap-2 text-base text-ink-muted">
            <UserRound aria-hidden="true" className="size-5 shrink-0 text-primary" />
            <span className="sr-only">Instructor: </span>
            {course.instructor.name}
          </p>
          <p className="mt-1 text-base text-ink-muted">
            {course.duration} · {course.level}
          </p>
        </div>
      </div>

      <dl className="mt-6 divide-y divide-line border-y border-line">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4 py-3 text-lg">
            <dt className="text-ink-muted">{row.label}</dt>
            <dd className="font-semibold text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <p className="text-xl font-bold text-ink">Total to pay</p>
        <p className="text-3xl font-bold text-ink">
          {formatMoney(quote.totalMinor, quote.currency)}
          <span className="ml-1.5 text-base font-semibold text-ink-muted">{quote.currency}</span>
        </p>
      </div>
      <p className="mt-2 text-base text-ink-muted">One payment. No subscription and no hidden charges.</p>
    </section>
  );
}
