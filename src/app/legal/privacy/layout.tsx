import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Go Orient Privacy Policy — how we collect, use, and protect your personal information. Learn about your data rights and our security practices.",
  openGraph: {
    title: "Privacy Policy — Go Orient",
    description: "How we collect, use, and protect your personal information at Go Orient.",
    url: "https://go-orient.com/legal/privacy",
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
