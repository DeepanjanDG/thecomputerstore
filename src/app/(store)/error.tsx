"use client";

import { RotateCcw } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { SITE } from "@/lib/site";

export default function StoreError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-x py-24 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight">Something went wrong on our side.</h1>
      <p className="mx-auto mt-4 max-w-md text-lg text-muted">Your cart and PC build are saved in this browser. Try again, or call us on {SITE.phone}.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Button onClick={reset}><RotateCcw className="h-4 w-4" /> Try again</Button>
        <LinkButton href="/" variant="secondary">Go home</LinkButton>
      </div>
    </div>
  );
}
