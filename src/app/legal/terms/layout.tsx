import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Go Orient Terms of Service — our terms and conditions for using the platform, including booking policies, payments, content rules, and user responsibilities.",
  openGraph: {
    title: "Terms of Service — Go Orient",
    description: "Go Orient Terms of Service — terms, booking policies, and user responsibilities.",
    url: "https://go-orient.com/legal/terms",
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
