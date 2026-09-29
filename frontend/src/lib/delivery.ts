/**
 * Délais de livraison indicatifs par ville, affichés sur la fiche produit, le panier
 * et la commande. Purement informatif : ne change ni les frais ni la logistique réelle.
 */
const DELAYS: Record<string, string> = {
  dakar: "24 à 48h",
  pikine: "24 à 48h",
  guediawaye: "24 à 48h",
  rufisque: "24 à 48h",
  thies: "2 à 3 jours ouvrés",
  mbour: "2 à 3 jours ouvrés",
  "saint-louis": "3 à 5 jours ouvrés",
  "saint louis": "3 à 5 jours ouvrés",
  kaolack: "3 à 5 jours ouvrés",
  ziguinchor: "4 à 6 jours ouvrés",
  touba: "3 à 5 jours ouvrés",
};

const DEFAULT_DELAY = "3 à 5 jours ouvrés";

function normalize(city: string): string {
  return city
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, ""); // retire les accents (Thiès → thies)
}

/** Délai indicatif pour une ville donnée (ou le délai par défaut hors liste). */
export function deliveryDelayFor(city: string | null | undefined): string {
  if (!city) return DEFAULT_DELAY;
  return DELAYS[normalize(city)] ?? DEFAULT_DELAY;
}

/** true si la ville est livrée en moins de 72h (mise en avant visuelle). */
export function isExpressDelivery(city: string | null | undefined): boolean {
  return !!city && DELAYS[normalize(city)] === "24 à 48h";
}
