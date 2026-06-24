export const siteConfig = {
  name: "Rayzor Industrial Packaging Pvt Ltd",
  tagline: "Industrial Packaging Solutions",
  description:
    "Rayzor Industrial Packaging Pvt Ltd — where expertise meets innovation. For over two decades, we've been the driving force behind tailor-made packaging solutions from our production hub in Madurai, Tamil Nadu, India.",
  url: "https://www.rayzorpack.com",

  contact: {
    phone: "+91 9087787879",
    secondaryPhone: "+91 9087787875",
    tertiaryPhone: "+91 9087787876",
    email: "sales@rayzorpack.com",
    address:
      "No:59, SIDCO Industrial Estate, Kappalur, Madurai - 625008, Tamilnadu, India",
    city: "Madurai",
    state: "Tamil Nadu",
    postcode: "625008",
  },

  serviceAreas: "Madurai | Chennai | Bangalore",

  social: {
    instagram: "https://www.instagram.com/rayzorpack/",
    linkedin: "https://www.linkedin.com/company/rayzorpack/",
    facebook: "https://www.facebook.com/RayzorPack",
    twitter: "https://x.com/RayzorPack",
  },

  services: [
    {
      id: "ldpe-film-rolls",
      title: "LDPE Film Rolls",
      description:
        "Premium quality LDPE film rolls offering superior strength and stretchability for industrial packaging needs.",
      icon: "Package",
    },
    {
      id: "ldpe-bags",
      title: "LDPE Bags",
      description:
        "Durable, tear-resistant LDPE bags available in custom sizes for secure product handling and transit.",
      icon: "ShoppingBag",
    },
    {
      id: "vci-poly-bags",
      title: "VCI Poly Bags & Covers",
      description:
        "Advanced anti-corrosion VCI poly bags designed to protect metal components from rust and moisture.",
      icon: "Shield",
    },
    {
      id: "stretch-films",
      title: "Stretch Films",
      description:
        "High-cling stretch films for secure pallet wrapping, providing excellent load stability.",
      icon: "Layers",
    },
    {
      id: "hdpe-bags",
      title: "HDPE Bags",
      description:
        "High-density polyethylene bags providing exceptional tensile strength and chemical resistance.",
      icon: "Box",
    },
    {
      id: "bubble-wrap",
      title: "Bubble Wrap Rolls",
      description:
        "Protective bubble wrap cushioning to safeguard fragile items during shipping and storage.",
      icon: "CircleDashed",
    },
  ],

  themeColors: {
    primary: "#006196",
    secondary: "#feb234",
    background: "#fff",
    dark: "#1b1c19",
    accent: "#feb234",
  },
};

export type SiteConfig = typeof siteConfig;
