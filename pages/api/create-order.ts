// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

// This is your test secret API key.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-ignore
  apiVersion: "2022-08-01; orders_beta=v4",
});

export type Item = {
  product: string;
  quantity: number;
};

// Define/retrieve product details on backend server.
const products = [
  {
    id: "trinket_club_hat",
    name: "Trinket Club Hat",
    unit_amount: 1000,
    currency: "usd",
    tax_code: "txcd_10202000",
    tax_behavior: "exclusive" as "exclusive",
  },
];

// Generate line items using existing product information.
const generateLineItems = (items: Item[]) => {
  return items.map((item) => {
    // Add any logic needed to validate product IDs and
    // quantities here. For example: inventory checks.
    const product = products.find((p) => p.id === item.product);
    if (!product) {
      throw "Invalid product";
    }
    return {
      product_data: {
        id: item.product,
        name: product.name,
        tax_code: product.tax_code,
      },
      price_data: {
        unit_amount: product.unit_amount,
        tax_behavior: product.tax_behavior,
      },
      quantity: item.quantity,
    };
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { items }: { items?: Item[] } = req.body;

    if (!items) throw "No items";

    const lineItems = generateLineItems(items);

    const order = await stripe.orders.create({
      currency: "usd",
      line_items: lineItems,
      automatic_tax: { enabled: true },
    });

    res.status(200).json({
      clientSecret: order.client_secret,
      currency: order.currency,
      amount_subtotal: order.amount_subtotal,
      amount_total: order.amount_total,
    });
  } catch (err) {
    res.status(500).json({
      message: err,
    });
  }
}
