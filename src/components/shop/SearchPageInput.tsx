"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
export function SearchPageInput({initialQuery=""}:{initialQuery?:string}){const [q,setQ]=useState(initialQuery);const router=useRouter();return <form onSubmit={e=>{e.preventDefault();router.push(`/search?q=${encodeURIComponent(q.trim())}`);}} className="flex gap-2"><label className="flex flex-1 items-center gap-2 rounded-full border border-border px-4"><Search size={17}/><span className="sr-only">Search products</span><input className="h-12 w-full bg-transparent outline-none" value={q} onChange={e=>setQ(e.target.value)} placeholder="Try sarees, kurtis, festive…"/></label><button className="rounded-full bg-[#392a25] px-5 text-white">Search</button></form>;}
