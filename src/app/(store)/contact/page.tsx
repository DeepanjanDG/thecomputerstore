import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { WhatsAppIcon } from "@/components/layout/brand-icons";
import { SITE, fullAddress } from "@/lib/site";
import { waLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact & Store Location — Police Bazar, Shillong",
  description: `Visit The Computer Store at ${fullAddress}. Call ${SITE.phone}, WhatsApp or email ${SITE.email}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="container-x py-10">
      <p className="eyebrow">Contact</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">We&apos;re on G.S. Road. Come say hi.</h1>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          <div className="stage rounded-[24px] p-6 sm:p-8">
            <p className="text-2xl font-bold">Need help building a PC?</p>
            <p className="mt-2 text-muted">Send us your budget and what you&apos;ll use it for. A technician will suggest a compatible build — no obligation.</p>
            <a href={waLink("Hi! I'd like to talk to a PC expert about a build.")} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex h-12 items-center gap-2 rounded-2xl bg-[#25D366] px-6 font-bold uppercase tracking-wide text-[#062e16]">
              <WhatsAppIcon className="h-5 w-5" /> Talk to a PC expert
            </a>
          </div>
          <ul className="divide-y divide-line rounded-[24px] border border-line bg-surface">
            <li className="flex gap-4 p-5" id="visit"><MapPin className="h-5 w-5 shrink-0 text-accent" /><div><p className="font-semibold">Store location</p><p className="text-muted">{fullAddress}, India</p><a className="text-sm font-semibold text-accent" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.mapsQuery)}`} target="_blank" rel="noopener noreferrer">Open in Google Maps →</a></div></li>
            <li className="flex gap-4 p-5"><Phone className="h-5 w-5 shrink-0 text-accent" /><div><p className="font-semibold">Phone</p><a href={SITE.phoneHref} className="text-muted hover:text-accent">{SITE.phone}</a></div></li>
            <li className="flex gap-4 p-5"><WhatsAppIcon className="h-5 w-5 shrink-0 text-[#25D366]" /><div><p className="font-semibold">WhatsApp</p><a href={waLink("Hi The Computer Store!")} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent">+{SITE.whatsapp}</a></div></li>
            <li className="flex gap-4 p-5"><Mail className="h-5 w-5 shrink-0 text-accent" /><div><p className="font-semibold">Email</p><a href={`mailto:${SITE.email}`} className="text-muted hover:text-accent">{SITE.email}</a></div></li>
            <li className="flex gap-4 p-5"><Clock className="h-5 w-5 shrink-0 text-accent" /><div><p className="font-semibold">Business hours</p>
              {SITE.hours.length ? SITE.hours.map((h) => <p key={h.days} className="text-muted">{h.days}: {h.time}</p>) : <p className="text-muted">Please call or WhatsApp to confirm today&apos;s hours before visiting.</p>}
            </div></li>
          </ul>
        </div>
        <div className="space-y-6">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] border border-line bg-surface-2">
            <iframe title="Map to The Computer Store, Shillong" src={`https://www.google.com/maps?q=${encodeURIComponent(SITE.mapsQuery)}&output=embed`} className="absolute inset-0 h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
          <ContactForm topics={["PC build advice", "Product enquiry", "Order support", "Warranty / service", "Business & bulk", "Other"]} />
        </div>
      </div>
    </div>
  );
}
