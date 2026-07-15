import Image from "next/image";

/** A cinematic, after-dark backdrop kept deliberately quiet behind the form. */
export function AdminLoginAtmosphere() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <Image
        src="/admin/nightlife-login.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="scale-[1.02] object-cover object-[44%_center]"
      />

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(3_4_10/0.18)_0%,rgb(3_4_12/0.3)_46%,rgb(3_4_10/0.8)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgb(2_3_9/0.22)_58%,rgb(2_3_8/0.72)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(2_3_8/0.08),transparent_45%,rgb(2_3_8/0.72))]" />

      <div className="admin-login-aurora absolute -left-1/4 top-[-20%] h-[70%] w-[65%] rounded-full bg-[radial-gradient(circle,rgb(111_219_66/0.16),transparent_62%)] blur-3xl" />
      <div className="admin-login-aurora absolute -right-1/4 bottom-[-30%] h-[70%] w-[60%] rounded-full bg-[radial-gradient(circle,rgb(28_71_89/0.28),transparent_62%)] blur-3xl [animation-delay:-4s]" />

      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgb(255 255 255 / 0.35) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.2) 1px, transparent 1px)",
          backgroundSize: "88px 88px",
          maskImage: "linear-gradient(to right, black, transparent 70%)",
          WebkitMaskImage: "linear-gradient(to right, black, transparent 70%)",
        }}
      />

      <div className="admin-login-beam absolute inset-y-0 -left-1/4 w-1/3 -skew-x-12 bg-[linear-gradient(90deg,transparent,rgb(111_219_66/0.09),rgb(255_255_255/0.05),transparent)] blur-lg" />
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-brand-mantis/50 via-white/15 to-transparent" />
      <div className="absolute bottom-7 left-7 hidden items-center gap-3 text-[9px] font-semibold uppercase tracking-[0.38em] text-white/35 md:flex">
        <span className="h-px w-10 bg-brand-mantis/60" />
        After dark / authorized access
      </div>
    </div>
  );
}
