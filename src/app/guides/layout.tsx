import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Local Guides",
  description: "Connect with verified local guides across China. Browse guides by city, specialty, and language for an authentic travel experience.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
