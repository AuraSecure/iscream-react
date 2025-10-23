"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface AnnouncementStub {
  slug: string;
  title?: string;
  path: string;
  sha: string;
}

export default function ManageAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementStub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/content/announcements", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setAnnouncements(Array.isArray(data) ? data : []);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (slug: string, sha: string) => {
    if (!window.confirm(`Are you sure you want to delete the announcement "${slug}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/content/announcements/${slug}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sha }),
      });

      if (!res.ok) throw new Error(await res.text());

      // Force a full page reload to ensure the list is in sync with the server
      window.location.reload();
    } catch (e) {
      alert(`Failed to delete announcement: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  return (
    <section className="bg-gray-100 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Announcements</h1>
        <Link
          href="/manage/announcements/new"
          className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
        >
          + Add New Announcement
        </Link>
      </div>

      {loading && <p>Loading announcements...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <ul className="space-y-4">
          {announcements.map((announcement) => (
            <li
              key={announcement.slug}
              className="flex justify-between items-center p-4 bg-white rounded-lg border"
            >
              <span className="font-semibold">{announcement.title || announcement.slug}</span>
              <div className="flex gap-4">
                <Link
                  href={`/manage/announcements/${announcement.slug}`}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(announcement.slug, announcement.sha)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
