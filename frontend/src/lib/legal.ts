/**
 * Informations légales de l'entreprise, reprises par les pages Mentions légales, CGV,
 * Confidentialité et Cookies. Une valeur null s'affiche « à compléter » sur le site :
 * tout remplir avant la mise en ligne.
 */
export const LEGAL = {
  companyName: "KamalPharMédis",
  legalForm: "SUARL au capital de 250 000 FCFA" as string | null,
  ninea: "0128572672Y2" as string | null,
  rccm: "SN.DKR.2026.B.7669" as string | null,
  address: "Ouest-Foire, Cité DIOR WARÉ N°14, Dakar, Sénégal",
  email: "kamalpharmedis@gmail.com",
  phones: ["+221 75 661 62 62", "+221 70 464 12 81"],
  host: null as string | null, // hébergeur du site : nom, adresse, site web (après le choix du serveur)
  updatedAt: "19 octobre 2026",
};

/** Livraison et commandes : mêmes valeurs que le serveur (Order::SHIPPING_FEE / FREE_SHIPPING_THRESHOLD). */
export const SHIPPING = {
  fee: "2 000 FCFA",
  freeFrom: "50 000 FCFA",
};
