import type { Metadata } from "next";
import Link from "next/link";
import { Cpu, FileText, Heart, LogOut, Package, User } from "lucide-react";
import { requireUser } from "@/server/auth";
import { db } from "@/server/db";
import { logoutAction } from "@/server/actions/auth";
import { ProductGrid } from "@/components/catalog/product-grid";
import { productInclude } from "@/server/catalog";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "./profile-form";
import { formatDate, formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "My Account", robots: { index: false } };

const TABS = [
  { id: "builds", label: "My Builds", icon: Cpu },
  { id: "orders", label: "Orders", icon: Package },
  { id: "quotes", label: "Quotations", icon: FileText },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "profile", label: "Profile", icon: User },
];

const STATUS_TONE = { NEW: "accent", CONTACTED: "neutral", QUOTED: "warn", CONFIRMED: "ok", COMPLETED: "ok", CANCELLED: "bad", PENDING: "accent", PROCESSING: "warn", READY: "ok", SHIPPED: "ok", DELIVERED: "ok" } as const;

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await requireUser("/account");
  const { tab = "builds" } = await searchParams;
  const me = await db.user.findUniqueOrThrow({ where: { id: user.id } });

  return (
    <div className="container-x py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">My account</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Hi, {me.name.split(" ")[0]}.</h1>
        </div>
        <form action={logoutAction}><button className="flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink"><LogOut className="h-4 w-4" /> Sign out</button></form>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Account sections" className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col">
          {TABS.map((t) => (
            <Link key={t.id} href={`/account?tab=${t.id}`} aria-current={tab === t.id ? "page" : undefined} className={cn("flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold", tab === t.id ? "bg-surface shadow-soft ring-1 ring-line" : "text-ink-2 hover:bg-surface-2")}>
              <t.icon className="h-4 w-4" /> {t.label}
            </Link>
          ))}
        </nav>
        <section>
          {tab === "builds" && <Builds userId={user.id} />}
          {tab === "orders" && <Orders userId={user.id} />}
          {tab === "quotes" && <Quotes userId={user.id} />}
          {tab === "wishlist" && <Wishlist userId={user.id} />}
          {tab === "profile" && <ProfileForm user={{ name: me.name, email: me.email, phone: me.phone ?? "", city: me.city ?? "" }} />}
        </section>
      </div>
    </div>
  );
}

function Empty({ title, body, href, cta }: { title: string; body: string; href: string; cta: string }) {
  return (
    <div className="rounded-[24px] border border-dashed border-line-strong p-10 text-center">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-muted">{body}</p>
      <LinkButton href={href} className="mt-4">{cta}</LinkButton>
    </div>
  );
}

async function Builds({ userId }: { userId: string }) {
  const builds = await db.build.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, include: { _count: { select: { items: true } } } });
  if (!builds.length) return <Empty title="No saved builds yet." body="Use Save in the PC Builder while signed in, and your builds will appear here." href="/pc-builder" cta="Open PC Builder" />;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {builds.map((b) => (
        <li key={b.id} className="card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold">{b.name}</p>
              <p className="font-mono text-xs text-muted">{b.code} · {formatDate(b.createdAt)} · {b._count.items} parts</p>
            </div>
            <Badge tone={b.compatible ? "ok" : "bad"}>{b.compatible ? "✓ Compatible" : "✕ Issues"}</Badge>
          </div>
          <p className="mt-3 font-mono text-xl font-bold">{formatINR(b.totalPrice)}</p>
          <div className="mt-4 flex gap-2">
            <LinkButton href={`/build/${b.code}`} size="sm" variant="secondary">View</LinkButton>
            <LinkButton href={`/pc-builder?build=${b.code}`} size="sm">Edit in builder</LinkButton>
          </div>
        </li>
      ))}
    </ul>
  );
}

async function Orders({ userId }: { userId: string }) {
  const orders = await db.order.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, include: { _count: { select: { items: true } } } });
  if (!orders.length) return <Empty title="No orders yet." body="Orders you place while signed in will appear here." href="/shop" cta="Start shopping" />;
  return (
    <ul className="divide-y divide-line rounded-[24px] border border-line bg-surface">
      {orders.map((o) => (
        <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <Link href={`/order/${o.id}`} className="font-mono font-semibold hover:text-accent">{o.number}</Link>
            <p className="text-sm text-muted">{formatDate(o.createdAt)} · {o._count.items} items · {o.fulfilment === "pickup" ? "Store pickup" : "Delivery"}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge tone={STATUS_TONE[o.status as keyof typeof STATUS_TONE] ?? "neutral"}>{o.status.toLowerCase()}</Badge>
            <span className="font-mono font-bold">{formatINR(o.total)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

async function Quotes({ userId }: { userId: string }) {
  const quotes = await db.quote.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  if (!quotes.length) return <Empty title="No quotations yet." body="Download a quotation or request a quote from the PC Builder." href="/pc-builder" cta="Open PC Builder" />;
  return (
    <ul className="divide-y divide-line rounded-[24px] border border-line bg-surface">
      {quotes.map((q) => (
        <li key={q.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <p className="font-mono font-semibold">{q.number}</p>
            <p className="text-sm text-muted">{q.buildName ?? "Custom configuration"} · {formatDate(q.createdAt)} · {q.source === "DOWNLOAD" ? "Self-service PDF" : "Quote request"}</p>
          </div>
          <div className="flex items-center gap-3">
            {q.source === "REQUEST" && <Badge tone={STATUS_TONE[q.status]}>{q.status.toLowerCase()}</Badge>}
            <span className="font-mono font-bold">{formatINR(q.subtotal)}</span>
            <a href={`/api/quotes/${q.id}/pdf`} className="text-sm font-semibold text-accent">PDF</a>
          </div>
        </li>
      ))}
    </ul>
  );
}

async function Wishlist({ userId }: { userId: string }) {
  const items = await db.wishlistItem.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, include: { product: { include: productInclude } } });
  if (!items.length) return <Empty title="Your wishlist is empty." body="Tap “Save to wishlist” on any product to keep it here." href="/shop" cta="Browse products" />;
  return <ProductGrid products={items.map((i) => i.product)} />;
}
