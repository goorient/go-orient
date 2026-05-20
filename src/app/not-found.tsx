import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="text-8xl mb-4">🗺️</div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Page Not Found</h1>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          Looks like this page has wandered off the map. Let&apos;s get you back on track.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
          <Link href="/plans">
            <Button variant="outline">Browse Plans</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
