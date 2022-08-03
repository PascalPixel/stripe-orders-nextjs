import type { NextPage } from "next";
import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe } from "@stripe/react-stripe-js";

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  {
    betas: ["process_order_beta_1"],
    apiVersion: "2022-08-01; orders_beta=v4",
  }
);

const Page: NextPage = () => {
  return (
    <Elements stripe={stripePromise}>
      <OrderStatus />
    </Elements>
  );
};

const OrderStatus = () => {
  const stripe = useStripe();
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    (async () => {
      if (!stripe) {
        return;
      }

      const clientSecret = new URLSearchParams(window.location.search).get(
        "order_client_secret"
      );

      if (!clientSecret) return;

      const { order } = await stripe.retrieveOrder(clientSecret);
      switch (order?.payment.payment_intent?.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    })();
  }, [stripe]);

  return (
    <>
      <h1>Status</h1>
      {/* Show any error or success messages */}
      {message && <div id="payment-message">{message}</div>}
    </>
  );
};

export default Page;
