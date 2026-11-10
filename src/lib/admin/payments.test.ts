import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AdminTransaction, TransactionFilters } from "@/types/admin-payments";
import {
  byNewestTransaction,
  filterTransactions,
  paymentMethodLabels,
  summarisePayments,
  totalsByCurrency,
  transactionStatusLabels,
} from "./payments.ts";

const NO_FILTERS: TransactionFilters = { query: "", status: "all" };

function transaction(id: string, changes: Partial<AdminTransaction> = {}): AdminTransaction {
  return {
    id,
    studentId: "u-mary",
    studentName: "Mary Chikwanha",
    studentEmail: "mary.c@example.com",
    courseId: "c-003",
    courseTitle: "Microsoft Excel Made Easy",
    courseCategory: "digital-skills",
    coursePriceMinor: 2900,
    amountMinor: 2900,
    currency: "USD",
    paymentMethod: "card",
    status: "paid",
    createdAt: "2026-11-05T09:12:00Z",
    ...changes,
  };
}

describe("transactionStatusLabels", () => {
  it('shows a paid transaction as "Successful"', () => {
    assert.equal(transactionStatusLabels.paid, "Successful");
  });

  it("has a label for every status the rest of the project uses", () => {
    assert.deepEqual(Object.keys(transactionStatusLabels).sort(), [
      "cancelled",
      "failed",
      "paid",
      "pending",
      "refunded",
    ]);
  });
});

describe("paymentMethodLabels", () => {
  it("marks every method as a demonstration", () => {
    for (const label of Object.values(paymentMethodLabels)) assert.ok(label.includes("(Demo)"), label);
  });
});

describe("filterTransactions", () => {
  const rows = [
    transaction("GP-TXN-001"),
    transaction("GP-TXN-002", { studentName: "Samuel Ochieng", courseTitle: "Starting a Small Business", status: "pending" }),
    transaction("GP-TXN-003", { studentName: "Tom Wilson", courseTitle: "Social Media Marketing", status: "refunded" }),
  ];

  const ids = (filters: Partial<TransactionFilters>) =>
    filterTransactions(rows, { ...NO_FILTERS, ...filters }).map((row) => row.id);

  it("returns everything when nothing is searched or filtered", () => {
    assert.equal(filterTransactions(rows, NO_FILTERS).length, 3);
  });

  it("searches by transaction reference", () => {
    assert.deepEqual(ids({ query: "txn-002" }), ["GP-TXN-002"]);
  });

  it("searches by student name, ignoring case", () => {
    assert.deepEqual(ids({ query: "SAMUEL" }), ["GP-TXN-002"]);
  });

  it("searches by course name, matching part of a word", () => {
    assert.deepEqual(ids({ query: "social" }), ["GP-TXN-003"]);
  });

  it("filters by status", () => {
    assert.deepEqual(ids({ status: "refunded" }), ["GP-TXN-003"]);
  });

  it("applies the search and the status filter together", () => {
    assert.deepEqual(ids({ query: "tom", status: "refunded" }), ["GP-TXN-003"]);
    assert.deepEqual(ids({ query: "tom", status: "paid" }), []);
  });

  it("finds nothing for a search that matches nothing", () => {
    assert.deepEqual(ids({ query: "nobody at all" }), []);
  });
});

describe("summarisePayments", () => {
  it("counts the total and each status from the transactions themselves", () => {
    const summary = summarisePayments([
      transaction("a"),
      transaction("b"),
      transaction("c", { status: "pending" }),
      transaction("d", { status: "failed" }),
      transaction("e", { status: "cancelled" }),
      transaction("f", { status: "refunded" }),
    ]);
    assert.deepEqual(summary, { total: 6, successful: 2, pending: 1, failed: 1, refunded: 1 });
  });

  it("is all zeros for an empty list", () => {
    assert.deepEqual(summarisePayments([]), { total: 0, successful: 0, pending: 0, failed: 0, refunded: 0 });
  });
});

describe("totalsByCurrency", () => {
  it("adds up successful payments only", () => {
    const totals = totalsByCurrency([
      transaction("a", { amountMinor: 2900 }),
      transaction("b", { amountMinor: 1900 }),
      transaction("c", { amountMinor: 4900, status: "pending" }),
      transaction("d", { amountMinor: 3900, status: "failed" }),
      transaction("e", { amountMinor: 1900, status: "refunded" }),
      transaction("f", { amountMinor: 2900, status: "cancelled" }),
    ]);
    assert.deepEqual(totals, [{ currency: "USD", amountMinor: 4800 }]);
  });

  it("never adds two currencies together", () => {
    const totals = totalsByCurrency([
      transaction("a", { amountMinor: 2900 }),
      // A second currency can't exist today, but the rule must hold the day it can.
      { ...transaction("b", { amountMinor: 1000 }), currency: "EUR" as AdminTransaction["currency"] },
    ]);
    assert.deepEqual(totals, [
      { currency: "EUR", amountMinor: 1000 },
      { currency: "USD", amountMinor: 2900 },
    ]);
  });

  it("gives nothing for a list with no successful payments", () => {
    assert.deepEqual(totalsByCurrency([transaction("a", { status: "failed" })]), []);
  });
});

describe("byNewestTransaction", () => {
  it("puts the most recent transaction first", () => {
    const rows = [
      transaction("old", { createdAt: "2026-10-01T00:00:00Z" }),
      transaction("new", { createdAt: "2026-11-05T00:00:00Z" }),
    ];
    assert.deepEqual([...rows].sort(byNewestTransaction).map((row) => row.id), ["new", "old"]);
  });
});
