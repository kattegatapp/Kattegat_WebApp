"use client";

import Image from "next/image";
import Link from "next/link";

import { AdminNavMain } from "@/features/admin/shell/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { adminPath } from "@/lib/admin/paths";

/**
 * App sidebar — brand + primary nav only.
 * Account (password / log out) lives in the header avatar menu.
 */
export function AdminAppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" className="border-r-0" {...props}>
      <SidebarHeader className="border-b border-white/10 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href={adminPath()} />}
              tooltip="Kattegat Admin"
            >
              <div className="flex aspect-square size-9 items-center justify-center overflow-hidden rounded-xl bg-white/10 shadow-[0_0_24px_rgb(111_219_66/0.12)] ring-1 ring-white/15">
                <Image
                  src="/brand/app-icon.png"
                  alt="Kattegat"
                  width={32}
                  height={32}
                  className="size-9"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold tracking-tight">Kattegat</span>
                <span className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Command center</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <AdminNavMain />
      </SidebarContent>

      <div className="group-data-[collapsible=icon]:hidden mx-3 mb-4 rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-white">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
          <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-mantis opacity-50" /><span className="relative inline-flex size-2 rounded-full bg-brand-mantis" /></span>
          Systems online
        </div>
        <p className="text-[11px] leading-4 text-white/45">Live operations and moderation workspace.</p>
      </div>

      <SidebarRail />
    </Sidebar>
  );
}
