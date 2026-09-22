"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { AuthResponse, useAuth } from "@/context/AuthContext";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { applySession } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      setStatus("error");
      setMessage("Lien de confirmation incomplet.");
      return;
    }

    api
      .post<AuthResponse>("/auth/verify-email", { token, email }, { auth: false })
      .then((data) => {
        applySession(data);
        setStatus("success");
        setTimeout(() => router.push("/compte"), 2000);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof ApiError ? err.message : "Une erreur est survenue.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, email]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-blue-frost px-4 py-16">
      <div className="w-full max-w-md rounded-[24px] bg-white p-8 text-center shadow-2xl">
        {status === "loading" && (
          <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-mist text-3xl">⏳</span>
            <h1 className="mt-5 text-xl font-bold text-blue-deep">Confirmation en cours...</h1>
            <p className="mt-3 text-sm text-gray-600">Merci de patienter quelques instants.</p>
          </>
        )}
        {status === "success" && (
          <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-pale text-3xl">✅</span>
            <h1 className="mt-5 text-xl font-bold text-blue-deep">Adresse email confirmée !</h1>
            <p className="mt-3 text-sm text-gray-600">Redirection vers votre espace client...</p>
          </>
        )}
        {status === "error" && (
          <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFE5E5] text-3xl">✕</span>
            <h1 className="mt-5 text-xl font-bold text-blue-deep">Confirmation impossible</h1>
            <p className="mt-3 text-sm text-gray-600">{message}</p>
            <Link href="/connexion" className="mt-6 inline-block text-sm font-semibold text-blue-main">← Retour à la connexion</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
