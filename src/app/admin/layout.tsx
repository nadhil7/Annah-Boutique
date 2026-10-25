"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Layers3, LogOut, Menu, Package, UserCircle, X } from "lucide-react";
import { adminApi } from "@/lib/adminApi";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(pathname === "/admin/login");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") { setReady(true); return; }
    if (ready) return;
    setReady(false);
    adminApi.me().then(() => setReady(true)).catch(() => router.replace("/admin/login"));
  }, [pathname, ready, router]);

  if (pathname === "/admin/login") return children;
  const links = [["/admin", "Overview", LayoutDashboard], ["/admin/categories", "Categories", Layers3], ["/admin/products", "Products", Package]] as const;

  return <div className="min-h-screen min-w-0 overflow-x-hidden bg-[#f6f0eb] text-foreground">
    <button onClick={() => setOpen(!open)} className="fixed left-4 top-4 z-50 rounded-lg border border-border bg-white p-2 shadow-sm lg:hidden" aria-label={open ? "Close admin navigation" : "Open admin navigation"} aria-expanded={open}>{open ? <X size={18} /> : <Menu size={18} />}</button>
    {open && <button type="button" aria-label="Close admin navigation" onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-black/20 lg:hidden" />}
    <aside className={`fixed inset-y-0 left-0 z-40 w-[min(18rem,85vw)] border-r border-border bg-white p-6 transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <Link href="/admin" className="font-script text-3xl text-primary" onClick={() => setOpen(false)}>Annah</Link>
      <p className="mt-1 text-xs uppercase tracking-[.22em] text-muted-foreground">Admin studio</p>
      <nav className="mt-10 space-y-2">{links.map(([href, label, Icon]) => <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors ${pathname === href ? "bg-[#392a25] text-white shadow-sm" : "hover:bg-secondary"}`}><Icon size={17} />{label}</Link>)}</nav>
      <button onClick={async () => { await adminApi.logout(); router.replace("/admin/login"); }} className="absolute bottom-6 left-6 flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground"><LogOut size={17} /> Sign out</button>
    </aside>
    <div className="min-w-0 min-h-screen lg:pl-72">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-white/90 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-[4.5rem] min-w-0 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
          <div className="pl-12 lg:pl-0"><p className="text-[10px] font-semibold uppercase tracking-[.28em] text-primary">Annah Boutique</p><p className="mt-1 font-display text-xl text-foreground">Admin studio</p></div>
          <Link href="/admin/profile" aria-label="Open admin profile" className={`group flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors ${pathname === "/admin/profile" ? "border-[#392a25] bg-[#392a25] text-white" : "border-border bg-white hover:border-[#392a25] hover:bg-[#392a25] hover:text-white"}`}><UserCircle size={19} /><span className="hidden sm:inline">Profile</span></Link>
        </div>
      </header>
      <div className="mx-auto min-w-0 max-w-7xl px-5 py-8 sm:px-8 lg:px-10">{ready ? children : <main className="grid min-h-[calc(100vh-4rem)] place-items-center text-sm text-muted-foreground">Checking admin session…</main>}</div>
    </div>
  </div>;
}
