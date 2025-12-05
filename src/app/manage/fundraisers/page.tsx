"use client";

import { useContentManager } from "@/hooks/useContentManager";
import Link from "next/link";
import type { Fundraiser } from "@/lib/content";

export default function ManageFundraisersPage() {
  const { data: fundraisers, loading, setData } = useContentManager<Fundraiser[]>({
    apiPath: "/api/content/fundraisers?full=true",
  });

  const handleDelete = async (slug: string, sha: string) => {
    if (confirm("Are you sure you want to delete this fundraiser?")) {
      const response = await fetch(`/api/content/fundraisers/${slug}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sha }),
      });

      if (response.ok) {
        setData(fundraisers?.filter((f) => f.slug !== slug) || []);
      } else {
        alert("Failed to delete fundraiser.");
      }
    }
  };

  if (loading) return <main style={{ padding: 24 }}>Loading fundraisers...</main>;

  return (
    <section className="bg-gray-100 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Manage Fundraisers</h2>
        <Link href="/manage/fundraisers/new" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
          New Fundraiser
        </Link>
      </div>
      <div className="space-y-4">
        {fundraisers?.map((fundraiser) => (
          <div key={fundraiser.slug} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <h3 className="text-lg font-medium">{fundraiser.title}</h3>
            <div className="flex gap-4">
              <Link href={`/manage/fundraisers/${fundraiser.slug}`} className="text-blue-600 hover:underline">
                Edit
              </Link>
              <button onClick={() => handleDelete(fundraiser.slug, fundraiser.sha)} className="text-red-600 hover:underline">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
