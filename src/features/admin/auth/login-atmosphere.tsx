import Image from "next/image";

/** Quiet architectural backdrop for the secure staff entry point. */
export function AdminLoginAtmosphere() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <Image src="/admin/nightlife-login.png" alt="" fill priority sizes="100vw" className="scale-[1.03] object-cover object-[36%_center] opacity-70" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(3_8_5/0.28)_0%,rgb(3_7_5/0.48)_48%,rgb(3_7_5/0.92)_76%,rgb(3_7_5/0.98)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(3_6_5/0.42),transparent_35%,rgb(3_7_5/0.82))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_55%,transparent_0%,rgb(2_7_4/0.1)_35%,rgb(2_7_4/0.52)_78%)]" />
      <div className="admin-login-aurora absolute -left-48 top-1/4 h-[520px] w-[520px] rounded-full bg-brand-mantis/10 blur-[110px]" />
      <div className="absolute inset-y-0 right-0 w-[48%] border-l border-white/[0.04] bg-black/10 backdrop-blur-[2px]" />
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-brand-mantis/50 via-white/10 to-transparent" />
    </div>
  );
}
