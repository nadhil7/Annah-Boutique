"use client";

import * as React from "react";
import Link from "next/link";
import {
  Instagram,
  Facebook,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Send,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";
import { siteConfig } from "@/config/site";

const shopLinks = [
  { label: "New Arrivals", href: "/collection/new-arrivals" },
  { label: "Collections", href: "/collections" },
  { label: "All Categories", href: "/shop" },
  { label: "Bestsellers", href: "/collection/bestsellers" },
];

const infoLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Returns & Exchange", href: "/returns" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export default function Footer() {
  const [email, setEmail] = React.useState("");
  const { toast } = useToast();

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Thanks for subscribing!",
      description: "You're now part of the Annah Circle.",
    });
    setEmail("");
  };

  const waLink = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    "Hi Annah Boutique, I'd love to know more!"
  )}`;

  return (
    <footer className="bg-cream-deep/60 border-t border-border mt-auto">
      <div className="container-editorial py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div className="space-y-5">
            <div>
              <Link href="/" className="flex flex-col items-start">
                <span className="font-script text-3xl text-gold leading-none">
                  {siteConfig.name}
                </span>
                <span className="font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-1">
                  Timeless Indian Elegance
                </span>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Handpicked ethnic wear for the modern Indian woman. Crafted with
              love, delivered with care across India.
            </p>
            <div className="space-y-3 text-sm">
              <a
                href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
                className="flex items-start gap-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="w-4 h-4 mt-0.5 shrink-0 text-gold" />
                <span>{siteConfig.phone}</span>
              </a>
              <a
                href={`mailto:${siteConfig.email}`}
                className="flex items-start gap-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="w-4 h-4 mt-0.5 shrink-0 text-gold" />
                <span>{siteConfig.email}</span>
              </a>
              <div className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gold" />
                <span>{siteConfig.address}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-[0.15em] text-foreground mb-5">
              Shop
            </h4>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-[0.15em] text-foreground mb-5">
              Information
            </h4>
            <ul className="space-y-3">
              {infoLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="font-display text-sm font-semibold uppercase tracking-[0.15em] text-foreground mt-8 mb-4">
              Follow Us
            </h4>
            <div className="flex items-center gap-3">
              <a
                href={siteConfig.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={siteConfig.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-[0.15em] text-foreground mb-2">
              Join the Annah Circle
            </h4>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              Subscribe for exclusive early access to new arrivals, special
              offers, and styling inspirations.
            </p>
            <form onSubmit={handleNewsletter} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-11 bg-background/50"
                />
              </div>
              <Button
                type="submit"
                variant="gold-outline"
                size="lg"
                className="w-full h-11"
              >
                <Send className="w-4 h-4" />
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-14">
          <div className="gold-underline" />
        </div>

        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            © {new Date().getFullYear()} {siteConfig.name}. Crafted with
            <Heart className="w-3.5 h-3.5 text-destructive fill-destructive" />
            in India. All rights reserved.
          </p>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-2">
              Demo checkout only
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
