import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";
import { RevealObserver } from "@/components/reveal";
import { getCategories } from "@/server/catalog";
import { getSetting } from "@/server/config";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [categories, home, social] = await Promise.all([getCategories(), getSetting("home"), getSetting("social")]);
  return (
    <>
      {home.announcement && (
        <div className="bg-accent text-center text-[13px] font-medium text-white">
          <p className="container-x py-2">{home.announcement}</p>
        </div>
      )}
      <Header categories={categories.map((c) => ({ slug: c.slug, name: c.name, group: c.group, count: c._count.products }))} />
      <main id="main">{children}</main>
      <Footer social={social} />
      <WhatsAppFab />
      <RevealObserver />
    </>
  );
}
