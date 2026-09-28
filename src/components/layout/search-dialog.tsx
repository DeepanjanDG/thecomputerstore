"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, Boxes, Cpu, LayoutGrid, Loader2, Search } from "lucide-react";
import { ProductArt } from "@/components/product/product-art";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Result {
  products: { slug: string; name: string; brand: string; category: string; price: number; image: string | null }[];
  categories: { slug: string; name: string; count: number }[];
  builds: { slug: string; name: string; tagline: string | null }[];
  guides: { slug: string; title: string }[];
}

const SUGGESTIONS = ["RTX 5070", "32GB DDR5", "Ryzen 7", "1TB SSD", "Gaming monitor", "AM5 motherboard"];

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [q, setQ] = useState("");
  const [data, setData] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      setTimeout(() => input.current?.focus(), 10);
    }
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (q.trim().length < 2) {
      setData(null);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d: Result) => {
          setData(d);
          setActive(0);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 160);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const flat: { href: string }[] = data
    ? [
        ...data.products.map((p) => ({ href: `/product/${p.slug}` })),
        ...data.categories.map((c) => ({ href: `/${c.slug}` })),
        ...data.builds.map((b) => ({ href: `/builds/${b.slug}` })),
        ...data.guides.map((g) => ({ href: `/guides/${g.slug}` })),
      ]
    : [];

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, flat.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    if (e.key === "Enter") {
      e.preventDefault();
      if (flat[active]) go(flat[active].href);
      else if (q.trim()) go(`/search?q=${encodeURIComponent(q.trim())}`);
    }
  };

  let idx = -1;
  const item = (href: string, children: React.ReactNode) => {
    idx++;
    const i = idx;
    return (
      <li key={href} role="option" aria-selected={active === i}>
        <button
          onMouseEnter={() => setActive(i)}
          onClick={() => go(href)}
          className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left", active === i ? "bg-surface-2" : "")}
        >
          {children}
        </button>
      </li>
    );
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label="Search"
      className="mx-auto mt-[8vh] w-[min(680px,calc(100vw-24px))] rounded-[24px] border border-line bg-surface p-0 text-ink shadow-lift backdrop:bg-black/55 backdrop:backdrop-blur-sm open:animate-pop"
    >
      <div className="flex items-center gap-3 border-b border-line px-5">
        {loading ? <Loader2 className="h-5 w-5 animate-spin text-muted" /> : <Search className="h-5 w-5 text-muted" />}
        <input
          ref={input}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKey}
          placeholder="Search products, categories, builds…"
          className="h-16 flex-1 bg-transparent text-lg outline-none placeholder:text-muted"
          aria-label="Search"
          role="combobox"
          aria-expanded={!!data}
          aria-controls="search-results"
          aria-autocomplete="list"
        />
        <kbd className="rounded-md border border-line px-1.5 py-0.5 text-xs text-muted">Esc</kbd>
      </div>
      <div className="max-h-[60vh] overflow-y-auto p-3">
        {!data && (
          <div className="p-3">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-muted">Popular searches</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => setQ(s)} className="rounded-full border border-line px-3 py-1.5 text-sm hover:border-accent hover:text-accent">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {data && flat.length === 0 && !loading && (
          <div className="p-8 text-center">
            <p className="font-semibold">No results for “{q}”.</p>
            <p className="mt-1 text-sm text-muted">Try a model name like “RTX 5060”, or ask us on WhatsApp — we can source most parts.</p>
          </div>
        )}
        {data && (
          <ul id="search-results" role="listbox" className="space-y-4">
            {data.products.length > 0 && (
              <li>
                <p className="mb-1 flex items-center gap-2 px-3 text-xs font-bold uppercase tracking-[0.12em] text-muted"><Boxes className="h-3.5 w-3.5" /> Products</p>
                <ul>
                  {data.products.map((p) =>
                    item(`/product/${p.slug}`, (
                      <>
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-surface-2 p-1">
                          <ProductArt category={p.category} brand={p.brand} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">{p.name}</span>
                          <span className="text-xs text-muted">{p.brand}</span>
                        </span>
                        <span className="font-mono text-sm font-semibold">{formatINR(p.price)}</span>
                      </>
                    )),
                  )}
                </ul>
              </li>
            )}
            {data.categories.length > 0 && (
              <li>
                <p className="mb-1 flex items-center gap-2 px-3 text-xs font-bold uppercase tracking-[0.12em] text-muted"><LayoutGrid className="h-3.5 w-3.5" /> Categories</p>
                <ul>{data.categories.map((c) => item(`/${c.slug}`, <><span className="flex-1 text-sm font-semibold">{c.name}</span><span className="text-xs text-muted">{c.count} products</span></>))}</ul>
              </li>
            )}
            {data.builds.length > 0 && (
              <li>
                <p className="mb-1 flex items-center gap-2 px-3 text-xs font-bold uppercase tracking-[0.12em] text-muted"><Cpu className="h-3.5 w-3.5" /> Builds</p>
                <ul>{data.builds.map((b) => item(`/builds/${b.slug}`, <><span className="flex-1 text-sm font-semibold">{b.name}</span><span className="truncate text-xs text-muted">{b.tagline}</span></>))}</ul>
              </li>
            )}
            {data.guides.length > 0 && (
              <li>
                <p className="mb-1 flex items-center gap-2 px-3 text-xs font-bold uppercase tracking-[0.12em] text-muted"><BookOpen className="h-3.5 w-3.5" /> Guides</p>
                <ul>{data.guides.map((g) => item(`/guides/${g.slug}`, <span className="flex-1 text-sm font-semibold">{g.title}</span>))}</ul>
              </li>
            )}
            <li>
              <button onClick={() => go(`/search?q=${encodeURIComponent(q)}`)} className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-accent hover:bg-surface-2">
                See all results for “{q}” <ArrowRight className="h-4 w-4" />
              </button>
            </li>
          </ul>
        )}
      </div>
    </dialog>
  );
}
