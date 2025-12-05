import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { getGeneralSettings } from "@/lib/content";
import { Announcements } from "@/components";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getGeneralSettings();
  return {
    title: settings.businessName,
    description: `The official website for ${settings.businessName}`,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getGeneralSettings();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bangers&family=Nunito+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`font-body bg-hot-pink text-charcoal-gray`}>
        <nav className="sticky top-0 z-50 bg-hot-pink p-4 flex justify-between items-center shadow-lg h-16">
          <div>
            <Link
              href="/"
              className="font-heading text-2xl text-cream-white hover:text-electric-aqua transition-colors uppercase"
            >
              {settings.businessName}
            </Link>
          </div>
          <div className="flex gap-8 items-center">
            <Link
              href="/menu"
              className="text-cream-white hover:text-electric-aqua font-bold tracking-wider uppercase transition-colors"
            >
              Menu
            </Link>
            <Link
              href="/events"
              className="text-cream-white hover:text-electric-aqua font-bold tracking-wider uppercase transition-colors"
            >
              Events
            </Link>
            <Link
              href="/parties"
              className="text-cream-white hover:text-electric-aqua font-bold tracking-wider uppercase transition-colors"
            >
              Birthday Parties
            </Link>
            <Link
              href="/fundraisers"
              className="text-cream-white hover:text-electric-aqua font-bold tracking-wider uppercase transition-colors"
            >
              Fundraising
            </Link>
            <Link
              href="/contact"
              className="text-cream-white hover:text-electric-aqua font-bold tracking-wider uppercase transition-colors"
            >
              Contact
            </Link>
            <Link href="/">
              <Image
                src="/logo.png"
                alt="I Scream Ice Cream Logo"
                width={40}
                height={40}
              />
            </Link>
          </div>
        </nav>
        <Announcements />
        <div>{children}</div>
      </body>
    </html>
  );
}
