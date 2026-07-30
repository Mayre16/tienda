"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import {
  EditorialBrandMark,
  EDITORIAL_HEADER_MARK_ASPECT,
} from "@/components/EditorialBrandMark";
import { EditorialCartButton } from "@/components/cart/EditorialCartButton";
import { EditorialSessionButton } from "@/components/EditorialSessionButton";
import { useEditorialHeaderNav } from "@/lib/cms/hooks";
import type { EditorialNavItem } from "@/lib/editorial-content";
import { navItemIsActive } from "@/lib/editorial-navigation";
import { setCartOpen } from "@/lib/cart-store";
import "./EditorialSiteHeader.css";

/** Header integrado: identificador Editorial + menú sobre franja naranja (patrón Civis). */
export function EditorialSiteHeader() {
  const pathname = usePathname();
  const headerNavAll = useEditorialHeaderNav();
  const sessionItem = headerNavAll.find((item) => item.id === "sesion");
  const headerNav = headerNavAll.filter(
    (item) => item.id !== "quienes-somos" && item.id !== "sesion",
  );
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const closeMobile = () => {
    setOpen(false);
    setCartOpen(false);
  };

  useEffect(() => {
    setOpen(false);
    setCartOpen(false);
  }, [pathname]);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const syncHeaderOffset = () => {
      document.documentElement.style.setProperty(
        "--editorial-header-offset",
        `${el.offsetHeight}px`,
      );
    };

    syncHeaderOffset();
    const observer = new ResizeObserver(syncHeaderOffset);
    observer.observe(el);
    return () => observer.disconnect();
  }, [open]);

  const desktopLinkClass = (active: boolean) =>
    `editorial-site-header__link${active ? " editorial-site-header__link--active" : ""}`;

  const mobileLinkClass = (active: boolean) =>
    `editorial-site-header__mobile-link${active ? " editorial-site-header__mobile-link--active" : ""}`;

  const renderLink = (
    item: EditorialNavItem,
    className: string,
    onNavigate?: () => void,
  ) => {
    const active = navItemIsActive(pathname, "", item);

    if (item.external) {
      return (
        <a
          key={item.id}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
          onClick={onNavigate}
        >
          {item.label}
          <span className="ml-1 text-[0.65em] opacity-60" aria-hidden>
            ↗
          </span>
        </a>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.href}
        className={className}
        aria-current={active ? "page" : undefined}
        onClick={() => {
          onNavigate?.();
          setCartOpen(false);
        }}
        prefetch={false}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <header
      ref={headerRef}
      className="editorial-site-header"
      style={{
        ["--editorial-mark-aspect" as string]: String(EDITORIAL_HEADER_MARK_ASPECT),
      }}
    >
      <div className="editorial-site-header__row">
        <Link
          href="/"
          onClick={closeMobile}
          className="editorial-site-header__brand"
          aria-label="Librería Editorial Logos — inicio"
          prefetch={false}
        >
          <EditorialBrandMark
            size="lg"
            priority
            className="editorial-site-header__mark"
          />
        </Link>

        <button
          type="button"
          className="editorial-site-header__menu-btn"
          aria-expanded={open}
          aria-controls="editorial-mobile-nav"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <nav
          className="editorial-site-header__nav"
          aria-label="Secciones de Librería Editorial Logos"
        >
          {headerNav.map((item) =>
            renderLink(item, desktopLinkClass(navItemIsActive(pathname, "", item))),
          )}
          <div className="editorial-site-header__nav-actions">
            <EditorialCartButton />
            {sessionItem ? (
              <EditorialSessionButton href={sessionItem.href} />
            ) : null}
          </div>
        </nav>
      </div>

      {open ? (
        <nav
          id="editorial-mobile-nav"
          className="editorial-site-header__mobile-nav"
          aria-label="Menú móvil de Editorial Logos"
        >
          <ul className="editorial-site-header__mobile-list">
            {headerNav.map((item) => (
              <li key={item.id}>
                {renderLink(
                  item,
                  mobileLinkClass(navItemIsActive(pathname, "", item)),
                  closeMobile,
                )}
              </li>
            ))}
          </ul>
          <div className="editorial-site-header__mobile-actions">
            <EditorialCartButton showLabel onNavigate={closeMobile} />
            {sessionItem ? (
              <EditorialSessionButton
                href={sessionItem.href}
                showLabel
                onNavigate={closeMobile}
              />
            ) : null}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
