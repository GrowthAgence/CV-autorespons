import Link from "next/link"
import Image from "next/image"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <Link href="/dashboard" className="inline-block hover:opacity-80 transition-opacity">
          <Image src="/images/jobbot-logo.png" alt="JobBot" width={120} height={40} className="h-8 w-auto" priority />
        </Link>
      </div>
    </header>
  )
}
