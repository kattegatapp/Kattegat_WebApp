import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist } from "next/font/google";

import { Providers } from "@/lib/providers";
import "./globals.css";
import { cn } from "@/lib/utils";
import { getPublicAppSettings } from "@/lib/api/settings";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const siteMetadata = {
  title: "Kattegat | Dubai Events & Hospitality Talent Marketplace",
  description:
    "Join Kattegat, Dubai's direct marketplace for events and hospitality talent. Find talent, get booked, and skip the middlemen.",
  image: "/opengraph-image.png",
};

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicAppSettings();
  const metadataBase = new URL(settings.links.webAppUrl);

  return {
    metadataBase,
    title: siteMetadata.title,
    description: siteMetadata.description,
    keywords: settings.metadata.keywords,
    openGraph: {
      title: siteMetadata.title,
      description: siteMetadata.description,
      siteName: settings.brand.siteName,
      images: [
        {
          url: settings.metadata.ogImageUrl ?? siteMetadata.image,
          width: 1200,
          height: 630,
          alt: "Kattegat - Find talent. Get booked. No middlemen.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteMetadata.title,
      description: siteMetadata.description,
      images: [settings.metadata.ogImageUrl ?? siteMetadata.image],
    },
    icons: {
      icon: "/brand/app-icon.png",
      apple: "/brand/app-icon.png",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={cn("h-full", "scroll-smooth", "antialiased", plusJakartaSans.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
