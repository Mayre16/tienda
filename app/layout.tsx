import { Suspense } from "react";
import type { Metadata } from "next";
import { cmsFaviconUrl } from "@/lib/cms-favicon-url";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import { EditorialNavigationProvider } from "@/components/EditorialNavigationProvider";
import { EditorialSiteHeader } from "@/components/EditorialSiteHeader";
import { EditorialFooter } from "@/components/EditorialFooter";
import { EditorialCartProvider } from "@/components/cart/EditorialCartProvider";
import { CmsEditModeBootstrap } from "@/components/cms/CmsEditModeBootstrap";
import { CmsProvider } from "@/lib/cms/provider";
import { EditorialCmsEditProvider } from "@/components/cms/EditorialCmsEditContext";
import { EditorialPageMedia } from "@/components/cms/EditorialPageMedia";
import { SiteAnalytics } from "@/components/SiteAnalytics";
import { SITE_URL } from "@/lib/site-config";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Librería Editorial Logos — Nueva Acrópolis República Dominicana",
    template: "%s | Librería Editorial Logos",
  },
  description:
    "Librería Editorial Logos de Nueva Acrópolis RD: tienda de libros, papelería y publicaciones de la organización.",
  icons: { icon: [{ url: cmsFaviconUrl("editorial"), type: "image/webp" }] },
};

/** Portada LCP típica del carrusel de bienvenida (primer libro del seed). */
const HOME_LCP_IMAGE = "/uploads/bookstore_covers/ankor-ultimo-principe.webp";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link
          rel="preconnect"
          href="https://editor.acropolis.adesa.com.do"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://editor.acropolis.adesa.com.do" />
        <link
          rel="preload"
          as="image"
          href={HOME_LCP_IMAGE}
          fetchPriority="high"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(window.parent!==window){document.documentElement.classList.add("cms-edit-embedded")}}catch(e){}try{var api=${JSON.stringify(
              process.env.NEXT_PUBLIC_CMS_URL?.replace(/\/$/, "") || "",
            )};if(!api)return;var u=api+"/content/editorial/published";var slot=window.__editorialCmsPublished=window.__editorialCmsPublished||{};if(slot.promise)return;slot.promise=new Promise(function(resolve){function boot(){fetch(u,{cache:"no-store"}).then(function(r){return r.ok?r.json():null}).then(function(d){slot.doc=d;resolve(d)}).catch(function(){resolve(null)})}if(window.requestIdleCallback)requestIdleCallback(boot,{timeout:2500});else setTimeout(boot,1)})}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${notoSans.variable} flex min-h-screen flex-col bg-white font-sans antialiased text-na-ink`}
      >
        <Suspense fallback={null}>
          <SiteAnalytics site="editorial" />
        </Suspense>
        <Suspense fallback={null}>
          <CmsEditModeBootstrap />
        </Suspense>
        <CmsProvider>
          {/* Sin Suspense alrededor del contenido: evita CSR bailout y LCP alto en móvil. */}
          <EditorialCmsEditProvider>
            <EditorialCartProvider>
              <EditorialNavigationProvider>
                <EditorialSiteHeader />
                <main className="flex-1 bg-white">
                  {children}
                  <EditorialPageMedia />
                </main>
                <EditorialFooter />
              </EditorialNavigationProvider>
            </EditorialCartProvider>
          </EditorialCmsEditProvider>
        </CmsProvider>
      </body>
    </html>
  );
}
