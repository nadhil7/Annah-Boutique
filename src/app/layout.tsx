import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Dancing_Script } from "next/font/google";
import "./globals.css";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsappFab from "@/components/layout/WhatsappFab";
import { Toaster } from "@/components/ui/toaster";
import { siteConfig } from "@/config/site";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const script = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-script",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "indian boutique",
    "sarees",
    "kurtis",
    "premium ethnic wear online",
    "dresses",
    "co-ord sets",
  ],
  authors: [{ name: siteConfig.name }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/logo.svg",
  },
  manifest: "/site.webmanifest",
  metadataBase: new URL(siteConfig.url),
};

export const viewport: Viewport = {
  themeColor: "hsl(var(--cream))",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-IN"
      className={`${display.variable} ${sans.variable} ${script.variable}`}
    >
      <body className="min-h-screen flex flex-col overflow-x-hidden font-sans antialiased">
        <AnnouncementBar />
        <Header />
        <main className="min-h-screen flex-1 flex flex-col">{children}</main>
        <Footer />
        <WhatsappFab />
        <Toaster />
      </body>
    </html>
  );
}
