"use client";

// Numéro WhatsApp de l'entreprise, au format international sans "+" ni espaces (attendu par wa.me).
const WHATSAPP_NUMBER = "221704641281";
const DEFAULT_MESSAGE = "Bonjour KamalPharMédis, j'ai une question sur un produit.";

export default function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Nous contacter sur WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lifted transition hover:scale-105 sm:bottom-6 sm:right-6"
    >
      <span className="absolute inset-1 animate-ping rounded-full bg-[#25D366] opacity-40" />
      <svg viewBox="0 0 32 32" width="30" height="30" fill="currentColor" className="relative" aria-hidden="true">
        <path d="M16.004 3C9.376 3 4 8.373 4 15c0 2.29.638 4.43 1.744 6.256L4 29l7.938-1.703A11.93 11.93 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.75c-1.94 0-3.75-.523-5.31-1.434l-.38-.223-4.71 1.01 1.007-4.59-.248-.39A9.7 9.7 0 0 1 5.25 15c0-5.93 4.824-10.75 10.754-10.75S26.75 9.07 26.75 15 21.934 24.75 16.004 24.75Zm5.94-8.06c-.324-.163-1.918-.945-2.215-1.053-.297-.108-.513-.163-.73.163-.216.325-.838 1.053-1.028 1.27-.19.216-.378.243-.702.081-.324-.163-1.369-.505-2.607-1.61-.964-.86-1.615-1.922-1.805-2.246-.19-.325-.02-.5.143-.662.147-.146.324-.379.487-.568.162-.19.216-.325.324-.542.108-.216.054-.406-.027-.568-.081-.163-.73-1.76-1-2.41-.263-.634-.53-.548-.73-.558l-.622-.011c-.216 0-.568.081-.865.406-.297.325-1.135 1.108-1.135 2.703 0 1.596 1.162 3.137 1.324 3.354.162.216 2.288 3.494 5.544 4.9.775.334 1.379.534 1.85.684.777.247 1.484.212 2.043.129.623-.093 1.918-.784 2.19-1.541.27-.758.27-1.407.19-1.541-.081-.135-.297-.216-.622-.379Z" />
      </svg>
    </a>
  );
}
