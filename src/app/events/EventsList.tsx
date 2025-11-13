"use client";
import { formatDate } from "@/lib/date";
import { useState, useMemo, useRef, useEffect } from "react";
import type { Event } from "@/lib/content";

import Image from "next/image";

function EventCard({ event, faded = false, className = "", onSelect }: { event: Event; faded?: boolean; className?: string; onSelect: (slug: string) => void }) {
  // TEMPORARY FIX: Validate image path to prevent crash from local file paths
  const isValidImageSrc = event.image && event.image.startsWith("/");

  return (
    <div
      onClick={() => onSelect(event.slug)}
      className={`rounded-2xl shadow-lg transition-transform hover:-translate-y-1 overflow-hidden ${
        faded ? "bg-gray-800 opacity-75 text-gray-400" : "bg-[#1a1a1a] hover:bg-[#242424]"
      } ${className}`}
    >
      {isValidImageSrc && (
        <div className="relative w-full" style={{ aspectRatio: "8.5 / 11" }}>
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-contain"
          />
        </div>
      )}
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
  const [animatedEvents, setAnimatedEvents] = useState<Event[]>([]);
  const prevEventsToShowRef = useRef<Event[]>([]);
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right' | null>(null);
  const [selectedEventSlug, setSelectedEventSlug] = useState<string | null>(null); // New state for selected event

  const eventsToShow = useMemo(() => {
    return sortedEvents.slice(currentIndex, currentIndex + 3);
  }, [sortedEvents, currentIndex]);

  useEffect(() => {
    const prevEvents = prevEventsToShowRef.current;
    const newEvents = eventsToShow;

    // Determine animation direction
    const newCurrentIndex = sortedEvents.indexOf(newEvents[0]);
    const oldCurrentIndex = sortedEvents.indexOf(prevEvents[0]);
    if (newCurrentIndex > oldCurrentIndex) {
      setAnimationDirection('left'); // Moving to newer events (left slide)
    } else if (newCurrentIndex < oldCurrentIndex) {
      setAnimationDirection('right'); // Moving to older events (right slide)
    } else {
      setAnimationDirection(null);
    }

    // Identify events that are currently displayed and should remain
    const commonEvents = newEvents.filter(newEvent =>
      prevEvents.some(prevEvent => prevEvent.slug === newEvent.slug)
    );

    // Identify events that are exiting
    const exitingEvents = prevEvents.filter(prevEvent =>
      !newEvents.some(newEvent => newEvent.slug === prevEvent.slug)
    ).map(event => ({ ...event, animationState: 'exiting' }));

    // Identify events that are entering
    const enteringEvents = newEvents.filter(newEvent =>
      !prevEvents.some(prevEvent => prevEvent.slug === newEvent.slug)
    ).map(event => ({ ...event, animationState: 'entering' }));

    // Combine all events: common, exiting, and entering
    // Exiting events are placed first to ensure they are rendered below entering events if z-index is not managed
    setAnimatedEvents([...exitingEvents, ...commonEvents, ...enteringEvents]);

    // Update ref for next render
    prevEventsToShowRef.current = newEvents;

    // Clean up exiting events after animation
    const timeout = setTimeout(() => {
      setAnimatedEvents((currentAnimated) =>
        currentAnimated.filter((event) => event.animationState !== 'exiting')
      );
      setAnimationDirection(null); // Reset direction after animation
    }, 5000); // Match CSS transition duration

    return () => clearTimeout(timeout);
  }, [eventsToShow, sortedEvents]);

  useEffect(() => {
    setAnimatedEvents(eventsToShow.map(event => ({ ...event, animationState: 'idle' })));
  }, [eventsToShow]);

  useMemo(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 3));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(sortedEvents.length - 3, prev + 3));
  };

  const handleSelect = (slug: string) => {
    setSelectedEventSlug(selectedEventSlug === slug ? null : slug);
  };

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex + 3 < sortedEvents.length;

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
      ) : selectedEventSlug ? (
        <div className="flex justify-center items-center h-full">
          {animatedEvents.filter(event => event.slug === selectedEventSlug).map((event) => (
            <EventCard
              key={`${event.slug}-${event.animationState}`}
              event={event}
              faded={isPast(event)}
              className={`w-full max-w-lg ${event.animationState === 'entering' ? 'animate-fade-in' : ''}
                         ${event.animationState === 'exiting' ? 'animate-fade-out' : ''}`}
              onSelect={handleSelect}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {animatedEvents.map((event) => (
            <EventCard
              key={`${event.slug}-${event.animationState}`}
              event={event}
              faded={isPast(event)}
              className={`${event.animationState === 'entering' ? 'animate-fade-in' : ''}
                         ${event.animationState === 'exiting' ? 'animate-fade-out' : ''}`}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
