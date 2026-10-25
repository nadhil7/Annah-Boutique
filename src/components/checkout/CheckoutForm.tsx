"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import { catalogFetch } from "@/lib/catalogApi";
import { formatINR } from "@/lib/utils";

export function CheckoutForm() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const clear = useCartStore((state) => state.clearCart);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      if (items.some((item) => !item.variantId)) throw new Error("Please remove old cart items and select the product variant again.");
      const result = await catalogFetch<{ whatsappUrl: string | null }>("/order-inquiries", { method: "POST", body: JSON.stringify({ items: items.map((item) => ({ productId: item.productId, variantId: item.variantId, quantity: item.quantity })), anonymousId: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : undefined }) });
      clear();
      if (result.whatsappUrl) window.location.assign(result.whatsappUrl); else router.push("/checkout/success");
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to create the inquiry"); } finally { setBusy(false); }
  }

  if (!items.length) return <div className="mt-8 rounded-xl border border-border p-8">Your bag is empty. <a className="underline" href="/shop">Shop the collection</a></div>;
  return <form onSubmit={submit} className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]"><div className="rounded-xl border border-border p-6"><h2 className="font-display text-2xl">Ready to enquire?</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">We will verify current availability and send a complete product summary to Annah Boutique on WhatsApp. You do not need a customer account.</p>{error && <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={busy} className="mt-7 rounded-full bg-[#25D366] px-6 py-3 font-medium text-white disabled:opacity-50">{busy ? "Preparing inquiry…" : "Continue on WhatsApp"}</button></div><aside className="h-fit rounded-xl bg-[#f4eee8] p-6"><h2 className="font-display text-2xl">Order summary</h2>{items.map((item) => <div key={`${item.productId}-${item.color}-${item.size}`} className="mt-3 flex justify-between gap-4 text-sm"><span>{item.name} · {item.color} · {item.size} × {item.quantity}</span><span className="whitespace-nowrap">{formatINR(item.price * item.quantity)}</span></div>)}<div className="my-5 border-t border-border" /><div className="flex justify-between font-semibold"><span>Estimated total</span><span>{formatINR(subtotal)}</span></div><p className="mt-3 text-xs text-muted-foreground">The backend reads the current database price when creating the inquiry.</p></aside></form>;
}
