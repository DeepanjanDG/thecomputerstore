"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3, Boxes, Cpu, ExternalLink, FileText, FolderTree, Images, LayoutDashboard, LogOut, Mail, Menu, Package, Settings2, Share2, ShieldCheck, Tag, Tags, Users, X,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme";
import { logoutAction } from "@/server/actions/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { group: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  { group: "Catalogue", items: [
    { href: "/admin/products", label: "Products & Inventory", icon: Boxes },
    { href: "/admin/categories", label: "Categories & Specs", icon: FolderTree },
    { href: "/admin/brands", label: "Brands", icon: Tags },
  ] },
  { group: "Sales", items: [
    { href: "/admin/quotes", label: "Quotation Requests", icon: FileText },
    { href: "/admin/orders", label: "Orders", icon: Package },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/messages", label: "Messages", icon: Mail },
    { href: "/admin/coupons", label: "Coupons", icon: Tag },
  ] },
  { group: "PC Builder", items: [
    { href: "/admin/builds", label: "Saved Builds", icon: Cpu },
    { href: "/admin/templates", label: "Build Templates", icon: BarChart3 },
    { href: "/admin/compatibility", label: "Compatibility & Scoring", icon: ShieldCheck },
  ] },
  { group: "Site", items: [
    { href: "/admin/content", label: "Homepage Content", icon: Settings2 },
    { href: "/admin/slides", label: "Homepage Slider", icon: Images },
    { href: "/admin/social", label: "Social Links", icon: Share2 },
  ] },
];

function LogoutButton({ className, label = "Log out" }: { className?: string; label?: string }) {
  return (
    <form action={logoutAction}>
      <button type="submit" className={cn("flex items-center gap-2 rounded-xl text-sm font-semibold text-ink-2 transition-colors hover:bg-bad-soft hover:text-bad", className)}>
        <LogOut className="h-4 w-4" /> {label}
      </button>
    </form>
  );
}

export function AdminShell({ children, name, badges }: { children: React.ReactNode; name: string; badges: Record<string, number> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = (
    <nav aria-label="Admin" className="space-y-6">
      {NAV.map((g) => (
        <div key={g.group}>
          <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{g.group}</p>
          <ul className="space-y-0.5">
            {g.items.map((it) => {
              const active = it.href === "/admin" ? pathname === "/admin" : pathname.startsWith(it.href);
              return (
                <li key={it.href}>
                  <Link href={it.href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined} className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium", active ? "bg-accent-soft text-accent" : "text-ink-2 hover:bg-surface-2")}>
                    <it.icon className="h-4 w-4" /> <span className="flex-1">{it.label}</span>
                    {badges[it.href] ? <span className="rounded-full bg-accent px-1.5 text-[11px] font-bold text-white">{badges[it.href]}</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col overflow-y-auto border-r border-line bg-surface px-3 py-5 lg:flex">
        <Link href="/admin" className="mb-6 block px-3"><Logo /></Link>
        <div className="flex-1">{nav}</div>
        <div className="mt-6 border-t border-line pt-4">
          <LogoutButton className="w-full px-3 py-2" />
        </div>
      </aside>
      <div className="min-w-0">
        <header className="glass sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line px-4 sm:px-8">
          <button className="grid h-10 w-10 place-items-center rounded-xl hover:bg-surface-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open admin menu"><Menu className="h-5 w-5" /></button>
          <p className="text-sm text-muted">Signed in as <span className="font-semibold text-ink">{name}</span></p>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link href="/" className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-surface-2">View store <ExternalLink className="h-3.5 w-3.5" /></Link>
            <LogoutButton className="px-3 py-2" />
          </div>
        </header>
        <main id="main" className="px-4 py-8 sm:px-8">{children}</main>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-surface px-3 py-5">
            <div className="mb-6 flex items-center justify-between px-3"><Logo /><button onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></button></div>
            {nav}
            <div className="mt-6 border-t border-line pt-4">
              <LogoutButton className="w-full px-3 py-2" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
