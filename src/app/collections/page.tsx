import Image from "next/image";
import Link from "next/link";
import { fetchCategories } from "@/lib/catalogApi";

export const dynamic = "force-dynamic";
export const metadata = { title: "Collections" };

export default async function CollectionsPage() {
  const categories = await fetchCategories();
  return <div className="container-editorial py-12"><p className="text-xs uppercase tracking-[.2em] text-primary">Find your style</p><h1 className="mt-3 font-display text-5xl">Collections</h1>{categories.length ? <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">{categories.map((category) => <Link key={category.slug} href={`/category/${category.slug}`} className="group"><div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-secondary">{category.image ? <Image src={category.image} alt={category.name} fill unoptimized sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition-transform group-hover:scale-105" /> : <div className="absolute inset-0 bg-[#d7c2b7]" />}</div><h2 className="mt-3 font-display text-2xl">{category.name}</h2><p className="text-sm text-muted-foreground">{category.description || "Explore collection"}</p></Link>)}</div> : <p className="mt-8 rounded-xl border border-border p-10 text-center text-muted-foreground">No collections available yet.</p>}</div>;
}
