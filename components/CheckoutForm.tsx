import { FormEventHandler, useEffect, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { UpdateData, UpdateParams } from "../pages/api/update-order";
import { getSystemErrorName } from "util";
import useDebounce from "../hooks/useDebounce";

const CheckoutForm = ({
  clientSecret,
}: {
  clientSecret: string;
}): JSX.Element => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [country, setCountry] = useState("NL");

  const debouncedName = useDebounce(name, 300);
  const debouncedCountry = useDebounce(country, 300);

  const [data, setData] = useState<UpdateData>({
    clientSecret: "",
    currency: "",
    amount_subtotal: "",
    amount_total: "",
  });

  useEffect(() => {
    (async () => {
      if (debouncedCountry && clientSecret) {
        const updateParams: UpdateParams = {
          clientSecret,
          billingDetails: {
            name: debouncedName,
            address: { country: debouncedCountry },
          },
        };

        // Create Order as soon as the page loads
        const res = await fetch("/api/update-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateParams),
        });
        const newData: UpdateData = await res.json();
        setData(newData);
      }
    })();
  }, [debouncedName, debouncedCountry, clientSecret]);

  const handleSubmit: FormEventHandler = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.processOrder({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: "http://localhost:3000/status",
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message || "");
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  return (
    <>
      <form id="payment-form" onSubmit={handleSubmit}>
        <h5>Billing Details</h5>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
        <label htmlFor="country">Country</label>
        <select
          id="country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="NL">Netherlands</option>
          <option value="DE">Germany</option>
          <option value="PT">Portugal</option>
          <option value="GB">United Kingdom</option>
        </select>

        <h5>Price Details</h5>
        <table>
          <tbody>
            <tr>
              <td>Subtotal</td>
              <td>${(parseInt(`${data.amount_subtotal}`) / 100).toFixed(2)}</td>
            </tr>
            <tr>
              <td>Tax</td>
              <td id="vat">
                $
                {(
                  (parseInt(`${data.amount_total}`) -
                    parseInt(`${data.amount_subtotal}`)) /
                  100
                ).toFixed(2)}
              </td>
            </tr>
            <tr>
              <td>Total</td>
              <td>${(parseInt(`${data.amount_total}`) / 100).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <h5>Payment Details</h5>
        <PaymentElement id="payment-element" />

        <button
          disabled={isLoading || !stripe || !elements || !name || !country}
          id="submit"
        >
          <span id="button-text">
            {isLoading ? (
              <div className="spinner" id="spinner"></div>
            ) : (
              "Pay now"
            )}
          </span>
        </button>

        {/* Show any error or success messages */}
        {message && <div id="payment-message">{message}</div>}
      </form>
    </>
  );
};

export default CheckoutForm;
