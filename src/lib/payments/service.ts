import { getCurrentStudent } from "@/lib/auth/session";
import { getAllCourses } from "@/lib/courses";
import { getFirstLesson } from "@/lib/learning";
import type { Course } from "@/types/course";
import { updateRewardsForOrder } from "@/lib/rewards/service";
import type { Order, Purchase, VerifiedPaymentEvent } from "@/types/payments";
import { applyPaymentEvent, hasCourseAccess, type PaymentEventResult } from "./enrolment";
import { getPaymentProvider } from "./provider";
import { getPaymentStore, type PaymentStore } from "./store";

/*
 * What pages ask about payments and enrolment. Server-only. Every answer is
 * based on the signed-in student (from the server session) and the stored
 * records, never on anything the browser says.
 */

/** Whether online payment can be taken right now, and how. */
export function getPaymentOptions(): { available: boolean; providerName: string | null; methods: string[] } {
  const provider = getPaymentProvider();
  const ready = provider !== null && getPaymentStore() !== null;
  return { available: ready, providerName: provider?.name ?? null, methods: ready ? provider.methods : [] };
}

/** Where "Start Learning" goes: the first lesson if it can be opened, otherwise the course's lesson list. */
export async function getStartLearningHref(course: Course): Promise<string> {
  return (await getFirstLesson(course.slug))?.href ?? `/courses/${course.slug}#content`;
}

/** Whether the signed-in student already has this course. */
export async function getCourseAccess(course: Course): Promise<{ enrolled: boolean; continueHref: string }> {
  const continueHref = await getStartLearningHref(course);
  const student = await getCurrentStudent();
  const store = getPaymentStore();
  if (!student || !store) return { enrolled: false, continueHref };
  return { enrolled: await hasCourseAccess(store, student.id, course.id), continueHref };
}

/**
 * The student's own order, with its latest status. A pending order is
 * re-checked with the provider (server to server), because the student
 * being sent back to our site proves nothing.
 */
export async function getStudentOrder(reference: string, studentId: string, courseSlug: string): Promise<Order | null> {
  const store = getPaymentStore();
  if (!store) return null;
  const order = await store.findOrder(reference);
  // Students can only see their own orders.
  if (!order || order.studentId !== studentId || order.courseSlug !== courseSlug) return null;

  const provider = getPaymentProvider();
  if (order.status === "pending" && provider) {
    const event = await provider.fetchStatus(order);
    if (event && event.orderReference === order.reference) await processVerifiedPayment(store, event);
    return store.findOrder(reference);
  }
  return order;
}

/**
 * Applies a verified payment update, then updates any affiliate commission
 * or referral reward for the order. Both steps are safe to repeat, so a
 * duplicate notification changes nothing.
 */
export async function processVerifiedPayment(store: PaymentStore, event: VerifiedPaymentEvent): Promise<PaymentEventResult> {
  const result = await applyPaymentEvent(store, event);
  if (result.kind === "updated" || result.kind === "unchanged") {
    const order = await store.findOrder(event.orderReference);
    if (order) await updateRewardsForOrder(order);
  }
  return result;
}

/** "My Purchases": the signed-in student's paid-course orders, newest first. */
export async function getStudentPurchases(studentId: string): Promise<Purchase[]> {
  const store = getPaymentStore();
  if (!store) return [];
  const [orders, courses] = await Promise.all([store.listOrders(studentId), getAllCourses()]);
  return orders
    // Unpaid orders that were simply replaced or abandoned aren't purchases.
    .filter((order) => order.status !== "pending" || order.providerReference !== null)
    .map((order) => ({
      reference: order.reference,
      courseSlug: order.courseSlug,
      courseTitle: courses.find((course) => course.id === order.courseId)?.title ?? order.courseSlug,
      purchasedAt: order.updatedAt,
      amountMinor: order.amountMinor,
      currency: order.currency,
      status: order.status,
    }))
    .sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt));
}
