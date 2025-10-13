"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function ManageLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isSubPage = pathname !== "/manage";

  return (
    <>
      <header className="sticky top-16 z-40 bg-gray-50/90 backdrop-blur-sm border-b">
        <div className="p-4 max-w-screen-xl mx-auto">
          {isSubPage && (
            <Link href="/manage" className="text-sm text-blue-600 hover:underline">
              &larr; Back to Content Management
            </Link>
          )}
        </div>
      </header>
      <main className="p-4 sm:p-6 lg:p-8">{children}</main>
    </>
  );
}
