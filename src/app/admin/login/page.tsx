"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Home } from "lucide-react";
import { adminApi } from "@/lib/adminApi";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi.me().then(() => router.replace("/admin")).catch(() => setChecking(false));
  }, [router]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try { await adminApi.login(email, password); router.replace("/admin"); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to sign in"); }
    finally { setBusy(false); }
  }

  if (checking) return <main className="min-h-screen grid place-items-center bg-[#f6f0eb] text-sm text-muted-foreground">Checking admin session…</main>;
  return <main className="min-h-screen bg-[#f6f0eb] px-4 py-12 flex items-center justify-center"><div className="w-full max-w-md rounded-2xl border border-border bg-white p-7 shadow-premium sm:p-10"><p className="text-xs uppercase tracking-[.25em] text-primary">Annah Boutique</p><h1 className="mt-3 font-display text-4xl">Admin sign in</h1><p className="mt-3 text-sm text-muted-foreground">Sign in with your admin email and password.</p><form onSubmit={submit} className="mt-8 space-y-5"><label className="grid gap-2 text-sm font-medium">Admin email<input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 rounded-lg border border-border px-3" /></label><label className="grid gap-2 text-sm font-medium">Password<span className="relative"><input type={showPassword ? "text" : "password"} required minLength={12} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-lg border border-border px-3 pr-11" /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition hover:text-foreground">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<button disabled={busy} className="w-full rounded-full bg-[#392a25] px-5 py-3 text-white disabled:opacity-50">{busy ? "Signing in…" : "Sign in"}</button></form><Link href="/" className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm text-foreground transition hover:border-[#392a25] hover:bg-secondary"><Home size={16} /> Back to home</Link></div></main>;
}
