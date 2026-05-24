import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Go Orient Terms of Service — our terms and conditions for using the platform, including booking policies, payments, content rules, and user responsibilities.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
