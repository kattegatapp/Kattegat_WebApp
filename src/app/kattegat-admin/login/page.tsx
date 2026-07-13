import Image from "next/image";
import Link from "next/link";

import { AdminLoginAtmosphere } from "@/features/admin/auth/login-atmosphere";
import { AdminLoginForm } from "@/features/admin/auth/login-form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function AdminLoginPage() {
  return (
    <main className="admin-login-scene relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
      <AdminLoginAtmosphere />

      <div className="relative z-10 grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="animate-in fade-in slide-in-from-bottom-4 hidden duration-700 lg:block">
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="relative flex h-14 w-14 items-center justify-center">
              <span className="admin-login-ring absolute inset-0 rounded-2xl bg-brand-mantis/25 blur-md" />
              <Image
                src="/brand/app-icon.png"
                alt="Kattegat"
                width={56}
                height={56}
                className="relative rounded-2xl ring-1 ring-white/20 transition-transform duration-500 group-hover:scale-[1.03]"
                priority
              />
            </span>
            <span className="text-2xl font-extrabold tracking-tight text-white">Kattegat</span>
          </Link>

          <div className="mt-8">
            <Badge className="border-brand-mantis/30 bg-black/30 text-brand-mantis backdrop-blur">
              Private entrance · Staff only
            </Badge>
          </div>

          <h1 className="mt-5 max-w-md text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-white xl:text-5xl">
            Run the night.
            <span className="mt-2 block bg-gradient-to-r from-white via-brand-mantis to-[#9b7cff] bg-clip-text text-transparent">
              Behind the scenes.
            </span>
          </h1>
          <p className="mt-4 max-w-sm text-base leading-7 text-white/60">
            The private control room for Kattegat operations. Manage the experience while the city stays awake.
          </p>

          <div className="mt-8 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-mantis/80">
            <Separator className="w-8 bg-brand-mantis/50" />
            Encrypted after-hours access
          </div>
        </div>

        <div className="mx-auto w-full max-w-[420px] lg:mx-0 lg:justify-self-end">
          <div className="animate-in fade-in slide-in-from-bottom-3 mb-7 flex flex-col items-center text-center duration-700 lg:hidden">
            <Link href="/" className="group mb-5 flex flex-col items-center gap-3">
              <span className="relative flex h-14 w-14 items-center justify-center">
                <span className="admin-login-ring absolute inset-0 rounded-2xl bg-brand-mantis/25 blur-md" />
                <Image
                  src="/brand/app-icon.png"
                  alt="Kattegat"
                  width={56}
                  height={56}
                  className="relative rounded-2xl ring-1 ring-white/20"
                  priority
                />
              </span>
              <span className="text-2xl font-extrabold tracking-tight text-white">Kattegat</span>
            </Link>
            <Badge className="mb-3 border-white/15 bg-white/10 text-white/80 backdrop-blur">
              Private entrance
            </Badge>
            <h1 className="text-lg font-semibold text-white/90">Sign in to admin</h1>
            <p className="mt-1.5 text-sm text-white/50">Your night starts behind the scenes.</p>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 delay-100 duration-700">
            <AdminLoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
