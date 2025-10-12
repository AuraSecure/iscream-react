"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function ManageLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isSubPage = pathname !== "/manage";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {isSubPage && (
        <div className="mb-6">
          <Link href="/manage" className="text-sm text-blue-600 hover:underline">
            &larr; Back to Content Management
          </Link>
        </div>
      )}
      {children}
    </div>
  );
}
