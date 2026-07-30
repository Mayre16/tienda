/** País bajo el identificador en header blanco. */
export function EditorialCountryBadge() {
  return (
    <span
      className="mt-1 inline-flex items-center gap-1.5 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-na-muted"
      aria-label="República Dominicana"
    >
      <svg className="h-3 w-[18px] shrink-0 rounded-sm shadow-[0_0_0_1px_rgba(8,99,87,0.12)]" viewBox="0 0 24 18" aria-hidden>
        <rect width="24" height="18" fill="#002D62" />
        <rect width="12" height="9" fill="#002D62" />
        <rect x="12" width="12" height="9" fill="#CE1126" />
        <rect y="9" width="12" height="9" fill="#CE1126" />
        <rect x="12" y="9" width="12" height="9" fill="#002D62" />
        <rect x="10" width="4" height="18" fill="#fff" />
        <rect y="7" width="24" height="4" fill="#fff" />
        <circle cx="12" cy="9" r="2.5" fill="#fff" />
        <circle cx="12" cy="9" r="1.5" fill="#002D62" />
      </svg>
      República Dominicana
    </span>
  );
}
