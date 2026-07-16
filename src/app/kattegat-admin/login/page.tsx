import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CircleCheck, ShieldCheck } from "lucide-react";

import { AdminLoginAtmosphere } from "@/features/admin/auth/login-atmosphere";
import { AdminLoginForm } from "@/features/admin/auth/login-form";

const highlights = ["Live operations", "Member support", "Platform oversight"];

export default function AdminLoginPage() {
  return (
    <main className="admin-login-scene relative min-h-dvh overflow-hidden bg-[#050806] text-white">
      <AdminLoginAtmosphere />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col px-5 py-5 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
        <header className="flex items-center justify-between">
          <Link href="/" className="group inline-flex items-center gap-3" aria-label="Kattegat home">
            <Image src="/brand/app-icon.png" alt="" width={42} height={42} className="rounded-[13px] ring-1 ring-white/15 transition-transform duration-300 group-hover:scale-[1.04]" priority />
            <span className="text-lg font-extrabold tracking-[-0.025em]">Kattegat</span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/55 transition-colors hover:text-white">
            Back to website <ArrowUpRight className="size-3.5" />
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-20 lg:py-16 xl:gap-32">
          <section className="hidden max-w-2xl animate-in fade-in slide-in-from-bottom-5 duration-700 lg:block">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-brand-mantis/20 bg-brand-mantis/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-mantis backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-brand-mantis shadow-[0_0_12px_#6fdb42]" />
              Kattegat control room
            </div>
            <h1 className="max-w-xl text-5xl font-extrabold leading-[0.98] tracking-[-0.055em] text-balance xl:text-6xl">
              Everything that keeps Kattegat moving.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/58 xl:text-lg xl:leading-8">
              One secure workspace for the team managing people, places, and every detail in between.
            </p>
            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3">
              {highlights.map((item) => (
                <span key={item} className="inline-flex items-center gap-2 text-xs font-semibold text-white/65">
                  <CircleCheck className="size-4 text-brand-mantis" /> {item}
                </span>
              ))}
            </div>
          </section>

          <section className="mx-auto w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700 lg:mx-0 lg:justify-self-end">
            <div className="mb-6 lg:hidden">
              <div className="mb-3 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-brand-mantis">
                <span className="size-1.5 rounded-full bg-brand-mantis" /> Control room
              </div>
              <h1 className="text-3xl font-extrabold tracking-[-0.04em]">Welcome back.</h1>
              <p className="mt-2 text-sm leading-6 text-white/55">Sign in to continue to Kattegat operations.</p>
            </div>
            <AdminLoginForm />
          </section>
        </div>

        <footer className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
          <span>© {new Date().getFullYear()} Kattegat</span>
          <span className="flex items-center gap-2"><ShieldCheck className="size-3.5 text-brand-mantis/65" /> Secure staff access</span>
        </footer>
      </div>
    </main>
  );
}
