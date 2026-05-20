import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";

export const metadata: Metadata = {
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
