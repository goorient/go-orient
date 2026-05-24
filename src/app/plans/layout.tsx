import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tour Plans",
  description: "Browse curated China tour itineraries created by verified local guides. From the Great Wall to Guilin's karst peaks — find your perfect trip.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
