import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./logo";
import { FacebookIcon, InstagramIcon, WhatsAppIcon, YouTubeIcon } from "./brand-icons";
import { SITE, fullAddress } from "@/lib/site";
import { TrustStrip } from "./trust-strip";
import type { SocialLinks } from "@/server/config";

const COLS = [
  { title: "Shop", links: [["Components", "/shop#components"], ["Laptops", "/laptops"], ["Desktops", "/desktop-pcs"], ["Gaming", "/gaming"], ["Accessories", "/accessories"], ["Deals", "/deals"]] },
  { title: "Build", links: [["Custom PC Builder", "/pc-builder"], ["Build Templates", "/builds"], ["Gaming PCs", "/gaming-pcs"], ["Workstations", "/builds?use=workstation"], ["Compare Parts", "/compare"]] },
  { title: "Support", links: [["Contact", "/contact"], ["Warranty", "/warranty"], ["Shipping", "/shipping"], ["Returns", "/refund-policy"], ["FAQs", "/faqs"], ["Buying Guides", "/guides"]] },
  { title: "Company", links: [["About", "/about"], ["Visit the Store", "/contact#visit"], ["Careers", "/careers"], ["Request a Quote", "/quote"]] },
];

export function Footer({ social }: { social: SocialLinks }) {
  const socials = [
    { href: social.instagram.enabled ? social.instagram.url : "", label: "Instagram", Icon: InstagramIcon },
    { href: social.facebook.enabled ? social.facebook.url : "", label: "Facebook", Icon: FacebookIcon },
    { href: social.youtube.enabled ? social.youtube.url : "", label: "YouTube", Icon: YouTubeIcon },
    { href: `https://wa.me/${SITE.whatsapp}`, label: "WhatsApp", Icon: WhatsAppIcon },
  ].filter((s) => s.href);

  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <div className="border-b border-line">
        <TrustStrip className="container-x py-7" />
      </div>
      <div className="container-x grid gap-12 py-14 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-5 text-[15px] leading-relaxed text-muted">
            Custom PCs, components and computers — chosen, checked, assembled and supported in Shillong.
          </p>
          <div className="mt-6 flex gap-2">
            {socials.map(({ href, label, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-10 w-10 place-items-center rounded-full border border-line text-muted transition-colors hover:border-accent hover:text-accent">
                <Icon className="h-[18px] w-[18px]" />
              </a>
            ))}
          </div>
        </div>
        {COLS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">{c.title}</p>
            <ul className="mt-4 space-y-2.5">
              {c.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-[15px] text-ink-2 transition-colors hover:text-accent">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-6 py-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 text-sm text-muted">
            <p className="font-bold tracking-[0.08em] text-ink">THE COMPUTER STORE</p>
            <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {fullAddress}, India</p>
            <p className="flex flex-wrap gap-x-5 gap-y-2">
              <a href={SITE.phoneHref} className="flex items-center gap-2 hover:text-ink"><Phone className="h-4 w-4" /> {SITE.phone}</a>
              <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 hover:text-ink"><Mail className="h-4 w-4" /> {SITE.email}</a>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
            <Link href="/privacy" className="hover:text-ink">Privacy</Link>
            <Link href="/terms" className="hover:text-ink">Terms</Link>
            <Link href="/refund-policy" className="hover:text-ink">Refund Policy</Link>
            <span>© {new Date().getFullYear()} The Computer Store</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
