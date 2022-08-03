import type { NextPage } from "next";
import Link from "next/link";

const Page: NextPage = () => {
  return (
    <div>
      <h1>Home</h1>
      <Link href="/checkout">
        <a>Checkout</a>
      </Link>
    </div>
  );
};

export default Page;
