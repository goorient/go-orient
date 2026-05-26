import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Local Guides",
  description: "Connect with verified local guides across China. Browse guides by city, specialty, and language for an authentic travel experience.",
  openGraph: {
    title: "Local Guides — Go Orient",
    description: "Connect with verified local guides across China for an authentic travel experience.",
    url: "https://go-orient.com/guides",
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
