import Image from "next/image";
import Link from "next/link";

import { ImpersonationBanner } from "@/features/admin/impersonation/impersonation-banner";
import { readImpersonationState } from "@/lib/admin/impersonation";
import { getPublicAppSettings } from "@/lib/api/settings";

export async function MemberAuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const [settings, impersonation] = await Promise.all([
    getPublicAppSettings(),
    readImpersonationState(),
  ]);
  const brandName = settings.brand.siteName;

  return (
    <main className="marketing-site relative isolate min-h-dvh overflow-hidden bg-[#F7F9F8] text-brand-forest">
      {impersonation ? <ImpersonationBanner /> : null}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_12%_0%,rgb(111_219_66/0.14),transparent_40%),radial-gradient(ellipse_at_88%_100%,rgb(72_220_129/0.1),transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-brand-emerald/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-brand-blue/10 blur-3xl"
      />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[1200px] flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-mantis"
            aria-label={`${brandName} home`}
          >
            <Image
              src="/brand/app-icon.png"
              alt=""
              width={44}
              height={44}
              className="rounded-[13px] ring-1 ring-brand-forest/10 shadow-sm"
              priority
            />
            <Image
              src="/brand/logo/logo-horizontal-main.png"
              alt={brandName}
              width={160}
              height={40}
              className="hidden h-8 w-auto object-contain sm:block"
              priority
            />
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-brand-forest/55 transition hover:text-brand-forest"
          >
            Back to website
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-16 lg:py-14">
          <section className="hidden lg:block">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-brand-forest/10 bg-white shadow-[0_24px_64px_rgb(0_57_18/0.08)]">
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.22]"
                style={{
                  backgroundImage: "url(/brand/launch-visual.jpg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-white via-white/92 to-white/75"
              />
              <div className="relative p-8 xl:p-10">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-blue">
                  Dubai · entertainment & hospitality
                </p>
                <h1 className="mt-4 max-w-md text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-balance xl:text-[2.65rem]">
                  One account. Buyer and seller when you need both.
                </h1>
                <p className="mt-4 max-w-sm text-sm leading-7 text-brand-forest/65">
                  Sign in to manage your web account, referrals, billing, and plans — the same
                  Kattegat identity you use in the app.
                </p>
                <div className="mt-8 flex items-center gap-3 rounded-2xl border border-brand-forest/8 bg-[#F7F9F8]/80 px-4 py-3">
                  <Image
                    src="/brand/logo/brandmark-main.png"
                    alt=""
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                  <p className="text-sm font-semibold text-brand-forest/70">
                    Built for UAE talent and venues — no middlemen.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-[440px] lg:mx-0 lg:justify-self-end">
            <div className="mb-6 flex justify-center lg:hidden">
              <Image
                src="/brand/logo/logo-horizontal-main.png"
                alt={brandName}
                width={180}
                height={45}
                className="h-9 w-auto object-contain"
                priority
              />
            </div>
            <div className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
              <h2 className="text-2xl font-extrabold tracking-tight text-brand-forest sm:text-[1.7rem]">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-brand-forest/60">{description}</p>
              <div className="mt-6">{children}</div>
            </div>
          </section>
        </div>

        <footer className="pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-forest/35">
          © {new Date().getFullYear()} {brandName}
        </footer>
      </div>
    </main>
  );
}
