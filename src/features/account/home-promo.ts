import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  Gift,
  Heart,
  LayoutGrid,
  MessageCircle,
  Megaphone,
  Search,
  ShieldCheck,
} from "lucide-react";

export type HomePromoSlide = {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  gradient: string;
  image: string;
  imageAlt: string;
  imagePosition: string;
  action: "browse" | "requirements" | "my-requirements" | "my-listings" | "saved" | "referrals" | "chat" | "categories";
};

/** Mirrors mobile `BUYER_PROMO_SLIDES` / `SELLER_PROMO_SLIDES` copy for web home. */
export const BUYER_HOME_PROMOS: HomePromoSlide[] = [
  {
    id: "buyer-post-requirement",
    icon: Megaphone,
    title: "Post once, get matched",
    subtitle: "Share your requirement and let hospitality providers apply directly to you.",
    gradient: "from-brand-forest via-[#0a2e1a] to-brand-blue",
    image: "/assets/landing-slides/live-vocalist.jpg",
    imageAlt: "Vocalist performing live at a hospitality venue",
    imagePosition: "52% 22%",
    action: "my-requirements",
  },
  {
    id: "buyer-browse-categories",
    icon: LayoutGrid,
    title: "Hospitality categories",
    subtitle: "Entertainment, F&B, events, creative, fit-out, training, and more.",
    gradient: "from-brand-blue via-[#123a4a] to-brand-forest",
    image: "/assets/landing-slides/live-drummer.jpg",
    imageAlt: "Live drummer performing at a hospitality venue",
    imagePosition: "58% 24%",
    action: "categories",
  },
  {
    id: "buyer-chat-direct",
    icon: MessageCircle,
    title: "Chat directly, no middleman",
    subtitle: "Message providers in-app and keep every conversation in one place.",
    gradient: "from-brand-forest via-[#0d3d22] to-brand-emerald",
    image: "/assets/landing-slides/live-dj.jpg",
    imageAlt: "DJ performing a live set",
    imagePosition: "52% 22%",
    action: "chat",
  },
  {
    id: "buyer-save-shortlist",
    icon: Heart,
    title: "Save your shortlist",
    subtitle: "Favorite services and providers, then compare them side by side later.",
    gradient: "from-brand-forest via-[#0a2e1a] to-brand-blue",
    image: "/assets/landing-slides/live-guitarist.jpg",
    imageAlt: "Guitarist performing live",
    imagePosition: "54% 24%",
    action: "saved",
  },
  {
    id: "buyer-referrals",
    icon: Gift,
    title: "Invite and earn",
    subtitle: "Share your referral link and climb the live competition leaderboard.",
    gradient: "from-brand-blue via-[#123a4a] to-brand-mantis/80",
    image: "/assets/landing-slides/live-vocalist.jpg",
    imageAlt: "Hospitality performer engaging an audience",
    imagePosition: "54% 20%",
    action: "referrals",
  },
];

export const SELLER_HOME_PROMOS: HomePromoSlide[] = [
  {
    id: "seller-get-discovered",
    icon: Search,
    title: "Get discovered",
    subtitle: "Show up in search and category browsing across all of Kattegat.",
    gradient: "from-brand-forest via-[#0a2e1a] to-brand-blue",
    image: "/assets/landing-slides/live-guitarist.jpg",
    imageAlt: "Professional guitarist performing live",
    imagePosition: "54% 23%",
    action: "my-listings",
  },
  {
    id: "seller-respond-requirements",
    icon: ClipboardList,
    title: "Respond to live requirements",
    subtitle: "Hospitality clients post what they need — apply directly, no bidding wars.",
    gradient: "from-brand-blue via-[#123a4a] to-brand-forest",
    image: "/assets/landing-slides/live-drummer.jpg",
    imageAlt: "Professional drummer performing live",
    imagePosition: "58% 23%",
    action: "requirements",
  },
  {
    id: "seller-chat-book",
    icon: MessageCircle,
    title: "Chat with serious buyers",
    subtitle: "Speak to clients in-app once direct messaging is available for the opportunity.",
    gradient: "from-brand-forest via-[#0d3d22] to-brand-emerald",
    image: "/assets/landing-slides/live-dj.jpg",
    imageAlt: "DJ performing for a hospitality audience",
    imagePosition: "52% 22%",
    action: "chat",
  },
  {
    id: "seller-trust-badges",
    icon: ShieldCheck,
    title: "Earn trust badges",
    subtitle: "Verified status helps you stand out — finish identity verification when ready.",
    gradient: "from-brand-blue via-[#123a4a] to-brand-mantis/80",
    image: "/assets/landing-slides/live-vocalist.jpg",
    imageAlt: "Verified professional vocalist performing",
    imagePosition: "54% 20%",
    action: "my-listings",
  },
  {
    id: "seller-referrals",
    icon: Gift,
    title: "Grow with referrals",
    subtitle: "Invite peers, climb the leaderboard, and earn from every qualified signup.",
    gradient: "from-brand-forest via-[#0a2e1a] to-brand-blue",
    image: "/assets/landing-slides/live-guitarist.jpg",
    imageAlt: "Hospitality professional performing live",
    imagePosition: "54% 24%",
    action: "referrals",
  },
];
