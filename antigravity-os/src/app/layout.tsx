import type { Metadata, Viewport } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { PwaProvider } from "@/pwa/PwaProvider";

export const metadata: Metadata = {
  title: "Antigravity OS v7.0 — Sovereign AI Operating System",
  description:
    "Production-Grade Dark Futuristic Autonomous AI Operating System. Sovereign compute, Hermes Agent, ComfyUI, and Trust Fabric.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Antigravity OS",
  },
  icons: {
    icon: "/assets/icons/icon-192.png",
    apple: "/assets/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#D4AF37",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline theme script to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('ag_theme_preference') || 'dark';
                var resolved = t === 'system'
                  ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                  : t;
                document.documentElement.setAttribute('data-theme', resolved);
              } catch(e) {
                document.documentElement.setAttribute('data-theme', 'dark');
              }
            `,
          }}
        />
        {/* Inter font from Google — used as fallback for Satoshi/Geist */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <QueryProvider>
            <PwaProvider>
              {children}
            </PwaProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

