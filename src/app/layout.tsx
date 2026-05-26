import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { I18nProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  metadataBase: new URL("https://go-orient.com"),
  title: {
    default: "Go Orient — Discover China",
    template: "%s | Go Orient",
  },
  description: "Discover authentic China through local guides. Book tours, explore destinations, and experience China like never before.",
  keywords: ["China travel", "local guides", "tour plans", "Beijing", "Shanghai", "Great Wall", "visa China", "China tourism"],
  openGraph: {
    title: "Go Orient — Discover China",
    description: "Authentic experiences with verified local guides. From the Great Wall to hidden gems.",
    type: "website",
    locale: "en_US",
    siteName: "Go Orient",
  },
  twitter: {
    card: "summary_large_image",
    title: "Go Orient — Discover China",
    description: "Authentic experiences with verified local guides in China.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white font-sans">
        <I18nProvider><AuthProvider>{children}</AuthProvider></I18nProvider>
      </body>
    </html>
  );
}
