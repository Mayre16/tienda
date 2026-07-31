"use client";

import { cn } from "@/lib/utils/cn";

type CarouselDotButtonProps = {
  active: boolean;
  label: string;
  onClick: () => void;
  size?: "md" | "sm";
  colorClassName?: string;
};

/** Indicador de carrusel con animación composable (transform + opacity). */
export function CarouselDotButton({
  active,
  label,
  onClick,
  size = "md",
  colorClassName = "bg-na-editorial",
}: CarouselDotButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-current={active ? "true" : undefined}
      className={cn(
        "rounded-full origin-center transition-[transform,opacity] duration-300",
        colorClassName,
        size === "md" ? "h-2.5 w-2.5" : "h-2 w-2",
        active
          ? "scale-x-[3.2] opacity-100"
          : "scale-x-100 opacity-25 hover:opacity-45",
      )}
    />
  );
}
