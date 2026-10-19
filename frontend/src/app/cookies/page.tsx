import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Cookies" };

const STORAGE = [
  { name: "kpm_token", purpose: "Garde votre session ouverte quand vous êtes connecté à votre compte.", duration: "Jusqu'à la déconnexion" },
  { name: "kpm_notif_prefs", purpose: "Mémorise vos préférences de notification choisies dans « Mon profil ».", duration: "Jusqu'à leur modification" },
  { name: "kpm_pages_visitees", purpose: "Fait fonctionner le bouton « Retour » pendant votre visite.", duration: "Fermeture de l'onglet" },
];

export default function CookiesPage() {
  return (
    <LegalPage title="Cookies" current="/cookies">
      <h2>Ce que le site enregistre</h2>
      <p>
        KamalPharMédis n&apos;utilise <strong>aucun cookie publicitaire, aucun outil de mesure d&apos;audience et aucun
        traceur de réseaux sociaux</strong>. Le site enregistre seulement, dans votre navigateur, quelques informations
        strictement nécessaires à son fonctionnement :
      </p>

      <div className="mb-4 overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="bg-blue-mist text-blue-deep">
              <th className="px-3 py-2 font-semibold">Nom</th>
              <th className="px-3 py-2 font-semibold">Utilité</th>
              <th className="px-3 py-2 font-semibold">Durée</th>
            </tr>
          </thead>
          <tbody>
            {STORAGE.map((s) => (
              <tr key={s.name} className="border-b border-gray-100">
                <td className="px-3 py-2 font-mono text-xs">{s.name}</td>
                <td className="px-3 py-2">{s.purpose}</td>
                <td className="px-3 py-2 text-gray-500">{s.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Votre accord</h2>
      <p>
        Ces informations étant indispensables au service que vous demandez (connexion, navigation), elles ne
        nécessitent pas de consentement préalable. Aucune n&apos;est transmise à des tiers.
      </p>

      <h2>Les supprimer</h2>
      <p>
        Vous pouvez les effacer à tout moment depuis les paramètres de votre navigateur (« Effacer les données de
        navigation »). Vous serez alors simplement déconnecté de votre compte.
      </p>

      <h2>Liens externes</h2>
      <p>
        Les boutons WhatsApp et Facebook ouvrent ces services dans une nouvelle page : leurs propres règles de
        confidentialité s&apos;appliquent alors.
      </p>
    </LegalPage>
  );
}
