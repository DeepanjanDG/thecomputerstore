// Business information — sourced from the existing thecomputerstore.linker.store site.
export const SITE = {
  name: "The Computer Store",
  shortName: "TCS",
  tagline: "Custom PCs, components and computers in Shillong",
  description:
    "Build a custom PC with real-time compatibility checks, or shop laptops, desktops, components, printers, networking and CCTV from The Computer Store, Police Bazar, Shillong.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  phone: "+91 94361 04462",
  phoneHref: "tel:+919436104462",
  whatsapp: "919436104462",
  email: "thecomputerstore@live.in",
  address: {
    line1: "BRO-IAN Building, G.S. Road",
    line2: "Police Bazar",
    city: "Shillong",
    state: "Meghalaya",
    pincode: "793001",
    country: "India",
  },
  // Business hours are not published on the current site. Add them here once confirmed,
  // e.g. [{ days: "Monday – Saturday", time: "10:00 AM – 7:30 PM" }]. Empty = "call to confirm".
  hours: [] as { days: string; time: string }[],
  mapsQuery: "The Computer Store, BRO-IAN Building, GS Road, Police Bazar, Shillong 793001",
  social: {
    facebook: "",
    instagram: "",
    youtube: "",
  },
} as const;

export const fullAddress = `${SITE.address.line1}, ${SITE.address.line2}, ${SITE.address.city}, ${SITE.address.state} ${SITE.address.pincode}`;
