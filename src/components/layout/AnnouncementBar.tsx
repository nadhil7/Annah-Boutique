"use client";

import Link from "next/link";
import { Truck, MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function AnnouncementBar() {
  const waLink = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    "Hi Annah Boutique, I'd love to know more!"
  )}`;

  return (
    <div className="bg-primary text-primary-foreground text-[11px] md:text-xs font-medium">
      <div className="hidden lg:block">
        <div className="container-editorial h-9 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-3.5 h-3.5" />
            <span>Free shipping on orders over ₹2,499 across India</span>
          </div>
          <Link
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp us: {siteConfig.phone}</span>
          </Link>
        </div>
      </div>

      <div className="lg:hidden overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee h-9 items-center gap-12 px-4">
          <div className="flex items-center gap-2 shrink-0">
            <Truck className="w-3.5 h-3.5" />
            <span>Free shipping on orders over ₹2,499 across India</span>
          </div>
          <Link
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 shrink-0"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp us: {siteConfig.phone}</span>
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            <Truck className="w-3.5 h-3.5" />
            <span>Free shipping on orders over ₹2,499 across India</span>
          </div>
          <Link
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 shrink-0"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp us: {siteConfig.phone}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
