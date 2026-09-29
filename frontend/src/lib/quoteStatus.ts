import { QuoteStatus } from "@/types";

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  new: "Nouvelle",
  in_progress: "En cours d'étude",
  sent: "Devis envoyé",
  accepted: "Accepté",
  rejected: "Refusé",
};

export const QUOTE_STATUS_STYLES: Record<QuoteStatus, string> = {
  new: "bg-blue-mist text-blue-main",
  in_progress: "bg-amber-50 text-amber-700",
  sent: "bg-category-purple-bg text-category-purple-text",
  accepted: "bg-green-pale text-green-dark",
  rejected: "bg-[#FFE5E5] text-status-danger",
};

export const COMPANY_TYPES: { value: string; label: string }[] = [
  { value: "clinique", label: "Clinique" },
  { value: "pharmacie", label: "Pharmacie" },
  { value: "hopital", label: "Hôpital / centre de santé" },
  { value: "cabinet", label: "Cabinet médical" },
  { value: "laboratoire", label: "Laboratoire" },
  { value: "ong", label: "ONG / association" },
  { value: "autre", label: "Autre" },
];

export const companyTypeLabel = (value: string) => COMPANY_TYPES.find((t) => t.value === value)?.label ?? value;
