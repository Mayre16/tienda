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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(window.parent!==window){document.documentElement.classList.add("cms-edit-embedded")}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${notoSans.variable} flex min-h-screen flex-col bg-white font-sans antialiased text-na-ink`}
      >
        <Suspense fallback={null}>
          <SiteAnalytics site="editorial" />
          <CmsEditModeBootstrap />
        </Suspense>
        <CmsProvider>
          <Suspense fallback={null}>
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
          </Suspense>
        </CmsProvider>
      </body>
    </html>
  );
}
