import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

interface GeneralSettings {
  businessName: string;
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getGeneralSettings();
  return {
    title: settings.businessName,
    description: `The official website for ${settings.businessName}`,
  };
}

async function getGeneralSettings(): Promise<GeneralSettings> {
  // Use an absolute URL pointing to our running dev server.
  // The empty `{}` for the second argument tells Next.js to use its default caching,
  // which can be invalidated by the "Publish" button.
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/content/general`, {});
  const data = await res.json();
  return data.json;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getGeneralSettings();

  return (
    <html lang="en">
      <body className={`${inter.className} bg-hot-pink text-dark-magenta`}>
        <nav className="bg-deep-magenta p-4 flex justify-between items-center shadow-lg">
          <div>
            <Link
              href="/"
              className="font-bold text-xl text-white hover:text-brand-yellow transition-colors"
            >
              {settings.businessName}
            </Link>
          </div>
          <div className="flex gap-8">
            <Link
              href="/menu"
              className="text-white hover:text-brand-yellow font-bold tracking-wider uppercase transition-colors"
            >
              Menu
            </Link>
            <Link
              href="/events"
              className="text-white hover:text-brand-yellow font-bold tracking-wider uppercase transition-colors"
            >
              Events
            </Link>
            <Link
              href="/contact"
              className="text-white hover:text-brand-yellow font-bold tracking-wider uppercase transition-colors"
            >
              Contact
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
