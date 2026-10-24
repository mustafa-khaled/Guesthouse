export const site = {
  name: 'Serene Stays',
  tagline: 'Find your stillness.',
  phone: '+1 (555) 123-4567',
  email: 'hello@serenestays.com',
  location: 'Miami Beach, Florida',
  description:
    'A garden retreat for rest and renewal — suites, spa rituals, and unhurried wellness in a warm sanctuary.',
};

export const photography = {
  hero: 'https://images.unsplash.com/photo-1540541338287-41700207dee6',
  solo: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
  couples: 'https://images.unsplash.com/photo-1590490360182-c33d57733427',
  suites: [
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd',
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32',
  ],
  spa: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874',
  arrival: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c',
  garden: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b',
};

export const navLinks = [
  { label: 'Suites', href: '/#suites' },
  { label: 'Spa', href: '/#spa' },
  { label: 'Packages', href: '/#packages' },
  { label: 'Experiences', href: '/#experiences' },
];

export const stats = [
  { value: '12', label: 'Signature suites' },
  { value: '18', label: 'Treatment rooms' },
  { value: '4.9', label: 'Guest rating' },
  { value: '8', label: 'Years of care' },
];

export const faqs = [
  {
    question: 'What is the check-in / check-out time?',
    answer:
      'Check-in begins at 3 PM and check-out is at 11 AM. Early check-in and late check-out are available upon request and subject to availability.',
  },
  {
    question: 'Can I modify or cancel my reservation?',
    answer:
      'Yes — free cancellation is available up to 48 hours before your scheduled arrival. Modifications depend on availability and rate type.',
  },
  {
    question: 'Do you offer airport transfers?',
    answer:
      'Yes, we provide private transfers from the airport. Please contact our concierge at least 24 hours before your arrival to arrange transport.',
  },
  {
    question: 'Are spa treatments included in my stay?',
    answer:
      'Spa treatments are booked separately from your room reservation. Our wellness packages combine accommodation with curated spa rituals for a seamless experience.',
  },
  {
    question: 'What amenities are included?',
    answer:
      'All guests enjoy garden spa access, the fitness studio, complimentary Wi-Fi, daily yoga, and a welcome tea ceremony.',
  },
  {
    question: 'Is Serene Stays suitable for remote work?',
    answer:
      'Absolutely. Each suite has a dedicated workspace, high-speed Wi-Fi, and noise-minimising design. We also offer day-use rates for a focused change of scenery.',
  },
];

export const testimonials = [
  {
    name: 'Elena R.',
    detail: 'Wellness Loft, 5 nights',
    quote:
      "I came for rest and left carrying a quiet I hadn't felt in years. The garden spa, the tea ceremony, the morning light — every detail was intention.",
  },
  {
    name: 'Marcus T.',
    detail: 'Horizon Suite, 3 nights',
    quote:
      'The kind of place that recalibrates you. I slept deeper than I have in months, ate simply and well, and reconnected with what matters.',
  },
  {
    name: 'Sofia & David',
    detail: 'Garden Sanctuary, 7 nights',
    quote:
      "We booked a weekend and stayed a week. The staff anticipated every need without hovering. Our best escape yet — and we've already rebooked.",
  },
];

export const trustItems = [
  {
    title: 'Mindful hospitality',
    description:
      'Every touchpoint, from check-in to turndown, is designed to reduce friction and increase calm.',
  },
  {
    title: 'Warm, not formal',
    description:
      'We trade stuffy luxury for genuine warmth. Our team is present, personal, and unobtrusive.',
  },
  {
    title: 'Rooted in nature',
    description:
      'From the garden-to-table kitchen to botanical spa treatments, nature is our co-host and compass.',
  },
];

