"use client";
import { formatDate } from "@/lib/date";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface EventStub {
  slug: string;
  path: string;
  sha: string;
  title: string;
  date: string;
  image: string; // Make sure the image property is expected
}

export default function ManageEventsPage() {
  const [events, setEvents] = useState<EventStub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/content/events?full=true", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          const eventList = data.events || (Array.isArray(data) ? data : []);
          setEvents(eventList);
        }
        setLoading(false);
      });
  }, []);

  const handleDelete = async (slug: string, sha: string) => {
    if (
      !window.confirm(`Are you sure you want to delete the event "${slug}"? This cannot be undone.`)
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/content/events/${slug}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sha }),
      });

      if (!res.ok) throw new Error(await res.text());

      setEvents(events.filter((event) => event.slug !== slug));
    } catch (e) {
      alert(`Failed to delete event: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  return (
    <section className="bg-gray-100 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Events</h1>
        <Link
          href="/manage/events/new"
          className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
        >
          + Add New Event
        </Link>
      </div>

      {loading && <p>Loading events...</p>}
      {error && <p className="text-red-500">Error loading events: {error}</p>}

      {!loading && !error && (
        <>
          {events.length === 0 && (
            <p className="text-gray-500">No events found. Click "Add New Event" to create one.</p>
          )}
          <ul className="space-y-4">
            {events.map((event) => (
              <li
                key={event.slug}
                className="flex justify-between items-center p-4 bg-white rounded-lg border"
              >
                <div className="flex items-center gap-4">
                  {event.image && (
                    <Image
                      src={event.image}
                      alt={event.title}
                      width={64}
                      height={64}
                      className="rounded-md object-cover h-16 w-16"
                    />
                  )}
                  <div className="flex flex-col">
                    <span className="font-semibold">{event.title}</span>
                    <span className="text-sm text-gray-500">{formatDate(event.date)}</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Link
                    href={`/manage/events/${event.slug}`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(event.slug, event.sha)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
