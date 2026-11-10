import type { EnrolmentRecord, Order } from "@/types/payments";

/*
 * Where orders and enrolments are kept.
 *
 * NO DATABASE IS CONFIGURED YET, so `getPaymentStore` returns null and every
 * page treats enrolment and payment as unavailable. To switch it on, choose
 * a database, create `orders` and `enrolments` tables matching
 * src/types/payments.ts (with a unique key on enrolments' student + course
 * and on orders' reference), and return an implementation of this interface.
 * Run `applyPaymentEvent` inside a transaction.
 */
export type PaymentStore = {
  findOrder(reference: string): Promise<Order | null>;
  /** The student's unpaid order for a course, if any. */
  findPendingOrder(studentId: string, courseId: string): Promise<Order | null>;
  listOrders(studentId: string): Promise<Order[]>;
  insertOrder(order: Order): Promise<void>;
  updateOrder(reference: string, changes: Partial<Order>): Promise<Order>;
  findEnrolment(studentId: string, courseId: string): Promise<EnrolmentRecord | null>;
  /** Insert or replace the one enrolment for this student and course. */
  saveEnrolment(record: EnrolmentRecord): Promise<void>;
};

export function getPaymentStore(): PaymentStore | null {
  return null;
}
