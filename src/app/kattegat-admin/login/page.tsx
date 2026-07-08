import Image from "next/image";
import Link from "next/link";

import { AdminInsightPreview } from "@/components/admin/admin-insight-preview";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { Badge } from "@/components/ui/badge";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-brand-forest px-3 py-3 sm:px-6 sm:py-6">
      <div className="relative mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#00220b] via-brand-forest to-[#0a2530] px-5 py-6 shadow-2xl sm:min-h-[calc(100vh-3rem)] sm:rounded-[3rem] sm:px-8 lg:px-14">
        <div className="animate-drift pointer-events-none absolute -right-24 -top-20 h-[26rem] w-[26rem] rounded-full bg-brand-mantis/20 blur-3xl" />
        <div className="animate-drift-reverse pointer-events-none absolute -left-28 bottom-[-6rem] h-[28rem] w-[28rem] rounded-full bg-brand-blue/30 blur-3xl" />
        <div className="animate-drift pointer-events-none absolute right-1/4 bottom-1/3 h-72 w-72 rounded-full bg-brand-emerald/14 blur-3xl" />

        <header className="animate-in fade-in slide-in-from-top-4 relative z-10 flex items-center justify-between gap-4 duration-700">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/brand/app-icon.png" alt="Kattegat" width={38} height={38} className="rounded-xl" />
            <span className="text-sm font-semibold uppercase tracking-wide text-white">Kattegat</span>
          </Link>
          <Badge className="border-white/25 bg-white/12 text-white backdrop-blur">Admin portal</Badge>
        </header>

        <section className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 py-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="space-y-6">
            <div className="animate-in fade-in slide-in-from-bottom-4 space-y-3 duration-700">
              <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-brand-mantis">
                /kattegat-admin/login
              </p>
              <h1 className="max-w-md text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl">
                Operations access for launch control.
              </h1>
              <p className="max-w-md text-base leading-7 text-white/70">
                Isolated from the public waitlist flow. Sign in with your agent or admin credentials
                to reach launch operations.
              </p>
            </div>
            <AdminLoginForm />
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-6 delay-200 duration-700">
            <AdminInsightPreview />
          </div>
        </section>
      </div>
    </main>
  );
}
