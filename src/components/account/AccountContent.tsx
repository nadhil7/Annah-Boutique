"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@/types/user";
import authService from "@/services/authService";
export function AccountContent(){const [user,setUser]=useState<User|null>(null);const [ready,setReady]=useState(false);const router=useRouter();useEffect(()=>{authService.getCurrentUser().then(setUser).finally(()=>setReady(true));},[]);if(!ready)return <p className="mt-8 text-muted-foreground">Loading your account…</p>;if(!user)return <div className="mt-8 rounded-xl border border-border p-8"><p>Sign in to view your account, or continue shopping as a guest.</p><div className="mt-5 flex gap-3"><Link href="/login" className="rounded-full bg-[#392a25] px-5 py-3 text-white">Sign in</Link><Link href="/register" className="rounded-full border border-border px-5 py-3">Create account</Link></div></div>;return <div className="mt-8 rounded-xl border border-border p-7"><p className="font-display text-2xl">Hello, {user.name}</p><p className="mt-2 text-muted-foreground">{user.email}</p><div className="mt-6 flex gap-5"><Link className="underline" href="/account/orders">Order history</Link><button className="underline" onClick={async()=>{await authService.logout();setUser(null);router.refresh();}}>Sign out</button></div></div>;}
