// Policy & info pages. Draft copy written for this redesign — have the store review and
// adjust these to match its actual policies before launch.
export interface InfoPage { title: string; description: string; sections: { heading: string; body: string[] }[] }

export const INFO_PAGES: Record<string, InfoPage> = {
  warranty: {
    title: "Warranty",
    description: "How warranty works for products and custom PCs bought from The Computer Store.",
    sections: [
      { heading: "Manufacturer warranty", body: ["Every product carries the manufacturer's warranty shown on its product page. Keep your invoice — it's your proof of purchase."] },
      { heading: "We handle the claim", body: ["Bring the product (or your whole PC) to our Shillong store. We'll diagnose it, and if a component is faulty we'll process the claim with the brand or its service partner for you."] },
      { heading: "Custom PCs", body: ["Each component in a custom PC keeps its own manufacturer warranty. Assembly-related issues (loose connections, cable routing) are fixed free of charge."] },
    ],
  },
  shipping: {
    title: "Shipping & Delivery",
    description: "Pickup, local delivery and shipping across India.",
    sections: [
      { heading: "Store pickup", body: ["Pick up from our store at Police Bazar, Shillong. We'll message you when your order or build is ready."] },
      { heading: "Delivery", body: ["We deliver within Shillong and ship across Meghalaya, the North East and the rest of India. Charges and timelines depend on your PIN code and order size, and are confirmed before billing."] },
      { heading: "Custom PCs", body: ["Assembled PCs ship with internal foam supports and insured transit. Heavy graphics cards may be shipped separately for safety."] },
    ],
  },
  "refund-policy": {
    title: "Returns & Refund Policy",
    description: "Returns, DOA replacements and refunds.",
    sections: [
      { heading: "Dead on arrival (DOA)", body: ["If a product is defective on arrival, tell us within 7 days of purchase and we'll arrange a replacement subject to the brand's DOA policy."] },
      { heading: "Returns", body: ["Unopened products in original packaging may be returned within 7 days, subject to inspection. Opened software, consumables and custom-configured PCs are not returnable except for defects."] },
      { heading: "Refunds", body: ["Approved refunds are made to the original payment method within 7–10 working days."] },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    description: "How we handle your personal information.",
    sections: [
      { heading: "What we collect", body: ["Contact details you give us (name, phone, email, address), your orders, quotations and saved builds."] },
      { heading: "How we use it", body: ["To process orders and quotations, contact you about them, and provide warranty support. We don't sell your data."] },
      { heading: "Cookies & local storage", body: ["We use a sign-in cookie for accounts, and your browser's local storage to keep your cart and PC build between visits."] },
      { heading: "Contact", body: ["For any privacy question or deletion request, email us at thecomputerstore@live.in."] },
    ],
  },
  terms: {
    title: "Terms of Use",
    description: "Terms for using this website and buying from The Computer Store.",
    sections: [
      { heading: "Prices & availability", body: ["Prices include GST and may change without notice. An order is confirmed only after we verify stock and receive payment or advance."] },
      { heading: "Compatibility checks", body: ["Our PC Builder checks compatibility using manufacturer specifications. Technicians verify every custom PC before assembly; final responsibility for self-assembled parts rests with the buyer."] },
      { heading: "Quotations", body: ["Quotations are valid for the period stated on them and are subject to stock availability."] },
    ],
  },
  faqs: {
    title: "Frequently Asked Questions",
    description: "Answers about the PC Builder, orders, delivery and warranty.",
    sections: [],
  },
  careers: {
    title: "Careers",
    description: "Work with us at The Computer Store, Shillong.",
    sections: [
      { heading: "Join the team", body: ["We're always glad to hear from PC technicians, sales staff and IT support people who love hardware and helping customers. Send your details and experience through our contact page or visit the store."] },
    ],
  },
};
