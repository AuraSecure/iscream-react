"use client";

import { useState, useMemo } from "react";
import type { Event } from "@/lib/content";

import Image from "next/image";

function EventCard({ event, faded = false }: { event: Event; faded?: boolean }) {
  return (
    <div
      className={`rounded-2xl shadow-lg transition-transform hover:-translate-y-1 overflow-hidden ${
        faded ? "bg-[#222]/60 text-gray-400" : "bg-[#1a1a1a] hover:bg-[#242424]"
      }`}
    >
      {event.image && (
        <div className="relative w-full" style={{ aspectRatio: "8.5 / 11" }}>
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-5">
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
    </div>
  );
}


function isPast(event: Event): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(event.date);
  const expirationDate = new Date(eventDate);
  expirationDate.setDate(expirationDate.getDate() + 1); // Expires 1 day after
  return expirationDate < today;
}

export default function EventsList({ events }: { events: Event[] }) {
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);

  const initialIndex = useMemo(() => {
    const firstUpcomingIndex = sortedEvents.findIndex((e) => !isPast(e));
    // If no upcoming events, show the last page of past events
    return firstUpcomingIndex === -1 ? Math.max(0, sortedEvents.length - 3) : firstUpcomingIndex;
  }, [sortedEvents]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Effect to reset index if initialIndex changes (e.g. on hot-reload or data change)
  // biome-ignore lint/correctness/useExhaustiveDependencies: We only want to run this when initialIndex changes
  useMemo(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 3));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(sortedEvents.length - 3, prev + 3));
  };

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex + 3 < sortedEvents.length;

  const eventsToShow = sortedEvents.slice(currentIndex, currentIndex + 3);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={handlePrev}
          disabled={!canGoPrev}
          className="px-4 py-2 rounded-full font-semibold bg-white/10 hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          &larr; Past
        </button>
        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className="px-4 py-2 rounded-full font-semibold bg-white/10 hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Future &rarr;
        </button>
      </div>

      {events.length === 0 ? (
        <p className="text-center text-gray-400 py-12">No events found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {eventsToShow.map((event) => (
            <EventCard key={event.slug} event={event} faded={isPast(event)} />
          ))}
        </div>
      )}
    </div>
  );
}
