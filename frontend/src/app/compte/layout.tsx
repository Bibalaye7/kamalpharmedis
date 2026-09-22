"use client";

import RequireAuth from "@/components/auth/RequireAuth";
import AccountSidebar from "@/components/account/AccountSidebar";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth roles={["client"]}>
      <div className="container-page bg-blue-frost py-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <AccountSidebar />
          </div>
          <div className="lg:col-span-4">{children}</div>
        </div>
      </div>
    </RequireAuth>
  );
}
