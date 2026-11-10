import type { EnrolmentRecord, Order } from "@/types/payments";
import type { PaymentStore } from "./store";

/** In-memory PaymentStore for automated tests only. Never use it in the app. */
export function createMemoryPaymentStore(): PaymentStore {
  const orders = new Map<string, Order>();
  const enrolments = new Map<string, EnrolmentRecord>();
  const key = (studentId: string, courseId: string) => `${studentId}:${courseId}`;

  return {
    async findOrder(reference) {
      return orders.get(reference) ?? null;
    },
    async findPendingOrder(studentId, courseId) {
      return (
        [...orders.values()].find(
          (order) => order.studentId === studentId && order.courseId === courseId && order.status === "pending",
        ) ?? null
      );
    },
    async listOrders(studentId) {
      return [...orders.values()].filter((order) => order.studentId === studentId);
    },
    async insertOrder(order) {
      if (orders.has(order.reference)) throw new Error("Duplicate order reference");
      orders.set(order.reference, order);
    },
    async updateOrder(reference, changes) {
      const current = orders.get(reference);
      if (!current) throw new Error("Unknown order");
      const next = { ...current, ...changes };
      orders.set(reference, next);
      return next;
    },
    async findEnrolment(studentId, courseId) {
      return enrolments.get(key(studentId, courseId)) ?? null;
    },
    async saveEnrolment(record) {
      enrolments.set(key(record.studentId, record.courseId), record);
    },
  };
}
