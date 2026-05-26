import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create Account",
  description: "Join Go Orient as a traveler or local guide. Create your account to discover authentic China or share your expertise with the world.",
  openGraph: {
    title: "Create Account — Go Orient",
    description: "Join Go Orient as a traveler or local guide and discover authentic China.",
    url: "https://go-orient.com/register",
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
