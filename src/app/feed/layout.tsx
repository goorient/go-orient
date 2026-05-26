import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Travel Feed",
  description: "Discover authentic China through photos, stories, and travel tips shared by local guides. Explore Beijing, Shanghai, Guilin, Chengdu, and more.",
  openGraph: {
    title: "Travel Feed — Go Orient",
    description: "Discover authentic China through photos, stories, and travel tips shared by local guides.",
    url: "https://go-orient.com/feed",
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
