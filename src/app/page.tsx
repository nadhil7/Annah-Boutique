import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Instagram } from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { SectionHeading } from "@/components/home/SectionHeading";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getProducts } from "@/services/productService";
import { fetchCategories } from "@/lib/catalogApi";
import { collections } from "@/data/collections";
import { heroBanner } from "@/data/banners";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, categories] = await Promise.all([getProducts(), fetchCategories()]);
  const fresh = products.filter((p) => p.isNew).slice(0, 4);
  const popular = products.filter((p) => p.isFeatured).slice(0, 4);
  return <>
    <Hero data={heroBanner} />
    <section className="container-editorial py-16 md:py-24">
      <SectionHeading eyebrow="Find your feeling" heading="Shop by occasion" subheading="Thoughtfully chosen pieces for every version of you." />
      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
        {categories.map((c) => <Link key={c.slug} href={`/category/${c.slug}`} className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-secondary">
          {c.image ? <Image src={c.image} alt={c.name} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="absolute inset-0 bg-[#d7c2b7]" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <span className="absolute bottom-4 left-4 font-display text-2xl text-white">{c.name}</span>
        </Link>)}
      </div>
      {!categories.length && <p className="mt-8 rounded-xl border border-border p-8 text-center text-muted-foreground">Categories will appear here once the admin adds them.</p>}
    </section>
    <section className="bg-[#f4eee8] py-16 md:py-24"><div className="container-editorial">
      <SectionHeading eyebrow="Just arrived" heading="New season, new stories" ctaHref="/collection/new-arrivals" ctaLabel="View all" />
      <div className="mt-10"><ProductGrid products={fresh} /></div>
    </div></section>
    <section className="container-editorial py-16 md:py-24"><div className="grid md:grid-cols-2 overflow-hidden rounded-2xl bg-[#372a25] text-white">
      <div className="flex flex-col justify-center p-8 md:p-14"><p className="text-xs uppercase tracking-[.24em] text-[#d8b98a]">The festive edit</p><h2 className="mt-4 font-display text-4xl md:text-6xl">Made for the moments that matter.</h2><p className="mt-5 max-w-md text-white/70">Heritage craft, thoughtful details and silhouettes made to be remembered.</p><Link href="/collection/festive-edit" className="mt-8 inline-flex items-center gap-2 text-sm">Explore the edit <ArrowRight size={16}/></Link></div>
      <div className="relative min-h-80"><Image src="/banners/festive-editorial.svg" alt="Festive Indian wear editorial" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" /></div>
    </div></section>
    <section className="bg-[#f4eee8] py-16 md:py-24"><div className="container-editorial"><SectionHeading eyebrow="The pieces you love" heading="Trending now" ctaHref="/shop?sort=popular" ctaLabel="Discover more"/><div className="mt-10"><ProductGrid products={popular}/></div></div></section>
    <section className="container-editorial py-16 md:py-24"><SectionHeading eyebrow="Curated with care" heading="Explore our edits"/><div className="mt-9 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{collections.slice(0,4).map((c)=><Link key={c.slug} href={`/collection/${c.slug}`} className="rounded-xl border border-border bg-white p-6 hover:shadow-premium"><span className="text-xs uppercase tracking-widest text-muted-foreground">{c.tagline}</span><h3 className="mt-3 font-display text-2xl">{c.name}</h3><span className="mt-5 inline-flex items-center text-sm">Discover <ArrowUpRight size={15}/></span></Link>)}</div></section>
    <section className="bg-[#efe5dc] py-16"><div className="container-editorial grid md:grid-cols-[1fr_auto] items-center gap-6"><div><p className="font-script text-3xl text-primary">A little note from Annah</p><h2 className="mt-2 font-display text-4xl">Clothes with a sense of belonging.</h2><p className="mt-3 max-w-2xl text-muted-foreground">We bring together Indian craft and modern ease, choosing pieces that feel as lovely to wear as they are to keep.</p></div><Link href="/about" className="rounded-full border border-foreground/20 px-6 py-3 text-sm">Our story <ArrowRight className="inline ml-2" size={16}/></Link></div></section>
    <section className="container-editorial py-16 md:py-20 text-center"><Instagram className="mx-auto text-primary"/><p className="mt-3 text-xs uppercase tracking-[.24em]">@annahboutique</p><h2 className="mt-2 font-display text-4xl">A little inspiration, daily.</h2><p className="mt-3 text-muted-foreground">Follow along for new arrivals, styling notes and stories from our atelier.</p><a href="https://instagram.com/annahboutique" className="mt-5 inline-block underline underline-offset-4">Follow us</a></section>
  </>;
}