export const footerLinks = {
  stay: [
    { label: 'Suites', href: '/#suites' },
    { label: 'Book a stay', href: '/search' },
    { label: 'Our houses', href: '/search' },
    { label: 'Gift cards', href: '/#packages' },
  ],
  wellness: [
    { label: 'Garden spa', href: '/#spa' },
    { label: 'Yoga & meditation', href: '/#experiences' },
    { label: 'Wellness packages', href: '/#packages' },
    { label: 'Guest stories', href: '/#stories' },
  ],
  help: [
    { label: 'FAQs', href: '/#faq' },
    { label: 'Contact us', href: 'mailto:hello@serenestays.com' },
    { label: 'Cancellation policy', href: '/terms' },
    { label: 'Privacy policy', href: '/privacy' },
    { label: 'Terms of stay', href: '/terms' },
  ],
};

export const experiencePaths = [
  {
    index: 'I',
    title: 'Solo Reset',
    description:
      'A quiet escape designed for one — morning yoga, garden spa rituals, and unhurried time with a book.',
    meta: 'For one · 3–5 nights',
    image: photography.solo,
    href: '/search',
  },
  {
    index: 'II',
    title: 'Couples Retreat',
    description:
      'Shared stillness. A couples massage, candlelit garden dinner, and a suite with a deep soaking tub.',
    meta: 'For two · 2–7 nights',
    image: photography.couples,
    href: '/search',
  },
];

export const suites = [
  {
    name: 'Horizon Suite',
    description: 'Wake to horizon light and the rhythm of the tide from your private terrace.',
    detail: 'King bed · Terrace · Soaking tub',
    image: photography.suites[0],
  },
  {
    name: 'Garden Sanctuary',
    description: 'Floor-to-ceiling garden views, natural textures, and the hush of greenery.',
    detail: 'Queen bed · Garden view · Rain shower',
    image: photography.suites[1],
  },
  {
    name: 'Wellness Loft',
    description: 'A spacious retreat with a meditation nook and in-room wellness amenities.',
    detail: 'King bed · Loft · Wellness bar',
    image: photography.suites[2],
  },
];

export const spaTreatments = [
  {
    category: 'Body',
    name: 'Garden Stone Massage',
    duration: '60 min',
    price: '$145',
    description: 'Warm basalt stones and slow, flowing strokes melt tension and restore deep calm.',
  },
  {
    category: 'Body',
    name: 'Eucalyptus Renewal',
    duration: '75 min',
    price: '$175',
    description: 'A steamy eucalyptus wrap followed by a full-body scrub — skin feels reborn.',
  },
  {
    category: 'Garden',
    name: 'Sunrise Yoga & Tea',
    duration: '45 min',
    price: '$65',
    description: 'Gentle morning flow on the garden deck, followed by a curated tea ceremony.',
  },
];

export const packages = [
  {
    name: 'Essential',
    duration: '3 nights',
    price: '$1,080',
    description:
      'A gentle reset. Accommodation, daily breakfast, one spa treatment, and a welcome tea ceremony.',
    highlighted: false,
  },
  {
    name: 'Signature',
    duration: '5 nights',
    price: '$2,450',
    description:
      'Our most popular retreat. Everything in Essential plus daily yoga, two additional treatments, and a garden dinner.',
    highlighted: true,
  },
  {
    name: 'Transform',
    duration: '7 nights',
    price: '$4,200',
    description:
      'A complete renewal. All Signature inclusions plus a private wellness consultation and curated daily rituals.',
    highlighted: false,
  },
];

export const packageComparison = [
  { label: 'Accommodation', values: ['3 nights', '5 nights', '7 nights'] },
  {
    label: 'Dining',
    values: ['Daily breakfast', 'Breakfast + garden dinner', 'All meals & beverages'],
  },
  { label: 'Spa treatments', values: ['One treatment', 'Three treatments', 'Unlimited'] },
  { label: 'Yoga & meditation', values: ['—', 'Daily', 'Daily, curated'] },
  { label: 'Airport transfer', values: ['—', 'Included', 'Included'] },
  { label: 'Wellness consultation', values: ['—', '—', 'Private session'] },
];
