const STAR = "M10 1.5l2.6 5.6 6 .7-4.4 4.1 1.2 6-5.4-3-5.4 3 1.2-6L1.4 7.8l6-.7L10 1.5z";

const SIZES = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-6 w-6" };

/** Étoiles en lecture seule ; accepte une note décimale (ex. 4,3 → 4 pleines + une partielle). */
export default function StarRating({ value = 0, size = "md" }: { value?: number; size?: keyof typeof SIZES }) {
  const rounded = Math.round(value * 10) / 10;

  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${rounded.toString().replace(".", ",")} sur 5 étoiles`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className={`relative inline-block ${SIZES[size]}`}>
            <svg viewBox="0 0 20 20" className="absolute inset-0 h-full w-full" fill="#E5E7EB" aria-hidden>
              <path d={STAR} />
            </svg>
            {fill > 0 && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <svg viewBox="0 0 20 20" className={`${SIZES[size]} text-amber-400`} fill="currentColor" aria-hidden>
                  <path d={STAR} />
                </svg>
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

/** Étoiles cliquables pour choisir une note de 1 à 5. */
export function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const labels = ["Très mauvais", "Mauvais", "Correct", "Bien", "Excellent"];

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Votre note">
      {Array.from({ length: 5 }).map((_, i) => {
        const n = i + 1;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} étoile${n > 1 ? "s" : ""} — ${labels[i]}`}
            onClick={() => onChange(n)}
            className="flex h-10 w-10 items-center justify-center rounded-lg transition hover:bg-amber-50"
          >
            <svg viewBox="0 0 20 20" className={`h-7 w-7 ${n <= value ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" aria-hidden>
              <path d={STAR} />
            </svg>
          </button>
        );
      })}
      {value > 0 && <span className="ml-2 text-sm font-medium text-gray-600">{labels[value - 1]}</span>}
    </div>
  );
}
