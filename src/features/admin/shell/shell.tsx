"use client";

import { Suspense, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AdminGlassCanvas } from "@/features/admin/shared/glass";
import { AdminAppSidebar } from "@/features/admin/shell/app-sidebar";
import { AdminFooter } from "@/features/admin/shell/footer";
import { AdminHeader } from "@/features/admin/shell/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { adminPath } from "@/lib/admin/paths";
import { cn } from "@/lib/utils";

function AdminHeaderFallback() {
  return (
    <div
      className="admin-header-glass sticky top-0 z-30 h-14 shrink-0 border-b sm:h-[4.5rem]"
      aria-hidden
    />
  );
}

function AdminFooterFallback() {
  return (
    <footer className="admin-footer-glass shrink-0 border-t px-4 py-2.5 sm:px-8" aria-hidden>
      <div className="h-4" />
    </footer>
  );
}

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
        <a
          href="#admin-content"
          className="fixed left-3 top-3 z-[100] -translate-y-20 rounded-lg bg-brand-forest px-4 py-2 text-sm font-bold text-white shadow-lg transition-transform focus:translate-y-0"
        >
          Skip to main content
        </a>
        <AdminAppSidebar />
        <SidebarInset className="admin-shell admin-shell-frame flex flex-col overflow-hidden bg-[#eef3f0]">
          <Suspense fallback={<AdminHeaderFallback />}>
            <AdminHeader />
          </Suspense>
          <main
            id="admin-content"
            tabIndex={-1}
            className={cn(
              "relative flex min-h-0 flex-1 flex-col outline-none",
              isImmersiveChat
                ? "overflow-hidden p-0"
                : "overflow-y-auto overflow-x-hidden px-2.5 py-2.5 sm:px-4 sm:py-3 lg:px-5 lg:py-3.5",
            )}
          >
            {isImmersiveChat ? (
              <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
            ) : (
              <AdminGlassCanvas>
                {children}
              </AdminGlassCanvas>
            )}
          </main>
          {isImmersiveChat ? null : (
            <Suspense fallback={<AdminFooterFallback />}>
              <AdminFooter />
            </Suspense>
          )}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
