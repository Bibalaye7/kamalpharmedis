import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { ToComplete } from "@/components/legal/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = { title: "Mentions légales" };

export default function MentionsLegalesPage() {
  return (
    <LegalPage title="Mentions légales" current="/mentions-legales">
      <h2>Éditeur du site</h2>
      <p>
        Le site KamalPharMédis est édité par <strong>{LEGAL.companyName}</strong>, <ToComplete value={LEGAL.legalForm} label="forme juridique" />.
      </p>
      <ul>
        <li>Siège : {LEGAL.address}</li>
        <li>NINEA : <ToComplete value={LEGAL.ninea} label="NINEA" /></li>
        <li>RCCM : <ToComplete value={LEGAL.rccm} label="numéro RCCM" /></li>
        <li>Email : <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a></li>
        <li>Téléphone : {LEGAL.phones.join(" / ")}</li>
      </ul>

      <h2>Hébergement</h2>
      <p>
        <ToComplete value={LEGAL.host} label="hébergeur (nom, adresse, site web)" />
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        La structure du site, ses textes, son logo et ses éléments graphiques sont la propriété de {LEGAL.companyName}.
        Toute reproduction, totale ou partielle, sans autorisation écrite est interdite.
      </p>
      <p>
        Les marques et noms de produits cités (fabricants, modèles) appartiennent à leurs propriétaires respectifs et
        ne sont mentionnés que pour identifier les produits vendus.
      </p>

      <h2>Informations médicales</h2>
      <p>
        Les descriptions des produits sont données à titre d&apos;information. Elles ne remplacent pas l&apos;avis
        d&apos;un médecin, d&apos;un pharmacien ou d&apos;un professionnel de santé. Respectez toujours la notice du
        fabricant.
      </p>

      <h2>Données personnelles et cookies</h2>
      <p>
        Le traitement de vos données est décrit dans notre <Link href="/confidentialite">politique de confidentialité</Link> et
        l&apos;usage des traceurs dans la page <Link href="/cookies">Cookies</Link>.
      </p>

      <h2>Contact</h2>
      <p>
        Pour toute question sur le site : <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> ou la page{" "}
        <Link href="/contact">Contact</Link>.
      </p>
    </LegalPage>
  );
}
