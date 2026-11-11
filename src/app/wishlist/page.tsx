import { WishlistPageContent } from "@/components/product/WishlistPageContent";
export const dynamic = "force-dynamic";
export default function WishlistPage(){return <div className="container-editorial py-12"><p className="text-xs uppercase tracking-[.2em] text-primary">Saved for later</p><h1 className="mt-3 font-display text-5xl">Your wishlist</h1><div className="mt-8"><WishlistPageContent /></div></div>;}
