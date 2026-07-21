import type { LucideIcon } from "lucide-react";
import {
  BriefcaseBusiness,
  Building2,
  Camera,
  ClipboardList,
  GraduationCap,
  Music2,
  PartyPopper,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";

export type ShowcaseService = {
  id: string;
  initials: string;
  name: string;
  service: string;
  rating: number;
  reviewCount: number;
  priceLabel: string;
  coverClass: string;
  badges: ("verified" | "pro" | "vetted" | "founding")[];
  href: string;
};

export type ShowcaseRequirement = {
  id: string;
  title: string;
  category: string;
  body: string;
  budget: string;
  applicants: number;
  ago: string;
};

export type AccountCategory = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  tag?: { label: string; tone: "free" | "jobs" };
  href: string;
};

export const SHOWCASE_SERVICES: ShowcaseService[] = [
  {
    id: "1",
    initials: "LN",
    name: "Lena Novak",
    service: "Resident DJ · deep house & afro — rooftop & beach club sets",
    rating: 5,
    reviewCount: 84,
    priceLabel: "AED 2,500",
    coverClass: "from-[#0e4a2a] to-brand-blue",
    badges: ["vetted"],
    href: "/search?q=dj",
  },
  {
    id: "2",
    initials: "RS",
    name: "Rami Saab",
    service: "Shisha operations — full team outsourcing for lounges & hotels",
    rating: 4.9,
    reviewCount: 126,
    priceLabel: "AED 12,000",
    coverClass: "from-[#123f57] to-[#0e4a2a]",
    badges: ["verified", "pro"],
    href: "/search?q=shisha",
  },
  {
    id: "3",
    initials: "DK",
    name: "Dana Khoury",
    service: "Food & venue photography — menus, interiors, launch campaigns",
    rating: 4.8,
    reviewCount: 58,
    priceLabel: "AED 1,800",
    coverClass: "from-[#28502f] to-[#123c50]",
    badges: ["verified", "pro", "founding"],
    href: "/search?q=photography",
  },
  {
    id: "4",
    initials: "OF",
    name: "Omar Farouk",
    service: "Restaurant concept development — menu engineering & launch",
    rating: 4.9,
    reviewCount: 93,
    priceLabel: "AED 8,500",
    coverClass: "from-[#0d3d3a] to-[#274a24]",
    badges: ["verified", "pro"],
    href: "/search?q=restaurant",
  },
];

export const SHOWCASE_REQUIREMENTS: ShowcaseRequirement[] = [
  {
    id: "r1",
    title: "Resident saxophonist — Friday & Saturday brunch, JBR beachfront",
    category: "Entertainment & Talent",
    body: "Beachfront venue seeking a saxophonist to pair with our resident DJ for weekend brunch. 2 × 45-minute sets. 3-month residency, immediate start.",
    budget: "AED 1,200 / day",
    applicants: 14,
    ago: "2h ago",
  },
  {
    id: "r2",
    title: "Full shisha team outsourcing — new lounge, Business Bay",
    category: "Hospitality & F&B",
    body: "Opening late August. Need a complete managed shisha operation: head shisha master plus four staff, inventory and menu included.",
    budget: "AED 35,000 / month",
    applicants: 6,
    ago: "5h ago",
  },
  {
    id: "r3",
    title: "Launch campaign videographer — Downtown rooftop opening",
    category: "Creative & Media",
    body: "Opening-night coverage plus a 60-second hero reel and 10 short cuts for social. Must have hospitality launch portfolio in the UAE.",
    budget: "AED 9,000 / project",
    applicants: 21,
    ago: "1d ago",
  },
  {
    id: "r4",
    title: "Corporate gala production — 400 pax, DIFC, September",
    category: "Event Production",
    body: "End-to-end production: staging, AV, lighting, run-of-show, and talent coordination. Proposals with full cost breakdown only.",
    budget: "AED 180,000 budget",
    applicants: 9,
    ago: "1d ago",
  },
  {
    id: "r5",
    title: "Mixology masterclass series — hotel academy, monthly",
    category: "Education & Training",
    body: "Monthly staff training series across two properties. Curriculum, materials, and certification support required.",
    budget: "AED 4,500 / session",
    applicants: 11,
    ago: "2d ago",
  },
  {
    id: "r6",
    title: "Interior fit-out — 180 m² café conversion, Al Quoz",
    category: "Fit-Out",
    body: "Full conversion from retail shell to specialty café. Design intent ready; need licensed contractor with F&B fit-out track record.",
    budget: "AED 420,000 budget",
    applicants: 4,
    ago: "3d ago",
  },
];

export const ACCOUNT_CATEGORIES: AccountCategory[] = [
  {
    id: "entertainment",
    name: "Entertainment & Talent Services",
    description: "Musicians, DJs, performers, hosts, specialty acts, immersive entertainers.",
    icon: Music2,
    href: "/search?q=entertainment",
  },
  {
    id: "fnb",
    name: "Hospitality & F&B Consulting",
    description: "Restaurant consultancy, shisha consultancy, menu & concept development, venue lead generation.",
    icon: UtensilsCrossed,
    href: "/search?q=hospitality",
  },
  {
    id: "events",
    name: "Event Production & Management",
    description: "Corporate events, weddings, private parties — planning, logistics, staging, rentals.",
    icon: PartyPopper,
    href: "/search?q=event+production",
  },
  {
    id: "creative",
    name: "Creative & Media Solutions",
    description: "Branding, design, photography, videography, marketing, content creation.",
    icon: Camera,
    href: "/search?q=creative",
  },
  {
    id: "fitout",
    name: "Contracting & Fit-Out Services",
    description: "Venue outfitting, technical contractors, interior fit-out, equipment suppliers.",
    icon: Wrench,
    href: "/search?q=fit-out",
  },
  {
    id: "professional",
    name: "Specialized Professional Services",
    description: "Tailoring, niche consultancies, bespoke service providers.",
    icon: BriefcaseBusiness,
    href: "/search?q=consulting",
  },
  {
    id: "education",
    name: "Education & Training",
    description: "Mixology classes, chef-led workshops, wine tastings, hospitality training, creative skill-building.",
    icon: GraduationCap,
    tag: { label: "Free at launch", tone: "free" },
    href: "/search?q=training",
  },
  {
    id: "requirements",
    name: "Requirements & Jobs",
    description: "Buyers post requirements — sellers browse and apply directly inside Kattegat.",
    icon: ClipboardList,
    tag: { label: "Buyer posts", tone: "jobs" },
    href: "/search?q=requirements",
  },
  {
    id: "businesses",
    name: "Businesses for Sale",
    description: "Established venues and operations for sale — confidential enquiry, private by design.",
    icon: Building2,
    href: "/services",
  },
];

export const CATEGORY_CHIPS = [
  "All",
  "Entertainment & Talent",
  "F&B Consulting",
  "Event Production",
  "Creative & Media",
  "Fit-Out",
  "Education & Training",
] as const;
