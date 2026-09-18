import "./globals.css";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { AuthModal } from "@/components/auth/auth-modal";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/seo/json-ld";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
  adjustFontFallback: true,
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-serif",
  display: "swap",
  adjustFontFallback: true,
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://bookfry.in"
  ),
  title: "BookFry — Buy & Sell Books",
  description:
    "India's book marketplace. Buy & sell new and pre-owned books with ease.",
  keywords: [
    "buy books india",
    "sell used books",
    "second hand books",
    "book marketplace india",
    "cheap textbooks",
    "BookFry",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: "https://bookfry.in" },
  openGraph: {
    title: "BookFry • India's Book Marketplace",
    description:
      "Empowering students with affordable education and circular book sharing.",
    type: "website",
    siteName: "BookFry",
    url: "https://bookfry.in",
  },
  twitter: {
    card: "summary_large_image",
    title: "BookFry • India's Book Marketplace",
    description:
      "Empowering students with affordable education and circular book sharing.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || !('theme' in localStorage)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body
        className="antialiased min-h-screen flex flex-col bg-background text-text-primary"
        suppressHydrationWarning
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand focus:text-white focus:rounded focus:outline-none"
        >
          Skip to main content
        </a>
        <Providers>
          <OrganizationJsonLd />
          <WebsiteJsonLd />
          <div id="main-content" className="flex-grow flex flex-col">
            {children}
          </div>
          <AuthModal />
        </Providers>
      </body>
    </html>
  );
}
