import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "China Visa Guide",
  description: "Everything you need to know about entering China. Learn about the 240-hour transit visa exemption, L visa tourist application, and premium visa services.",
  openGraph: {
    title: "China Visa Guide — Go Orient",
    description: "Everything you need to know about entering China. Visa exemption, L visa, and premium services.",
    url: "https://go-orient.com/visa",
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
