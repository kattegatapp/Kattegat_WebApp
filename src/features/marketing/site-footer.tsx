import { AtSign } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { KATTEGAT_SOCIALS } from "@/features/marketing/socials";

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-8 w-full max-w-6xl border-t border-brand-forest/10 px-5 py-10 text-center sm:px-8">
      <Image
        src="/brand/logo/logo-horizontal-alternative.png"
        alt="Kattegat"
        width={180}
        height={56}
        className="mx-auto opacity-90"
        style={{ width: "auto", height: 42 }}
      />
      <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-3">
        {KATTEGAT_SOCIALS.map((social) => (
          <Link
            key={social.href}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-brand-forest"
          >
            <AtSign className="h-4 w-4" />
            {social.label}
          </Link>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-semibold text-muted-foreground">
        <Link href="/terms-of-service" className="hover:text-brand-forest">
          Terms of Service
        </Link>
        <Link href="/privacy-policy" className="hover:text-brand-forest">
          Privacy Policy
        </Link>
        <Link href="/delete-account" className="hover:text-brand-forest">
          Delete Account
        </Link>
      </div>
      <p className="mt-5 text-xs text-muted-foreground">
        © 2026 Kattegat · Hidden Diversion Recreational Services · Dubai, UAE
      </p>
    </footer>
  );
}
