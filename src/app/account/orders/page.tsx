import { OrdersContent } from "@/components/account/OrdersContent";
export const metadata={title:"Order history"};
export default function OrdersPage(){return <div className="container-editorial py-12"><p className="text-xs uppercase tracking-[.2em] text-primary">Your Annah</p><h1 className="mt-3 font-display text-5xl">Order history</h1><OrdersContent/></div>;}
