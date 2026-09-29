"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, Heart, User, ShoppingBag, ChevronDown } from "lucide-react";
import MobileNav from "@/components/layout/MobileNav";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { siteConfig } from "@/config/site";

const brand = siteConfig;

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  {
    label: "Categories",
    href: "/shop",
    dropdown: [
      { label: "Sarees", href: "/category/sarees" },
      { label: "Kurtis", href: "/category/kurtis" },
      { label: "Dresses", href: "/category/dresses" },
      { label: "Co-ord Sets", href: "/category/co-ord-sets" },
      { label: "Tops", href: "/category/tops" },
      { label: "Festive Wear", href: "/category/festive-wear" },
    ],
  },
  { label: "New Arrivals", href: "/collection/new-arrivals" },
  {
    label: "Collections",
    href: "/collections",
    dropdown: [
      { label: "Festive Edit", href: "/collection/festive-edit" },
      { label: "Party Wear Edit", href: "/collection/party-wear-edit" },
      { label: "Summer Edit", href: "/collection/summer-edit" },
      { label: "Bestsellers", href: "/collection/bestsellers" },
    ],
  },
  { label: "Offers", href: "/collection/bestsellers" },
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
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const router = useRouter();
  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);

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
        <div className="h-16 lg:h-20 flex items-center justify-between">
          <div className="lg:hidden flex items-center">
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
            className="lg:hidden absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
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

            <nav className="flex items-center gap-7">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() =>
                    link.dropdown && setOpenDropdown(link.label)
                  }
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className="text-[12px] font-semibold uppercase tracking-[0.12em] text-foreground/80 hover:text-foreground transition-colors inline-flex items-center gap-1 py-1 relative group"
                  >
                    {link.label}
                    {link.dropdown && (
                      <ChevronDown className="w-3 h-3 shrink-0 opacity-60" />
                    )}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-gold transition-all group-hover:w-full" />
                  </Link>

                  {link.dropdown && openDropdown === link.label && (
                    <div className="absolute top-full left-0 pt-2 min-w-[220px]">
                      <div className="bg-popover border border-border rounded-md shadow-premium p-2 overflow-hidden animate-fade-in">
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="block px-3 py-2 text-sm rounded-sm hover:bg-secondary hover:text-secondary-foreground transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1 lg:gap-2">
            <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Search">
                  <Search className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>Search</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      autoFocus
                      placeholder="Search sarees, kurtis, dresses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-11 text-base"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" variant="gold-outline">
                      Search
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Link href="/wishlist">
              <Button variant="ghost" size="icon" aria-label="Wishlist" className="relative">
                <Heart className="w-5 h-5" />
                <IconBadge count={wishlistCount} />
              </Button>
            </Link>

            <div className="hidden sm:block">
              <Link href="/login">
                <Button variant="ghost" size="icon" aria-label="Account">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            <Link href="/cart">
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
