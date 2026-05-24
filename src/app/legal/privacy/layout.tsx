import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Go Orient Privacy Policy — how we collect, use, and protect your personal information. Learn about your data rights and our security practices.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
