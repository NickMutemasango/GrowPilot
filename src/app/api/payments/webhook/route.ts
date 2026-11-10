import { getPaymentProvider } from "@/lib/payments/provider";
import { processVerifiedPayment } from "@/lib/payments/service";
import { getPaymentStore } from "@/lib/payments/store";

/*
 * Payment notifications from the provider (server to server). This is what
 * confirms payments and grants course access. The provider integration
 * verifies each notification's signature; anything that doesn't verify is
 * refused. Repeated notifications are safe (see applyPaymentEvent).
 */
export async function POST(request: Request) {
  const provider = getPaymentProvider();
  const store = getPaymentStore();
  if (!provider || !store) {
    return Response.json({ error: "Payments are not configured." }, { status: 503 });
  }

  const event = await provider.verifyNotification(request);
  if (!event) return Response.json({ error: "Notification could not be verified." }, { status: 401 });

  const result = await processVerifiedPayment(store, event);
  switch (result.kind) {
    case "unknown-order":
      return Response.json({ error: "Unknown order." }, { status: 404 });
    case "rejected":
      // Amount or currency doesn't match the order: never grant access. Needs a person to review.
      console.error(`Payment rejected for order ${event.orderReference}: ${result.reason}`);
      return Response.json({ error: "Payment does not match the order." }, { status: 422 });
    default:
      return Response.json({ received: true });
  }
}
