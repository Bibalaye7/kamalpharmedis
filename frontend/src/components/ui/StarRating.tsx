export default function StarRating({ value = 5 }: { value?: number }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-400" aria-label={`${value} sur 5 étoiles`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          fill={i < value ? "currentColor" : "#E5E7EB"}
          className="h-4 w-4"
        >
          <path d="M10 1.5l2.6 5.6 6 .7-4.4 4.1 1.2 6-5.4-3-5.4 3 1.2-6L1.4 7.8l6-.7L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}
