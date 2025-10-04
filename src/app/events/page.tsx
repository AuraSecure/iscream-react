"use client";

import { useEffect, useState } from "react";

// a simple type to match your schema
type Event = {
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  time?: string;
  location?: string;
  repeat?: any;
  createdAt?: string;
  updatedAt?: string;
  slug: string;
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/content/events");
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error("Failed to load events", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <p className="text-center text-pink-400 mt-20">Loading events...</p>;

  const today = new Date();

  const sorted = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const upcoming = sorted.filter((e) => new Date(e.date) >= today);
  const past = sorted.filter((e) => new Date(e.date) < today);

  return (
    <main className="min-h-screen bg-[#111] text-white p-6 md:p-12">
      <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8 text-[#ff3b7f] drop-shadow-md">
        Upcoming Events
      </h1>

      {upcoming.length === 0 && (
        <p className="text-center text-gray-400">No upcoming events yet. Check back soon!</p>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {upcoming.map((event) => (
          <EventCard key={event.slug} event={event} />
        ))}
      </div>

      <div className="text-center mt-12">
        <button
          onClick={() => setShowPast(!showPast)}
          className="px-5 py-2 rounded-full bg-[#ff3b7f]/20 hover:bg-[#ff3b7f]/40 transition"
        >
          {showPast ? "Hide Past Events" : "Show Past Events"}
        </button>
      </div>

      {showPast && (
        <section className="max-w-6xl mx-auto mt-8">
          <h2 className="text-3xl font-bold text-[#9fffe0] mb-4">Past Events</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {past.map((event) => (
              <EventCard key={event.slug} event={event} faded />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function EventCard({ event, faded = false }: { event: Event; faded?: boolean }) {
  return (
    <div
      className={`rounded-2xl p-5 shadow-lg transition-transform hover:-translate-y-1 ${
        faded ? "bg-[#222]/60 text-gray-400" : "bg-[#1a1a1a] hover:bg-[#242424]"
      }`}
    >
      <h3 className="text-2xl font-bold text-[#ff3b7f] mb-2">{event.title}</h3>
      <p className="text-sm text-gray-400 mb-3">
        {new Date(event.date).toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
        {event.time && ` • ${event.time}`}
      </p>
      <p className="text-gray-200">{event.description}</p>
      {event.location && <p className="mt-3 text-xs text-[#9fffe0]">{event.location}</p>}
    </div>
  );
}
