import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/legal/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function ConfidentialitePage() {
  return (
    <LegalPage title="Politique de confidentialité" current="/confidentialite">
      <p>
        {LEGAL.companyName} protège les données personnelles de ses clients et visiteurs, conformément à la loi
        sénégalaise n° 2008-12 du 25 janvier 2008 sur la protection des données à caractère personnel. Cette page
        explique quelles données nous collectons, pourquoi, et quels sont vos droits.
      </p>

      <h2>1. Responsable du traitement</h2>
      <p>
        {LEGAL.companyName}, {LEGAL.address}. Contact : <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>.
      </p>

      <h2>2. Données collectées</h2>
      <ul>
        <li><strong>Compte client</strong> : nom, adresse email, téléphone, mot de passe (enregistré uniquement sous forme chiffrée).</li>
        <li><strong>Livraison</strong> : nom du destinataire, téléphone, adresse et ville.</li>
        <li><strong>Commandes</strong> : produits, montants, mode de paiement, historique et statut.</li>
        <li>
          <strong>Paiement</strong> : le mode de paiement choisi et, si vous payez par transfert Wave / Orange Money
          lorsque ce mode est proposé, la référence du transfert. Aucune donnée de carte bancaire n&apos;est enregistrée.
        </li>
        <li><strong>Avis clients</strong> : note et commentaire, publiés sous votre prénom suivi de l&apos;initiale de votre nom.</li>
        <li><strong>Demandes de devis et messages</strong> : établissement, nom du contact, email, téléphone et contenu de la demande.</li>
        <li><strong>Données techniques</strong> : adresse IP et navigateur, enregistrés dans les journaux du serveur pour la sécurité.</li>
      </ul>

      <h2>3. Utilisation des données</h2>
      <ul>
        <li>créer et gérer votre compte ;</li>
        <li>traiter, livrer et suivre vos commandes et leurs paiements ;</li>
        <li>répondre à vos demandes de devis et messages ;</li>
        <li>vous envoyer les emails liés à votre compte (confirmation d&apos;adresse, mot de passe oublié, commandes) ;</li>
        <li>protéger le site contre la fraude et les abus ;</li>
        <li>respecter nos obligations légales et comptables.</li>
      </ul>
      <p>Vos données ne sont jamais vendues ni louées, et ne sont pas utilisées pour de la publicité ciblée.</p>

      <h2>4. Destinataires</h2>
      <p>Seules les personnes qui en ont besoin accèdent à vos données :</p>
      <ul>
        <li>l&apos;équipe {LEGAL.companyName} chargée des commandes et du service client ;</li>
        <li>le livreur, pour le nom, le téléphone et l&apos;adresse de livraison ;</li>
        <li>nos prestataires techniques : hébergement du site et service d&apos;envoi d&apos;emails (Google Gmail) ;</li>
        <li>les autorités, uniquement sur demande légale.</li>
      </ul>

      <h2>5. Durée de conservation</h2>
      <ul>
        <li>Compte client : tant que le compte est actif, puis 3 ans après la dernière activité.</li>
        <li>Commandes et factures : 10 ans, durée de conservation des pièces comptables.</li>
        <li>Demandes de devis et messages : 3 ans après le dernier échange.</li>
        <li>Journaux techniques du serveur : 12 mois au maximum.</li>
      </ul>

      <h2>6. Sécurité</h2>
      <p>
        Les échanges avec le site sont chiffrés (HTTPS), les mots de passe sont chiffrés et l&apos;accès aux données est
        réservé aux comptes autorisés de l&apos;équipe.
      </p>

      <h2>7. Vos droits</h2>
      <p>
        Vous pouvez à tout moment demander l&apos;accès à vos données, leur rectification, leur suppression ou vous
        opposer à leur traitement, en écrivant à <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>. Vos nom, email,
        téléphone et adresses sont aussi modifiables directement dans « Mon compte ». Nous répondons dans un délai d&apos;un mois.
      </p>
      <p>
        Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir la Commission de Protection des
        Données Personnelles (CDP) du Sénégal.
      </p>

      <h2>8. Cookies</h2>
      <p>
        Le site n&apos;utilise ni cookie publicitaire ni outil de mesure d&apos;audience. Le détail figure dans la page{" "}
        <Link href="/cookies">Cookies</Link>.
      </p>
    </LegalPage>
  );
}
