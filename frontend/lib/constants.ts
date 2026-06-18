export const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || BACKEND_URL;

export const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_STRIPE_KEY ||
  "";

export const ACCESS_TOKEN_COOKIE = "accessToken";
export const REFRESH_TOKEN_COOKIE = "refreshToken";

export const site = {
  name: "Serene Stays",
  tagline: "Where stillness becomes a stay",
  phone: "+1 (555) 012-3456",
  email: "concierge@serenestays.com",
};

export const navLinks = [
  { label: "Suites", href: "#suites" },
  { label: "Spa", href: "#spa" },
  { label: "Packages", href: "#packages" },
  { label: "Experiences", href: "#experiences" },
];

export const stats = [
  { value: "48", label: "Spa rituals" },
  { value: "12", label: "Signature suites" },
  { value: "4.9", label: "Guest rating" },
  { value: "24/7", label: "Concierge" },
  { value: "3", label: "Wellness tiers" },
];

export const experiencePaths = [
  {
    title: "Rest & Restore",
    description:
      "Warm stone, eucalyptus air, and ninety minutes of stillness in our garden spa.",
    href: "#spa",
  },
  {
    title: "Celebrate",
    description:
      "Private suites, candlelit dining, and unhurried evenings made for milestones.",
    href: "#packages",
  },
  {
    title: "Reconnect",
    description:
      "Couples rituals, terrace sunsets, and shared moments away from the everyday.",
    href: "#packages",
  },
  {
    title: "Renew",
    description:
      "Guided wellness programs with nutrition, movement, and restorative sleep.",
    href: "#packages",
  },
];

export const packages = [
  {
    name: "Essential",
    price: "$1,890",
    duration: "3 nights · 2 treatments",
    description: "A gentle introduction to calm — perfect for a short reset.",
    features: [
      "Garden-view room",
      "Welcome herbal tea ritual",
      "60-min signature massage",
      "Morning yoga session",
    ],
    highlighted: false,
  },
  {
    name: "Signature",
    price: "$3,450",
    duration: "5 nights · 5 treatments",
    description:
      "Our most-loved retreat — balance, restoration, and unhurried luxury.",
    features: [
      "Terrace suite with horizon views",
      "Daily spa treatment",
      "Seasonal tasting menu",
      "Private concierge planning",
      "Sunset meditation",
    ],
    highlighted: true,
  },
  {
    name: "Transform",
    price: "$5,200",
    duration: "7 nights · All-inclusive wellness",
    description: "A complete renewal — body, mind, and rhythm fully restored.",
    features: [
      "Premium suite with private terrace",
      "Full wellness program",
      "Nutrition & fitness coaching",
      "All meals included",
      "Departure renewal kit",
    ],
    highlighted: false,
  },
];

export const spaTreatments = [
  {
    name: "Garden Stone Massage",
    duration: "90 min",
    price: "From $185",
    description:
      "Heated river stones, warm oils, and the quiet rhythm of the garden.",
  },
  {
    name: "Eucalyptus Renewal",
    duration: "60 min",
    price: "From $145",
    description:
      "Deep inhalation therapy with botanical oils and scalp ritual.",
  },
  {
    name: "Sunrise Yoga & Tea",
    duration: "75 min",
    price: "From $95",
    description:
      "Terrace flow at first light, followed by a curated herbal ceremony.",
  },
];

export const testimonials = [
  {
    quote:
      "We arrived exhausted and left feeling like ourselves again. Every detail felt considered.",
    name: "Elena & Marcus",
    detail: "Anniversary retreat",
  },
  {
    quote:
      "The spa isn't an add-on — it's the heart of the stay. I've never slept so deeply.",
    name: "Sarah Chen",
    detail: "Solo wellness escape",
  },
  {
    quote:
      "Our concierge planned the perfect celebration. It felt personal, not packaged.",
    name: "The Whitmore Family",
    detail: "Milestone gathering",
  },
];

export const trustItems = [
  {
    title: "Flexible cancellation",
    description: "Free changes until 48 hours before arrival.",
  },
  {
    title: "Best rate guarantee",
    description: "Book direct for our lowest available price.",
  },
  {
    title: "24/7 concierge",
    description: "A real person, always ready to help plan your stay.",
  },
];

export const faqs = [
  {
    question: "Can I book spa treatments without a room?",
    answer:
      "Yes. Standalone spa reservations are available for day guests, subject to availability. We recommend booking at least one week ahead for weekend visits.",
  },
  {
    question: "What is included in wellness packages?",
    answer:
      "Each tier includes accommodations, a set number of spa treatments, and curated dining or wellness activities. The Signature and Transform packages include concierge planning.",
  },
  {
    question: "What is your cancellation policy?",
    answer:
      "Stays may be modified or cancelled without penalty up to 48 hours before check-in. Package bookings follow the same policy unless noted at purchase.",
  },
  {
    question: "Do you accommodate dietary preferences?",
    answer:
      "Absolutely. Share preferences when booking or with our concierge before arrival — our kitchen prepares seasonal menus with flexibility in mind.",
  },
];

export const footerLinks = {
  stay: [
    { label: "Suites & rooms", href: "#suites" },
    { label: "Dining", href: "#" },
    { label: "Experiences", href: "#experiences" },
  ],
  wellness: [
    { label: "Spa menu", href: "#spa" },
    { label: "Packages", href: "#packages" },
    { label: "Day passes", href: "#" },
  ],
  help: [
    { label: "Contact concierge", href: "#" },
    { label: "FAQs", href: "#faq" },
    { label: "Gift certificates", href: "#" },
  ],
};
