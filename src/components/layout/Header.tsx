"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, Heart, ShoppingBag, X } from "lucide-react";
import MobileNav from "@/components/layout/MobileNav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { siteConfig } from "@/config/site";

const brand = siteConfig;

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/collections" },
  { label: "New Arrivals", href: "/collection/new-arrivals" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

function IconBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center leading-none">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const router = useRouter();
  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);

  if (pathname.startsWith("/admin")) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur bg-background/85 border-b border-border supports-[backdrop-filter]:bg-background/60">
      <div className="container-editorial">
        <div className="h-16 lg:h-20 grid grid-cols-[auto_1fr_auto] items-center">
          <div className={`${searchOpen ? "hidden" : "flex"} lg:hidden items-center`}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} />
          </div>

          <Link
            href="/"
            className={`${searchOpen ? "hidden" : "flex"} lg:hidden justify-self-center flex-col items-center whitespace-nowrap text-center`}
          >
            <span className="font-display text-xl font-semibold text-foreground tracking-tight">
              {brand.name}
            </span>
          </Link>

          <div className="hidden lg:flex flex-row items-center gap-10 flex-1">
            <Link href="/" className="flex flex-col items-start shrink-0">
              <span className="font-script text-2xl text-gold leading-none">
                {siteConfig.name}
              </span>
              <span className="font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-0.5">
                Timeless Indian Elegance
              </span>
            </Link>

            <nav className={`${searchOpen ? "hidden" : "flex"} items-center gap-7`} aria-hidden={searchOpen}>
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                >
                  <Link
                    href={link.href}
                    className="text-[12px] font-semibold uppercase tracking-[0.12em] text-foreground/80 hover:text-foreground transition-colors inline-flex items-center gap-1 py-1 relative group"
                  >
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-gold transition-all group-hover:w-full" />
                  </Link>
                </div>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1 lg:gap-2">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex h-10 w-[min(360px,calc(100vw-2rem))] items-center rounded-full border border-gold bg-background px-3 shadow-soft animate-in fade-in slide-in-from-right-2 lg:w-[360px]">
                <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                <Input autoFocus placeholder="Search sarees, kurtis, dresses…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-8 min-w-0 flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0" />
                <button type="button" onClick={() => { setSearchQuery(""); setSearchOpen(false); }} aria-label="Close search" className="ml-2 rounded-full p-1 text-muted-foreground hover:bg-secondary"><X className="h-4 w-4" /></button>
              </form>
            ) : (
              <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setSearchOpen(true)}><Search className="w-5 h-5" /></Button>
            )}

            <Link href="/wishlist" className={searchOpen ? "hidden lg:block" : "block"}>
              <Button variant="ghost" size="icon" aria-label="Wishlist" className="relative">
                <Heart className="w-5 h-5" />
                <IconBadge count={wishlistCount} />
              </Button>
            </Link>

            <Link href="/cart" className={searchOpen ? "hidden lg:block" : "block"}>
              <Button variant="ghost" size="icon" aria-label="Cart" className="relative">
                <ShoppingBag className="w-5 h-5" />
                <IconBadge count={cartCount} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
