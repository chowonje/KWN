import Link from 'next/link'

export default function Header() {
  return (
    <header className="mb-10 flex items-center justify-between">
      <Link href="/" className="text-xl font-semibold">
        KWN
      </Link>
      
    </header>
  )
}
