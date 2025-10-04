import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: SITE.name,
  description: "Whimsical, toy-packed ice cream shop in Albuquerque.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-zinc-900">
        <Header />
        <main className="mx-auto max-w-5xl px-4 pb-16">{children}</main>
        <footer className="mt-12 border-t">
          <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-zinc-600">
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
