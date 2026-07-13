"use client";

import type { ReactNode } from "react";

import { AdminAppSidebar } from "@/features/admin/shell/app-sidebar";
import { AdminFooter } from "@/features/admin/shell/footer";
import { AdminHeader } from "@/features/admin/shell/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

/**
 * Admin panel chrome — SidebarProvider + AppSidebar + SidebarInset header.
 * Pattern: https://ui.shadcn.com/docs/components/sidebar
 */
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <a href="#admin-content" className="fixed left-3 top-3 z-[100] -translate-y-20 rounded-lg bg-brand-forest px-4 py-2 text-sm font-bold text-white shadow-lg transition-transform focus:translate-y-0">Skip to main content</a>
        <AdminAppSidebar />
        <SidebarInset className="admin-shell flex min-h-svh flex-col bg-[#f4f7f5]">
          <AdminHeader />
          <main id="admin-content" tabIndex={-1} className="relative flex flex-1 flex-col px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand-mantis/6 to-transparent" />
            <div className="relative flex flex-1 flex-col">{children}</div>
          </main>
          <AdminFooter />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
