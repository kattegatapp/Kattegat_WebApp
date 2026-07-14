"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AdminAppSidebar } from "@/features/admin/shell/app-sidebar";
import { AdminFooter } from "@/features/admin/shell/footer";
import { AdminHeader } from "@/features/admin/shell/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { adminPath } from "@/lib/admin/paths";
import { cn } from "@/lib/utils";

/**
 * Admin panel chrome — SidebarProvider + AppSidebar + SidebarInset header.
 * Pattern: https://ui.shadcn.com/docs/components/sidebar
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isImmersiveChat =
    pathname.startsWith(adminPath("/agent-requests")) ||
    /\/users\/[^/]+\/chat\/?$/.test(pathname);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <a href="#admin-content" className="fixed left-3 top-3 z-[100] -translate-y-20 rounded-lg bg-brand-forest px-4 py-2 text-sm font-bold text-white shadow-lg transition-transform focus:translate-y-0">Skip to main content</a>
        <AdminAppSidebar />
        <SidebarInset className="admin-shell admin-shell-frame flex flex-col overflow-hidden bg-[#f4f7f5]">
          <AdminHeader />
          <main
            id="admin-content"
            tabIndex={-1}
            className={cn(
              "relative flex min-h-0 flex-1 flex-col outline-none",
              isImmersiveChat
                ? "overflow-hidden p-0"
                : "overflow-y-auto overflow-x-hidden px-3 py-3 sm:px-6 lg:px-8 lg:py-4",
            )}
          >
            {!isImmersiveChat ? (
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand-mantis/6 to-transparent" />
            ) : null}
            <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
          </main>
          {isImmersiveChat ? null : <AdminFooter />}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
