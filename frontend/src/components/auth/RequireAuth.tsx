"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/types";
import { PageSpinner } from "@/components/ui/Spinner";

/** Protège une page : redirige vers /connexion si non connecté, ou vers un rôle autorisé. */
export default function RequireAuth({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: Role[];
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      const loginPath = roles && !roles.includes("client") ? "/admin/connexion" : "/connexion";
      router.replace(`${loginPath}?redirect=${pathname}`);
      return;
    }

    if (roles && !roles.includes(user.role_name)) {
      router.replace(user.role_name === "client" ? "/compte" : "/admin");
    }
  }, [user, loading, roles, router, pathname]);

  if (loading || !user || (roles && !roles.includes(user.role_name))) {
    return <PageSpinner />;
  }

  return <>{children}</>;
}
