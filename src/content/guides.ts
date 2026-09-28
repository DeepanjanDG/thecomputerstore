// Buying guides. Plain data so they can move to a CMS later.
export interface Guide {
  slug: string;
  title: string;
  excerpt: string;
  readMins: number;
  sections: { heading: string; body: string[] }[];
  related?: { label: string; href: string }[];
}

export const GUIDES: Guide[] = [
  {
    slug: "first-pc-build-guide",
    title: "Building your first PC: what every part does",
    excerpt: "A plain-English tour of the eight core components and how they depend on each other.",
    readMins: 6,
    sections: [
      { heading: "Start with how you'll use it", body: [
        "Gaming leans on the graphics card. Video editing and 3D want more CPU cores and memory. Office and study builds can skip the graphics card entirely if the processor has integrated graphics.",
        "Pick your budget first — our builder shows the running total, and “Build it for me” can generate a balanced starting point.",
      ] },
      { heading: "The processor decides the platform", body: [
        "Every CPU fits one socket (AMD AM4 or AM5, Intel LGA1700 or LGA1851). The motherboard must have the same socket, and its chipset must support that CPU generation.",
        "AM5 and LGA1851 boards use DDR5 memory only. Many LGA1700 boards come in DDR4 or DDR5 versions — never both.",
      ] },
      { heading: "Size and power", body: [
        "The cabinet must fit your motherboard size (ATX, Micro-ATX or Mini-ITX), the graphics card's length and the CPU cooler's height.",
        "The power supply should exceed your estimated load with around 30% headroom. Modern RTX cards may need a 16-pin (12VHPWR) cable — ATX 3.0 power supplies include one.",
      ] },
      { heading: "Let the builder do the checking", body: [
        "Our PC Builder runs 25 compatibility checks every time you pick a part and hides options that can't work. When something needs attention, it tells you why and what to change.",
      ] },
    ],
    related: [{ label: "Open the PC Builder", href: "/pc-builder" }],
  },
  {
    slug: "how-much-ram-do-i-need",
    title: "How much RAM do you need in 2026?",
    excerpt: "16GB, 32GB or 64GB? A quick answer for gaming, streaming, editing and development.",
    readMins: 3,
    sections: [
      { heading: "Quick answer", body: [
        "16GB: office, study and esports. 32GB: modern AAA gaming, streaming and photo editing. 64GB+: 4K video, 3D, virtual machines and local AI models.",
      ] },
      { heading: "DDR4 or DDR5?", body: [
        "It depends on your motherboard — they are not interchangeable. The builder only shows memory that matches your board.",
        "Buy memory as a kit of two sticks for dual-channel performance.",
      ] },
    ],
    related: [{ label: "Shop RAM", href: "/ram" }],
  },
  {
    slug: "choosing-a-power-supply",
    title: "Choosing the right power supply (PSU)",
    excerpt: "Wattage, efficiency ratings and connectors — and why cheap PSUs are a false economy.",
    readMins: 4,
    sections: [
      { heading: "Wattage", body: [
        "Add up the CPU and GPU power plus around 100W for everything else, then add headroom. The builder does this automatically and recommends a wattage.",
      ] },
      { heading: "Efficiency", body: [
        "80 PLUS Bronze is fine for budget builds; Gold runs cooler and quieter and usually comes with longer warranties.",
      ] },
      { heading: "Power cuts and fluctuations", body: [
        "In areas with frequent power cuts, pair your PC with a UPS sized for your system's load. The builder checks UPS capacity too.",
      ] },
    ],
    related: [{ label: "Shop power supplies", href: "/power-supplies" }, { label: "Shop UPS", href: "/ups" }],
  },
  {
    slug: "1080p-vs-1440p-vs-4k-gaming",
    title: "1080p, 1440p or 4K: which should you build for?",
    excerpt: "Match your graphics card to your monitor so you don't overspend on either.",
    readMins: 4,
    sections: [
      { heading: "1080p", body: ["The most affordable path to high frame rates. RTX 5060 or RX 7600-class cards are the sweet spot."] },
      { heading: "1440p", body: ["Noticeably sharper on 27-inch monitors. Look at RTX 5070 / RX 9070 XT-class cards and 32GB of RAM."] },
      { heading: "4K", body: ["Needs a high-end GPU such as the RTX 5080 or above. Upscaling like DLSS and FSR makes 4K much more achievable."] },
    ],
    related: [{ label: "Gaming PCs by resolution", href: "/gaming" }],
  },
];
