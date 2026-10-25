"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Home,
  ShoppingBag,
  Sparkles,
  Info,
  Phone,
  Heart,
  MessageCircle,
  ChevronRight,
} from "lucide-react";

import { siteConfig } from "@/config/site";
import { fetchCategories } from "@/lib/catalogApi";

const collections = [
  { label: "Wedding Edit", href: "/collection/wedding" },
  { label: "Festive Collection", href: "/collection/festive" },
  { label: "Summer Essentials", href: "/collection/summer" },
  { label: "Handloom Heritage", href: "/collection/handloom" },
];

const flatLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "Shop", href: "/shop", icon: ShoppingBag },
  { label: "New Arrivals", href: "/new-arrivals", icon: Sparkles },
  { label: "About", href: "/about", icon: Info },
  { label: "Contact", href: "/contact", icon: Phone },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
  { label: "Cart", href: "/cart", icon: ShoppingBag },
];

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const [categories, setCategories] = React.useState<Array<{ slug: string; name: string }>>([]);
  React.useEffect(() => { if (open) fetchCategories().then((items) => setCategories(items)).catch(() => setCategories([])); }, [open]);
  const waLink = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    "Hi Annah Boutique, I'd love to know more!"
  )}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[85vw] sm:w-[380px] p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 border-b border-border">
            <SheetTitle className="text-left">
              <div>
                <span className="font-script text-2xl text-gold">
                  {siteConfig.name}
                </span>
              </div>
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-2 py-4">
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="categories" className="border-none px-4">
                <AccordionTrigger className="text-sm font-semibold uppercase tracking-wider hover:no-underline py-3">
                  Categories
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1">
                    {categories.map((cat) => (
                      <li key={cat.slug}>
                        <Link
                          href={`/category/${cat.slug}`}
                          onClick={() => onOpenChange(false)}
                          className="flex items-center justify-between py-2 px-2 rounded-md text-sm text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors"
                        >
                          <span>{cat.name}</span>
                          <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-50" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="collections" className="border-none px-4">
                <AccordionTrigger className="text-sm font-semibold uppercase tracking-wider hover:no-underline py-3">
                  Collections
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1">
                    {collections.map((col) => (
                      <li key={col.href}>
                        <Link
                          href={col.href}
                          onClick={() => onOpenChange(false)}
                          className="flex items-center justify-between py-2 px-2 rounded-md text-sm text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors"
                        >
                          <span>{col.label}</span>
                          <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-50" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="border-t border-border my-4" />

            <nav className="px-4 space-y-1">
              {flatLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-3 py-2.5 px-2 rounded-md text-sm hover:bg-secondary hover:text-secondary-foreground transition-colors"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-border p-4">
            <Button
              asChild
              variant="default"
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Link
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onOpenChange(false)}
              >
                <MessageCircle className="w-5 h-5" />
                Chat on WhatsApp
              </Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
