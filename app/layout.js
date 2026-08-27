import { Plus_Jakarta_Sans, Noto_Sans_Bengali, Noto_Naskh_Arabic, Amiri } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { AppShell } from "@/components/layout/AppShell";
import { RegisterSW } from "@/components/pwa/RegisterSW";
import "./globals.css";

const ui = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

const bangla = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bangla",
  display: "swap",
  adjustFontFallback: false,
});

const arabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

const quran = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-quran",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Daily Islam",
    template: "%s · Daily Islam",
  },
  description: "A peaceful mobile-first Islamic companion for prayer times, Quran, Hadith, and daily worship.",
  applicationName: "Daily Islam",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Daily Islam",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: "Daily Islam",
    description: "Prayer times, Quran, Hadith, Dua, and daily Islamic tools.",
    type: "website",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7FAF5" },
    { media: "(prefers-color-scheme: dark)", color: "#101713" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${ui.variable} ${bangla.variable} ${arabic.variable} ${quran.variable} font-sans antialiased`}>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-primary focus:px-3 focus:py-2 focus:text-white">
          Skip to content
        </a>
        <Providers>
          <AppShell>
            <div id="main">{children}</div>
          </AppShell>
          <RegisterSW />
        </Providers>
      </body>
    </html>
  );
}
