"use client";

import * as React from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function WhatsappFab() {
  const [pulse, setPulse] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPulse(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  const waLink = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    "Hi Annah Boutique, I'd love to know more!"
  )}`;

  return (
    <Link
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className={`fixed bottom-5 right-5 z-50 rounded-full p-3 bg-green-500 hover:bg-green-600 text-white shadow-premium transition-all duration-300 hover:-translate-y-1 ${
        pulse ? "animate-pulse-ring" : ""
      }`}
    >
      <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
    </Link>
  );
}
