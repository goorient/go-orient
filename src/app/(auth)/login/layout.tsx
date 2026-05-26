import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Go Orient account to book tours, connect with local guides, and explore authentic China.",
  openGraph: {
    title: "Sign In — Go Orient",
    description: "Sign in to book tours and connect with local guides in China.",
    url: "https://go-orient.com/login",
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
