import type { NextPage } from "next";
import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import CheckoutForm from "../components/CheckoutForm";
import type { Item } from "./api/create-order";

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
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    (async () => {
      // The items the customer wants to buy
      const items: Item[] = [{ product: "trinket_club_hat", quantity: 1 }];

      // Create Order as soon as the page loads
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items }),
      });
      const data = await res.json();

      // React 18 runs twice in test mode, so ensure we keep the first clientSecret
      setClientSecret((c) => c || data.clientSecret);
    })();
  }, []);

  return (
    <>
      <h1>Checkout</h1>
      {clientSecret && (
        <Elements
          options={{
            clientSecret,
            appearance: {
              theme: "stripe",
            },
          }}
          stripe={stripePromise}
        >
          <CheckoutForm clientSecret={clientSecret} />
        </Elements>
      )}
    </>
  );
};

export default Page;
