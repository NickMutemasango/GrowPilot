import Image from "next/image";
import { ArrowLeft, ArrowRight, CircleCheck, CircleX, Clock, LayoutDashboard, RotateCcw, SearchX, Undo2 } from "lucide-react";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";
import type { Course } from "@/types/course";

export type PaymentView = "paid" | "pending" | "failed" | "cancelled" | "not-found";

type PaymentStatusViewProps = {
  view: PaymentView;
  course: Course;
  /** Where "Start Learning" goes. */
  startHref: string;
  /** Shown when known, e.g. "$29.00 USD". */
  amountLabel?: string;
  reference?: string;
  /** Link that re-checks a pending payment. */
  refreshHref?: string;
};

const views: Record<PaymentView, { icon: typeof CircleCheck; tone: string; title: string; text: string }> = {
  paid: {
    icon: CircleCheck,
    tone: "bg-secondary text-primary",
    title: "Payment Successful!",
    text: "Congratulations! You're now enrolled in your course and ready to begin learning.",
  },
  pending: {
    icon: Clock,
    tone: "bg-accent/30 text-[#6b4e00]",
    title: "We're Confirming Your Payment",
    text: "Your payment is being processed. We'll update your enrolment when it's confirmed. This usually takes a few minutes.",
  },
  failed: {
    icon: CircleX,
    tone: "bg-[#FDECEA] text-[#9A3412]",
    title: "Payment Wasn't Completed",
    text: "Your payment could not be completed. Please try again or choose another available payment method.",
  },
  cancelled: {
    icon: Undo2,
    tone: "bg-secondary text-primary",
    title: "Payment Cancelled",
    text: "You cancelled the payment, so you have not been charged. You can come back and buy the course whenever you're ready.",
  },
  "not-found": {
    icon: SearchX,
    tone: "bg-secondary text-primary",
    title: "We Couldn't Find This Payment",
    text: "We couldn't find a payment from this link. If money has left your account, please contact us with the reference from your payment confirmation.",
  },
};

/** The result of a payment, only ever based on the status the server confirmed. */
export function PaymentStatusView({ view, course, startHref, amountLabel, reference, refreshHref }: PaymentStatusViewProps) {
  const { icon: Icon, tone, title, text } = views[view];

  const actions: Record<PaymentView, ReactNode> = {
    paid: (
      <>
        <ButtonLink href={startHref} size="lg" className="w-full sm:w-auto">
          Start Learning
          <ArrowRight aria-hidden="true" className="size-5" />
        </ButtonLink>
        <DashboardLink />
      </>
    ),
    pending: (
      <>
        {refreshHref && (
          <ButtonLink href={refreshHref} size="lg" className="w-full sm:w-auto">
            <RotateCcw aria-hidden="true" className="size-5" />
            Check Again
          </ButtonLink>
        )}
        <DashboardLink />
      </>
    ),
    failed: (
      <>
        <ButtonLink href={`/checkout/${course.slug}`} size="lg" className="w-full sm:w-auto">
          <RotateCcw aria-hidden="true" className="size-5" />
          Try Again
        </ButtonLink>
        <BackToCourse slug={course.slug} />
      </>
    ),
    cancelled: (
      <>
        <BackToCourse slug={course.slug} primary />
        <ButtonLink href={`/checkout/${course.slug}`} variant="secondary" size="lg" className="w-full sm:w-auto">
          Try Again
        </ButtonLink>
      </>
    ),
    "not-found": (
      <>
        <BackToCourse slug={course.slug} primary />
        <DashboardLink />
      </>
    ),
  };

  return (
    <section aria-labelledby="status-heading" className="mx-auto max-w-2xl text-center">
      <span className={`mx-auto flex size-14 items-center justify-center rounded-full ${tone}`}>
        <Icon aria-hidden="true" className="size-10" />
      </span>
      <h1 id="status-heading" className="mt-6 text-4xl font-bold tracking-tight text-ink">
        {title}
      </h1>
      <p className="mt-4 text-xl leading-relaxed text-ink-muted">{text}</p>

      <div className="mt-8 flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 text-left">
        <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-xl bg-secondary">
          <Image src={course.image.src} alt="" fill sizes="96px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold text-ink">{course.title}</p>
          {amountLabel && <p className="text-base text-ink-muted">Amount: {amountLabel}</p>}
          {reference && <p className="text-base break-all text-ink-muted">Reference: {reference}</p>}
        </div>
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">{actions[view]}</div>
    </section>
  );
}

function DashboardLink() {
  return (
    <ButtonLink href="/dashboard" variant="secondary" size="lg" className="w-full sm:w-auto">
      <LayoutDashboard aria-hidden="true" className="size-5" />
      Go to Dashboard
    </ButtonLink>
  );
}

function BackToCourse({ slug, primary }: { slug: string; primary?: boolean }) {
  return (
    <ButtonLink href={`/courses/${slug}`} variant={primary ? "primary" : "secondary"} size="lg" className="w-full sm:w-auto">
      <ArrowLeft aria-hidden="true" className="size-5" />
      Back to Course
    </ButtonLink>
  );
}
