"use client";

import { useState } from "react";
import RequireAuth from "@/components/auth/RequireAuth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <RequireAuth roles={["admin", "manager"]}>
      <div className="flex min-h-screen bg-blue-frost">
        {/* Sidebar : fixe en desktop, tiroir off-canvas en mobile */}
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <div className="absolute inset-y-0 left-0">
              <AdminSidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}
