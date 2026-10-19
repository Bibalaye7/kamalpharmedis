import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { ToComplete } from "@/components/legal/LegalPage";
import { LEGAL, SHIPPING } from "@/lib/legal";

export const metadata: Metadata = { title: "Conditions générales de vente" };

export default function CgvPage() {
  return (
    <LegalPage title="Conditions générales de vente" current="/conditions-generales-de-vente">
      <h2>1. Objet</h2>
      <p>
        Les présentes conditions générales de vente (CGV) s&apos;appliquent à toutes les commandes passées sur le site
        KamalPharMédis par un particulier ou un professionnel auprès de {LEGAL.companyName}{" ("}
        <ToComplete value={LEGAL.legalForm} label="forme juridique" />, NINEA <ToComplete value={LEGAL.ninea} label="NINEA" />,
        siège : {LEGAL.address}). Passer une commande vaut acceptation de ces CGV.
      </p>

      <h2>2. Produits</h2>
      <p>
        Le site propose du matériel et des consommables médicaux. Les photos et descriptions sont aussi fidèles que
        possible ; de légères différences (couleur, emballage, marque d&apos;un modèle équivalent) peuvent exister selon
        les arrivages.
      </p>
      <p>
        Certains produits (aiguilles de rachianesthésie, fils de suture, cathéters, etc.) sont destinés aux
        professionnels de santé et doivent être utilisés par du personnel qualifié, conformément à la notice du
        fabricant. Les informations du site ne remplacent pas un avis médical.
      </p>

      <h2>3. Prix</h2>
      <p>
        Les prix sont indiqués en francs CFA (FCFA), hors frais de livraison. Le prix appliqué est celui affiché au
        moment de la validation de la commande. {LEGAL.companyName} peut modifier ses prix à tout moment, sans effet
        sur les commandes déjà validées.
      </p>

      <h2>4. Commande</h2>
      <ul>
        <li>La commande nécessite un compte client et une adresse de livraison au Sénégal.</li>
        <li>Après validation, une référence de commande est attribuée et la commande apparaît dans « Mes commandes ».</li>
        <li>
          {LEGAL.companyName} peut refuser ou annuler une commande en cas de rupture de stock, d&apos;erreur manifeste de
          prix ou de paiement non reçu ; le client est alors prévenu et, s&apos;il a payé, intégralement remboursé.
        </li>
        <li>Les établissements et professionnels peuvent demander un devis pour les grandes quantités via la page « Devis pro ».</li>
      </ul>

      <h2>5. Paiement</h2>
      <ul>
        <li><strong>Paiement à la livraison</strong> : en espèces, à la remise du colis.</li>
        <li>
          <strong>Wave ou Orange Money</strong> : le client envoie le montant au numéro indiqué lors de la commande, puis
          déclare la référence de son transfert dans son espace. La commande est préparée après vérification du paiement.
        </li>
      </ul>
      <p>Aucune donnée de carte bancaire n&apos;est enregistrée par le site.</p>

      <h2>6. Livraison</h2>
      <ul>
        <li>
          Livraison partout au Sénégal. Frais : {SHIPPING.fee} par commande, <strong>livraison offerte dès{" "}
          {SHIPPING.freeFrom}</strong> d&apos;achat.
        </li>
        <li>
          Délais indicatifs après confirmation : 24 à 48 h à Dakar, Pikine, Guédiawaye et Rufisque ; 2 à 3 jours ouvrés à
          Thiès et Mbour ; 3 à 6 jours ouvrés pour les autres villes.
        </li>
        <li>
          À la réception, vérifiez l&apos;état du colis. Tout colis abîmé ou incomplet doit être signalé au livreur et à
          notre service client dans les 48 heures.
        </li>
      </ul>

      <h2>7. Annulation</h2>
      <p>
        Le client peut annuler sa commande depuis son espace tant qu&apos;elle est « en attente » ou « confirmée ». Une
        fois expédiée, elle ne peut plus être annulée ; les règles de retour ci-dessous s&apos;appliquent. Un paiement déjà
        reçu pour une commande annulée est remboursé.
      </p>

      <h2>8. Retours et remboursements</h2>
      <ul>
        <li>
          <strong>Produit non conforme, défectueux ou endommagé</strong> : à signaler dans les 48 heures suivant la
          réception, photos à l&apos;appui. Le produit est échangé ou remboursé.
        </li>
        <li>
          <strong>Produit intact, non ouvert</strong> : retour possible dans les 7 jours suivant la réception, dans son
          emballage d&apos;origine ; les frais de retour sont à la charge du client.
        </li>
        <li>
          Pour des raisons d&apos;hygiène et de sécurité, les produits stériles, à usage unique ou d&apos;hygiène dont
          l&apos;emballage a été ouvert ne sont ni repris ni échangés.
        </li>
        <li>Le remboursement est effectué par le moyen de paiement utilisé (ou Wave / Orange Money) sous 14 jours.</li>
      </ul>

      <h2>9. Garantie</h2>
      <p>
        Les appareils (tensiomètres, thermomètres, lits, aspirateurs, etc.) bénéficient de la garantie de leur
        fabricant lorsqu&apos;elle existe. La garantie ne couvre pas une mauvaise utilisation, une chute ou un usage non
        conforme à la notice.
      </p>

      <h2>10. Responsabilité</h2>
      <p>
        {LEGAL.companyName} n&apos;est pas responsable des dommages résultant d&apos;une utilisation non conforme des
        produits ou d&apos;un retard de livraison dû à un cas de force majeure.
      </p>

      <h2>11. Données personnelles</h2>
      <p>
        Les données nécessaires au traitement des commandes sont traitées conformément à notre{" "}
        <Link href="/confidentialite">politique de confidentialité</Link>.
      </p>

      <h2>12. Droit applicable et litiges</h2>
      <p>
        Les présentes CGV sont soumises au droit sénégalais. En cas de différend, une solution amiable est recherchée en
        priorité en contactant <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>. À défaut, les tribunaux de Dakar sont
        compétents.
      </p>
    </LegalPage>
  );
}
