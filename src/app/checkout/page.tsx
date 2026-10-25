import { CheckoutForm } from "@/components/checkout/CheckoutForm";
export const metadata={title:"Checkout"};
export default function CheckoutPage(){return <div className="container-editorial py-12"><p className="text-xs uppercase tracking-[.2em] text-primary">WhatsApp ordering</p><h1 className="mt-3 font-display text-5xl">Review your inquiry</h1><p className="mt-3 text-sm text-muted-foreground">No account or payment is required.</p><CheckoutForm/></div>;}
