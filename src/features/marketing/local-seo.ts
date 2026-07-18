export type DubaiSeoPage = {
  slug: string;
  /** SERP / H1 service label */
  name: string;
  /** Short phrase for titles: "DJs", "event hosts" */
  pluralLabel: string;
  /** Passed to listings search `q` */
  searchQuery: string;
  /** Optional catalog category match helper */
  categoryQuery: string;
  headline: string;
  intro: string;
  bullets: string[];
};

/**
 * Local SEO landing pages for Dubai search intent.
 * URLs: /dubai/[slug]
 */
export const DUBAI_SEO_PAGES: DubaiSeoPage[] = [
  {
    slug: "dj",
    name: "DJ",
    pluralLabel: "DJs",
    searchQuery: "DJ",
    categoryQuery: "Entertainment",
    headline: "Book DJs in Dubai",
    intro:
      "Find DJs for clubs, private parties, weddings, and brand events across Dubai. Browse live Kattegat listings and connect directly — no agency commission in the middle.",
    bullets: [
      "Club, lounge, and private-event DJs",
      "Direct messaging with sellers in the app",
      "0% booking commission on Kattegat",
    ],
  },
  {
    slug: "event-host",
    name: "Event host",
    pluralLabel: "event hosts",
    searchQuery: "host",
    categoryQuery: "Entertainment",
    headline: "Event hosts in Dubai",
    intro:
      "Hire professional hosts and MCs for launches, galas, and hospitality nights in Dubai. Compare live profiles on Kattegat and continue in the app to book.",
    bullets: [
      "Hosts and MCs for venues and events",
      "Clear profiles and marketplace signals",
      "Direct booking path in the Kattegat app",
    ],
  },
  {
    slug: "entertainment",
    name: "Entertainment",
    pluralLabel: "entertainment talent",
    searchQuery: "Entertainment",
    categoryQuery: "Entertainment",
    headline: "Entertainment talent in Dubai",
    intro:
      "Discover performers, hosts, DJs, and production talent for Dubai nights and events. Kattegat connects venues and buyers directly with sellers.",
    bullets: [
      "Performers, hosts, DJs, and production",
      "Built for Dubai hospitality and events",
      "Message and book in the mobile app",
    ],
  },
  {
    slug: "event-management",
    name: "Event management",
    pluralLabel: "event managers",
    searchQuery: "Event management",
    categoryQuery: "Event management",
    headline: "Event management in Dubai",
    intro:
      "Find event management specialists for experiences of every scale in Dubai — from intimate gatherings to large productions.",
    bullets: [
      "Planning and delivery partners",
      "Live marketplace listings",
      "Direct seller conversations",
    ],
  },
  {
    slug: "restaurant-consultancy",
    name: "Restaurant consultancy",
    pluralLabel: "restaurant consultants",
    searchQuery: "Restaurant consultancy",
    categoryQuery: "Restaurant consultancy",
    headline: "Restaurant consultancy in Dubai",
    intro:
      "Connect with restaurant consultants for concept, menu, operations, and guest experience work across Dubai’s hospitality scene.",
    bullets: [
      "Concept, menu, and operations support",
      "Hospitality-focused marketplace",
      "Continue in-app to message specialists",
    ],
  },
  {
    slug: "marketing",
    name: "Marketing",
    pluralLabel: "marketing specialists",
    searchQuery: "Marketing",
    categoryQuery: "Marketing",
    headline: "Marketing services in Dubai",
    intro:
      "Browse marketing talent for strategy, creative, campaigns, and content — built for Dubai venues, events, and hospitality brands.",
    bullets: [
      "Strategy, creative, and campaigns",
      "Verified marketplace listings",
      "No middleman booking commission",
    ],
  },
  {
    slug: "fit-out",
    name: "Fit-out",
    pluralLabel: "fit-out specialists",
    searchQuery: "Fit-out",
    categoryQuery: "Fit-out",
    headline: "Fit-out specialists in Dubai",
    intro:
      "Find fit-out and venue specialist teams for hospitality spaces and event environments in Dubai.",
    bullets: [
      "Venue and event-space specialists",
      "Live listings on Kattegat",
      "Direct contact via the app",
    ],
  },
  {
    slug: "shisha",
    name: "Shisha outsourcing",
    pluralLabel: "shisha service teams",
    searchQuery: "Shisha",
    categoryQuery: "Shisha",
    headline: "Shisha outsourcing in Dubai",
    intro:
      "Source premium shisha operations and service teams for Dubai lounges, terraces, and events.",
    bullets: [
      "Operations and service teams",
      "Hospitality-ready marketplace",
      "Book directly through Kattegat",
    ],
  },
];

export function getDubaiSeoPage(slug: string) {
  return DUBAI_SEO_PAGES.find((page) => page.slug === slug);
}

export function dubaiHrefForQuery(query: string) {
  const normalized = query.trim().toLowerCase();
  const match = DUBAI_SEO_PAGES.find(
    (page) =>
      page.slug === normalized ||
      page.searchQuery.toLowerCase() === normalized ||
      page.categoryQuery.toLowerCase() === normalized ||
      page.name.toLowerCase() === normalized ||
      normalized.includes(page.searchQuery.toLowerCase()) ||
      page.categoryQuery.toLowerCase().includes(normalized),
  );
  return match ? `/dubai/${match.slug}` : null;
}

export function dubaiPageTitle(page: DubaiSeoPage) {
  return `${page.pluralLabel[0]?.toUpperCase()}${page.pluralLabel.slice(1)} in Dubai | Kattegat`;
}

export function dubaiPageDescription(page: DubaiSeoPage) {
  return page.intro.slice(0, 160);
}
