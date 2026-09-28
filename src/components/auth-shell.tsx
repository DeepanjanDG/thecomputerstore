import { CheckCircle2 } from "lucide-react";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="container-x grid gap-10 py-14 lg:grid-cols-2 lg:items-center">
      <div className="stage hidden rounded-[32px] p-10 lg:block">
        <p className="eyebrow">Your account</p>
        <p className="mt-4 text-3xl font-extrabold tracking-tight">Keep every build, order and quotation in one place.</p>
        <ul className="mt-8 space-y-3 text-muted">
          {["Save multiple PC builds permanently", "Track orders and quotations", "Wishlist products you're considering", "Faster checkout"].map((t) => (
            <li key={t} className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-accent" /> {t}</li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-muted">You never need an account to use the PC Builder.</p>
      </div>
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
        <p className="mb-8 mt-2 text-muted">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
