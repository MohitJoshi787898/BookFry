import './globals.css';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import { AuthModal } from '@/components/auth/auth-modal';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'BookFry — Buy & Sell Books',
  description: "India's book marketplace. Buy & sell new and pre-owned books with ease.",
  openGraph: {
    title: 'BookFry • India\'s Book Marketplace',
    description: 'Empowering students with affordable education and circular book sharing.',
    type: 'website',
    siteName: 'BookFry',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BookFry • India\'s Book Marketplace',
    description: 'Empowering students with affordable education and circular book sharing.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-background text-text-primary" suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand focus:text-white focus:rounded focus:outline-none"
        >
          Skip to main content
        </a>
        <Providers>
          <div id="main-content" className="flex-grow flex flex-col">
            {children}
          </div>
          <AuthModal />
        </Providers>
      </body>
    </html>
  );
}
