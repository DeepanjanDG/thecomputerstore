"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Cpu, Heart, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme";
import { SearchDialog } from "./search-dialog";
import { useCart } from "@/components/providers/cart";
import { useBuilder } from "@/components/providers/builder";
import { useSessionUser } from "@/components/providers/session";
import { cn } from "@/lib/utils";

export interface NavCategory { slug: string; name: string; group: string; count: number }

const LINKS = [
  { href: "/pc-builder", label: "Custom PC Builder" },
  { href: "/gaming-pcs", label: "Pre-built PCs" },
  { href: "/gaming", label: "Gaming" },
  { href: "/laptops", label: "Laptops" },
  { href: "/desktop-pcs", label: "Desktops" },
  { href: "/shop#components", label: "Components" },
  { href: "/accessories", label: "Accessories" },
  { href: "/deals", label: "Deals" },
];

export function Header({ categories }: { categories: NavCategory[] }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { count, ready } = useCart();
  const builder = useBuilder();
  const user = useSessionUser();
  const shopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    setMenuOpen(false);
    setShopOpen(false);
  }, [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "/" && !(e.target as HTMLElement).closest("input,textarea,select")) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  const groups = [...new Set(categories.map((c) => c.group))];
  const buildCount = Object.keys(builder.items).length;

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <header
        className={cn(
          "sticky top-0 z-50 border-b bg-surface transition-shadow duration-300",
          scrolled ? "border-line shadow-[0_10px_30px_-22px_rgb(15_34_71/0.45)]" : "border-line",
        )}
      >
        {/* Row 1: logo, search, account icons */}
        <div className="container-x flex h-[68px] items-center gap-3 sm:gap-6">
          <Link href="/" className="shrink-0 rounded-xl" aria-label="The Computer Store, home">
            <Logo />
          </Link>

          <button
            onClick={() => setSearchOpen(true)}
            className="mx-auto hidden h-11 w-full max-w-[560px] items-center gap-3 rounded-full border border-line bg-surface-2 px-4 text-left text-sm text-muted transition-colors hover:border-line-strong hover:bg-surface md:flex"
            aria-label="Search products"
          >
            <Search className="h-[18px] w-[18px] shrink-0" />
            <span className="truncate">Search for products, brands, or build your PC…</span>
            <kbd className="ml-auto hidden rounded-md border border-line bg-surface px-1.5 text-[11px] lg:block">Ctrl K</kbd>
          </button>

          <div className="ml-auto flex items-center gap-0.5 md:ml-0">
            <button onClick={() => setSearchOpen(true)} className="grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-surface-2 md:hidden" aria-label="Search (Ctrl K)">
              <Search className="h-5 w-5" />
            </button>
            <Link
              href={user ? (user.role === "ADMIN" ? "/admin" : "/account") : "/login"}
              className="hidden h-10 w-10 place-items-center rounded-full text-ink hover:bg-surface-2 sm:grid"
              aria-label={user ? "Your account" : "Sign in"}
              title={user ? user.name : "Sign in"}
            >
              <User className="h-[21px] w-[21px]" />
            </Link>
            <Link
              href={user ? "/account?tab=wishlist" : "/login?next=%2Faccount%3Ftab%3Dwishlist"}
              className="hidden h-10 w-10 place-items-center rounded-full text-ink hover:bg-surface-2 sm:grid"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <Heart className="h-[21px] w-[21px]" />
            </Link>
            <Link href="/cart" className="relative grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-surface-2" aria-label={`Cart, ${count} items`}>
              <ShoppingCart className="h-[21px] w-[21px]" />
              {ready && count > 0 && (
                <span key={count} className="absolute -right-0.5 top-0 grid h-[18px] min-w-[18px] animate-pop place-items-center rounded-full bg-bad px-1 text-[10.5px] font-bold text-white ring-2 ring-surface">
                  {count}
                </span>
              )}
            </Link>
            <ThemeToggle className="hidden rounded-full sm:grid" />
            <button onClick={() => setMenuOpen(true)} className="grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-surface-2 lg:hidden" aria-label="Open menu" aria-expanded={menuOpen}>
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Row 2: category navigation */}
        <nav aria-label="Main" className="hidden border-t border-line lg:block">
          <div className="container-x flex h-12 items-center justify-between gap-1">
            <div ref={shopRef} className="relative h-full" onMouseEnter={() => setShopOpen(true)} onMouseLeave={() => setShopOpen(false)}>
              <button
                className={cn("flex h-full items-center gap-1 px-1 text-[14px] font-semibold text-ink transition-colors hover:text-accent", shopOpen && "text-accent")}
                aria-expanded={shopOpen}
                aria-controls="shop-menu"
                onClick={() => setShopOpen((v) => !v)}
              >
                All Products <ChevronDown className={cn("h-4 w-4 transition-transform", shopOpen && "rotate-180")} />
              </button>
              {shopOpen && (
                <div id="shop-menu" className="absolute left-0 top-full pt-2">
                  <div className="grid w-[820px] animate-reveal grid-cols-4 gap-6 rounded-[16px] border border-line bg-surface p-6 shadow-lift [animation-duration:0.25s]">
                    {groups.map((g) => (
                      <div key={g}>
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-muted">{g}</p>
                        <ul className="space-y-0.5">
                          {categories.filter((c) => c.group === g).map((c) => (
                            <li key={c.slug}>
                              <Link href={`/${c.slug}`} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-ink-2 hover:bg-surface-2 hover:text-accent">
                                {c.name}
                                <span className="text-xs text-muted">{c.count}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <Link href="/pc-builder" className="col-span-4 flex items-center justify-between rounded-xl bg-accent-soft p-5 transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_14%,var(--surface))]">
                      <span className="flex items-center gap-3">
                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-white"><Cpu className="h-5 w-5" /></span>
                        <span>
                          <span className="block font-bold">Not sure what fits together?</span>
                          <span className="text-sm text-muted">The PC Builder checks every part for you, in real time.</span>
                        </span>
                      </span>
                      <span className="flex items-center gap-1 text-sm font-semibold text-accent">Open PC Builder <ArrowRight className="h-4 w-4" /></span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
            {LINKS.map((l) => {
              const current = pathname === l.href.split("#")[0];
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "relative flex h-full items-center whitespace-nowrap px-1 text-[14px] font-semibold text-ink transition-colors hover:text-accent",
                    current && "text-accent after:absolute after:inset-x-0 after:-bottom-px after:h-[2px] after:rounded-full after:bg-accent",
                  )}
                  aria-current={current ? "page" : undefined}
                >
                  {l.label}
                  {l.href === "/pc-builder" && buildCount > 0 && (
                    <span className="ml-1.5 rounded-full bg-accent px-1.5 text-[11px] font-bold leading-[18px] text-white">{buildCount}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Mobile / tablet drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-md animate-[reveal_0.3s_ease] flex-col bg-surface shadow-lift">
            <div className="flex h-[68px] items-center justify-between border-b border-line px-5">
              <Logo />
              <button onClick={() => setMenuOpen(false)} className="grid h-10 w-10 place-items-center rounded-xl hover:bg-surface-2" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <Link href="/pc-builder" className="mb-6 block rounded-[16px] bg-accent p-5 text-white">
                <Cpu className="mb-3 h-7 w-7" />
                <p className="text-xl font-bold">Build Your PC</p>
                <p className="mt-1 text-sm text-white/80">Pick parts, check compatibility, get it quoted.</p>
              </Link>
              <nav aria-label="Mobile" className="space-y-1">
                {LINKS.slice(1).map((l) => (
                  <Link key={l.href} href={l.href} className="flex items-center justify-between rounded-xl px-3 py-3 text-lg font-semibold hover:bg-surface-2">
                    {l.label} <ArrowRight className="h-4 w-4 text-muted" />
                  </Link>
                ))}
              </nav>
              {groups.map((g) => (
                <div key={g} className="mt-6">
                  <p className="mb-2 px-3 text-xs font-bold uppercase tracking-[0.12em] text-muted">{g}</p>
                  <div className="grid grid-cols-2 gap-1">
                    {categories.filter((c) => c.group === g).map((c) => (
                      <Link key={c.slug} href={`/${c.slug}`} className="rounded-lg px-3 py-2 text-[15px] text-ink-2 hover:bg-surface-2">
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-line px-5 py-4">
              <Link href={user ? "/account" : "/login"} className="flex items-center gap-2 font-semibold">
                <User className="h-5 w-5" /> {user ? user.name : "Sign in / Register"}
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
