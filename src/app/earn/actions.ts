"use server";

import { redirect } from "next/navigation";
import { rewardsPolicy } from "@/config/rewards";
import { getCurrentStudent, loginHref } from "@/lib/auth/session";
import { validateEmail, validateFullName } from "@/lib/auth/validation";
import { getCourseBySlug } from "@/lib/courses";
import { getPaymentStore } from "@/lib/payments/store";
import { applyForAffiliate, redeemReward } from "@/lib/rewards/rules";
import { getRewardsStore } from "@/lib/rewards/store";

/*
 * Affiliate applications and reward claims. The student always comes from
 * the server session; the form only says what they chose.
 */

export type FormState = { message: string | null; errors: { fullName?: string; email?: string } };

export async function applyAffiliateAction(_state: FormState, formData: FormData): Promise<FormState> {
  const fullName = String(formData.get("fullName") ?? "");
  const email = String(formData.get("email") ?? "");
  const reason = String(formData.get("reason") ?? "").slice(0, 1000);
  const errors = { fullName: validateFullName(fullName), email: validateEmail(email) };
  if (errors.fullName || errors.email) return { message: null, errors };

  const student = await getCurrentStudent();
  if (!student) redirect(loginHref("/affiliate/apply"));

  const store = getRewardsStore();
  if (!store) {
    return { message: "Affiliate applications aren't open yet. Nothing was sent. Please check back soon.", errors: {} };
  }

  await applyForAffiliate(store, student.id, { fullName, email, reason });
  redirect("/affiliate/apply");
}

export async function redeemRewardAction(
  _state: { message: string | null },
  formData: FormData,
): Promise<{ message: string | null }> {
  const student = await getCurrentStudent();
  if (!student) redirect(loginHref("/refer#choose-course"));

  const rewards = getRewardsStore();
  const payments = getPaymentStore();
  const course = await getCourseBySlug(String(formData.get("courseSlug") ?? ""));
  if (!rewards || !payments || !course) {
    return { message: "We couldn't claim your free course just now. Your reward is still saved. Please try again later." };
  }

  // In a real database, run the claim and the enrolment in one transaction.
  const result = await redeemReward(rewards, String(formData.get("rewardId") ?? ""), student.id, course, rewardsPolicy);
  switch (result.kind) {
    case "not-found":
    case "not-available":
      return { message: "This reward has already been used, or it isn't available." };
    case "not-eligible":
      return { message: "That course can't be chosen as a free-course reward. Please choose one from the list." };
  }

  await payments.saveEnrolment({
    studentId: student.id,
    courseId: course.id,
    courseSlug: course.slug,
    status: "active",
    enrolledAt: new Date().toISOString(),
    paymentStatus: "free",
    paymentReference: String(formData.get("rewardId")),
    amountMinor: 0,
    currency: null,
  });
  redirect(`/enrolled/${course.slug}`);
}
