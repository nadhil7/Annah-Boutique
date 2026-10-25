import Link from "next/link";

export default function CheckoutSuccessPage() {
  return <div className="container-editorial py-20 text-center"><p className="text-xs uppercase tracking-[.24em] text-primary">Inquiry received</p><h1 className="mt-3 font-display text-5xl">Thank you</h1><p className="mx-auto mt-5 max-w-lg text-muted-foreground">Your inquiry was created successfully. We will confirm availability and ordering details with you shortly.</p><Link href="/shop" className="mt-8 inline-block rounded-full bg-[#392a25] px-6 py-3 text-white">Continue shopping</Link></div>;
}
