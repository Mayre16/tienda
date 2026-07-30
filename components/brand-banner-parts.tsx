function EditorialIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden>
      <path
        fill="currentColor"
        d="M16 16h22v32H16V16zm26 0h6c1.1 0 2 .9 2 2v28c0 1.1-.9 2-2 2h-6c-1.1 0-2-.9-2-2V18c0-1.1.9-2 2-2zm-24 4v24h14V20H18zm26 4v20h2V24h-2zm-8 8H24v-4h12v4zm0 8H24v-4h12v4z"
      />
      <circle cx="48" cy="20" r="3" fill="#ffca00" />
    </svg>
  );
}

const NA_LOGO = {
  src: "/brand/logo-nueva-acropolis-stacked-white.png",
  alt: "Nueva Acrópolis",
};

export { EditorialIcon, NA_LOGO };
