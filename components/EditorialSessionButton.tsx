"use client";

import { User } from "lucide-react";

export function EditorialSessionButton({
  href,
  className = "",
  showLabel = false,
  onNavigate,
}: {
  href: string;
  className?: string;
  showLabel?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`editorial-site-header__icon-btn editorial-site-header__session-btn ${className}`.trim()}
      aria-label="Iniciar sesión"
      onClick={onNavigate}
    >
      <User className="h-5 w-5" aria-hidden />
      {showLabel ? <span className="text-sm font-bold">Iniciar sesión</span> : null}
    </a>
  );
}
