"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FaShoppingCart, FaTrashAlt } from "react-icons/fa";
import { Toaster, toast } from "react-hot-toast";

const CartPage = () => {
  const { data: session } = useSession();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCart = async () => {
    try {
      setLoading(true);
      setError("");
      const sessionUser = session?.user?.dbUser || session?.user;
      const email = sessionUser?.email;
      const user_id = sessionUser?._id || sessionUser?.id;
      if (!email && !user_id) {
        setItems([]);
        return;
      }

      const params = new URLSearchParams();
      if (email) params.set("email", email);
      if (user_id) params.set("user_id", user_id);

      const [cartRes, productsRes] = await Promise.all([
        fetch(`/api/cart?${params.toString()}`),
        fetch("/api/products"),
      ]);

      const cartData = cartRes.ok ? await cartRes.json() : null;
      const productsData = productsRes.ok ? await productsRes.json() : [];

      const productMap = new Map();
      (Array.isArray(productsData) ? productsData : []).forEach((product) => {
        const id = product._id || product.id || product.sku;
        if (id) productMap.set(String(id), product);
      });

      const cartItems = Array.isArray(cartData?.items) ? cartData.items : [];
      const hydrated = cartItems.map((item) => {
        const product = productMap.get(String(item.product_id));
        const image = Array.isArray(product?.images) ? product.images[0] : null;
        return {
          id: String(item.product_id),
          name: product?.name || "Unknown product",
          price: Number(product?.price ?? 0),
          quantity: Number(item.quantity ?? 1),
          image: product?.image || image?.url || "",
        };
      });

      setItems(hydrated);
    } catch (err) {
      setError(err.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [session?.user]);

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = items.length ? 5.99 : 0;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    return { subtotal, shipping, tax, total };
  }, [items]);

  const updateQuantity = async (id, delta) => {
    const current = items.find((item) => item.id === id);
    if (!current) return;
    const quantity = Math.max(1, current.quantity + delta);
    const sessionUser = session?.user?.dbUser || session?.user;
    const email = sessionUser?.email;
    const user_id = sessionUser?._id || sessionUser?.id;
    if (!email && !user_id) return;

    try {
      const res = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          user_id,
          productId: id,
          quantity,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.message || "Failed to update quantity");
      }
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity } : item
        )
      );
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cart:updated"));
      }
    } catch (err) {
      setError(err.message || "Failed to update quantity");
    }
  };

  const removeItem = async (id) => {
    const sessionUser = session?.user?.dbUser || session?.user;
    const email = sessionUser?.email;
    const user_id = sessionUser?._id || sessionUser?.id;
    if (!email && !user_id) return;

    try {
      setItems((prev) => prev.filter((item) => item.id !== id));
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          user_id,
          productId: id,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.message || "Failed to remove item");
      }
      toast.success("Removed from cart");
      await loadCart();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cart:updated"));
      }
    } catch (err) {
      setError(err.message || "Failed to remove item");
      toast.error(err.message || "Failed to remove item");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f6f1ea_0%,#ffffff_45%,#eef3ff_100%)]">
      <Toaster position="bottom-right" />
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
        <div className="hidden sm:block rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-5 py-4 text-white shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
                <FaShoppingCart />
              </span>
              <h1 className="text-2xl font-semibold">Shopping Cart</h1>
            </div>
            <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">
              {items.length} items
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-300 whitespace-nowrap overflow-hidden text-ellipsis">
            <Link href="/" className="hover:text-white">
              Home
            </Link>{" "}
            /{" "}
            <Link href="/cart" className="hover:text-white">
              Cart
            </Link>
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
          <div className="rounded-3xl border border-slate-100 bg-white shadow-xl">
            <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_0.4fr] gap-4 border-b border-slate-100 px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:grid">
              <span>Product</span>
              <span>Price</span>
              <span>Quantity</span>
              <span className="text-right">Subtotal</span>
              <span className="text-right">Remove</span>
            </div>

            <div className="space-y-4 md:space-y-0 md:divide-y md:divide-slate-100">
              {error && (
                <div className="px-6 py-4 text-sm text-rose-600">
                  {error}
                </div>
              )}

              {loading && (
                <div className="px-6 py-10 text-center text-sm text-slate-500">
                  Loading cart...
                </div>
              )}

              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-4 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm md:rounded-none md:border-0 md:bg-transparent md:p-0 md:px-6 md:py-6 md:shadow-none md:grid-cols-[2fr_1fr_1fr_1fr_0.4fr] md:items-center"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded-2xl object-cover shadow-sm"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {item.name}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-500 hover:border-rose-300 hover:bg-rose-50 cursor-pointer md:hidden"
                    >
                      <FaTrashAlt />
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs text-slate-600 md:contents">
                    <div className="text-sm font-semibold text-slate-900">
                      ${item.price.toFixed(2)}
                    </div>

                    <div className="flex items-center justify-center gap-2 md:justify-start">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="h-7 w-7 rounded-full border border-slate-200 text-sm text-slate-600 hover:border-slate-400"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="h-7 w-7 rounded-full border border-slate-200 text-sm text-slate-600 hover:border-slate-400"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center justify-end gap-3 text-sm font-semibold text-slate-900 md:text-right">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>

                    <div className="hidden items-center justify-end md:flex">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-rose-500 hover:border-rose-300 hover:bg-rose-50 cursor-pointer"
                        aria-label="Remove"
                        title="Remove"
                      >
                        <FaTrashAlt />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {!loading && items.length === 0 && (
                <div className="px-6 py-10 text-center text-sm text-slate-500">
                  Your cart is empty.
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
              <Link
                href="/shop"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:border-slate-400"
              >
                Continue Shopping
              </Link>
              <button
                type="button"
                onClick={async () => {
                  const sessionUser = session?.user?.dbUser || session?.user;
                  const email = sessionUser?.email;
                  const user_id = sessionUser?._id || sessionUser?.id;
                  if (!email && !user_id) return;
                  try {
                    const res = await fetch("/api/cart", {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email, user_id }),
                    });
                    if (!res.ok) {
                      const data = await res.json();
                      throw new Error(data?.message || "Failed to clear cart");
                    }
                    setItems([]);
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new Event("cart:updated"));
                    }
                  } catch (err) {
                    setError(err.message || "Failed to clear cart");
                  }
                }}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:border-slate-400 cursor-pointer"
              >
                Clear Cart
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl">
            <h2 className="text-base font-semibold text-slate-900">
              Order Summary
            </h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">
                  ${totals.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-slate-900">
                  ${totals.shipping.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tax</span>
                <span className="font-semibold text-slate-900">
                  ${totals.tax.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-slate-100 pt-3 text-base font-semibold text-slate-900">
                <div className="flex items-center justify-between">
                  <span>Total</span>
                  <span>${totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button className="mt-6 w-full rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-200/60 hover:bg-rose-600">
              Proceed to Checkout
            </button>

            <div className="mt-5 text-center text-xs text-slate-400">OR</div>

            <div className="mt-4 flex items-center gap-2">
              <input
                placeholder="Coupon code"
                className="w-full rounded-full border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-rose-400 focus:outline-none"
              />
              <button className="rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-600">
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
