// Appels API côté serveur (Server Components) : pas de token, données publiques uniquement.
// À l'intérieur du réseau Docker, "localhost" pointe vers le conteneur frontend lui-même,
// pas vers le backend : on utilise donc une URL interne dédiée (nom du service Docker).
const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function serverGet<T>(path: string, revalidate = 60): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    // API indisponible (ex. build sans backend) : on affiche des sections vides plutôt que de casser la page
    return null;
  }
}
