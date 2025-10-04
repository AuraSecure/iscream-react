import Link from "next/link";
import { SITE } from "@/lib/site";

export default function Header() {
  return (
    <header className="mx-auto max-w-5xl px-4 py-6 flex items-center gap-4">
      <Link href="/" className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/next.sv" alt="I Scream Ice Cream logo" className="h-10 w-10" />
        <span className="text-2xl font-bold">{SITE.name}</span>
      </Link>
      <nav className="ml-auto flex gap-4 text-sm">
        <Link href="/events" className="hover:underline">
          Events
        </Link>
        <Link href="/menu" className="hover:underline">
          Menu
        </Link>
        <Link href="/parties" className="hover:underline">
          Parties
        </Link>
        <Link href="/about" className="hover:underline">
          About
        </Link>
        <Link href="/contact" className="hover:underline">
          Contact
        </Link>
      </nav>
    </header>
  );
}
