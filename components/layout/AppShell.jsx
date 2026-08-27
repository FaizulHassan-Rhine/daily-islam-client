"use client";

import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { RightPanel } from "./RightPanel";
import { OfflineBanner } from "@/components/ui/OfflineBanner";

export function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 islamic-pattern" aria-hidden />
      <OfflineBanner />
      <div className="relative mx-auto flex min-h-screen max-w-[90rem]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="mx-auto w-full max-w-content flex-1 pb-nav-mobile lg:pb-8">{children}</main>
        </div>
        <RightPanel />
      </div>
      <BottomNav />
    </div>
  );
}
