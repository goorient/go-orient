import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Go Orient account to book tours, connect with local guides, and explore authentic China.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
