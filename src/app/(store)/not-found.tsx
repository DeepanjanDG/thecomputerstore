import { Cpu, Search } from "lucide-react";
import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-x py-24 text-center">
      <p className="font-mono text-sm font-semibold text-accent">404 · NO POST</p>
      <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">This page didn&apos;t boot.</h1>
      <p className="mx-auto mt-4 max-w-md text-lg text-muted">The link may be old, or the product may no longer be listed. Try searching, or start a build.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <LinkButton href="/pc-builder"><Cpu className="h-4 w-4" /> Build Your PC</LinkButton>
        <LinkButton href="/search" variant="secondary"><Search className="h-4 w-4" /> Search products</LinkButton>
      </div>
    </div>
  );
}
