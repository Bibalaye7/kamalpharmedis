"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { deliveryDelayFor, isExpressDelivery } from "@/lib/delivery";
import { Address } from "@/types";

/**
 * Affiche le délai de livraison estimé : celui de l'adresse par défaut du client
 * connecté, sinon un repère générique Dakar / régions pour un visiteur.
 */
export default function DeliveryEstimate({ className = "" }: { className?: string }) {
  const { user } = useAuth();
  const [city, setCity] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setCity(null);
      return;
    }
    api
      .get<{ data: Address[] }>("/addresses")
      .then((res) => {
        const def = res.data.find((a) => a.is_default) ?? res.data[0];
        setCity(def?.city ?? null);
      })
      .catch(() => setCity(null));
  }, [user]);

  if (!user) {
    return (
      <p className={`text-xs leading-relaxed text-gray-500 ${className}`}>
        🚚 Livraison <strong className="font-semibold text-gray-700">24 à 48h à Dakar</strong>, 3 à 5 jours dans les
        autres régions.
      </p>
    );
  }

  const express = isExpressDelivery(city);

  return (
    <p className={`text-xs leading-relaxed ${express ? "text-green-main" : "text-gray-500"} ${className}`}>
      🚚 Livraison estimée à <strong className="font-semibold">{city ?? "votre adresse"}</strong> :{" "}
      <strong className="font-semibold">{deliveryDelayFor(city)}</strong>
    </p>
  );
}
