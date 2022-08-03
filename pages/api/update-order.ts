// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

// This is your test secret API key.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-ignore
  apiVersion: "2022-08-01; orders_beta=v4",
});

export type UpdateParams = {
  clientSecret?: string;
  billingDetails?: {
    name?: string;
    address?: {
      country?: string;
    };
  };
};

export type UpdateData = {
  clientSecret: string | null;
  currency: string;
  amount_subtotal: string | number;
  amount_total: string | number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { clientSecret, billingDetails }: UpdateParams = req.body;

    if (!clientSecret) throw "No clientSecret";
    if (!billingDetails) throw "No billingDetails";

    const orderId = clientSecret.split("_secret_")[0];

    const order = await stripe.orders.update(orderId, {
      billing_details: {
        name: billingDetails?.name || undefined,
        address: {
          country: billingDetails?.address?.country || undefined,
        },
      },
    });

    const updateData: UpdateData = {
      clientSecret: order.client_secret,
      currency: order.currency,
      amount_subtotal: order.amount_subtotal,
      amount_total: order.amount_total,
    };

    res.status(200).json(updateData);
  } catch (err) {
    res.status(500).json({
      message: err,
    });
  }
}
