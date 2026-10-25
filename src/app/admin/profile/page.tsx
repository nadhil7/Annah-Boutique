"use client";

import { FormEvent, useEffect, useState } from "react";
import { adminApi, type AdminProfile } from "@/lib/adminApi";

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { adminApi.me().then(setProfile).catch((err) => setError(err instanceof Error ? err.message : "Unable to load profile")); }, []);

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      await adminApi.changePassword(currentPassword, newPassword, confirmPassword);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setMessage("Password changed successfully. Your current session remains active.");
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to change password"); }
    finally { setBusy(false); }
  }

  return <section className="space-y-8"><div><p className="text-xs uppercase tracking-[.25em] text-primary">Account</p><h1 className="mt-2 font-display text-4xl">Profile</h1></div><div className="grid gap-6 lg:grid-cols-2"><div className="rounded-2xl border border-border bg-white p-6"><h2 className="font-display text-2xl">Profile information</h2>{profile ? <dl className="mt-6 space-y-4 text-sm"><div><dt className="text-muted-foreground">Name</dt><dd className="mt-1 font-medium">{profile.name}</dd></div><div><dt className="text-muted-foreground">Email</dt><dd className="mt-1 font-medium">{profile.email}</dd></div><div><dt className="text-muted-foreground">Phone</dt><dd className="mt-1 font-medium">{profile.phone || "Not provided"}</dd></div></dl> : <p className="mt-6 text-sm text-muted-foreground">Loading profile…</p>}</div><form onSubmit={submit} className="rounded-2xl border border-border bg-white p-6"><h2 className="font-display text-2xl">Change password</h2><p className="mt-2 text-sm text-muted-foreground">Use at least 12 characters.</p><div className="mt-6 space-y-4"><label className="grid gap-2 text-sm font-medium">Current password<input type="password" required minLength={12} autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="h-11 rounded-lg border border-border px-3" /></label><label className="grid gap-2 text-sm font-medium">New password<input type="password" required minLength={12} autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="h-11 rounded-lg border border-border px-3" /></label><label className="grid gap-2 text-sm font-medium">Confirm new password<input type="password" required minLength={12} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="h-11 rounded-lg border border-border px-3" /></label></div>{message && <p className="mt-4 text-sm text-green-700">{message}</p>}{error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}<button disabled={busy} className="mt-6 rounded-full bg-[#392a25] px-5 py-3 text-sm text-white disabled:opacity-50">{busy ? "Updating…" : "Update password"}</button></form></div></section>;
}
