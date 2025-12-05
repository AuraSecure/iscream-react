"use client";
import { useState, useMemo, useEffect } from "react";
import type { Event } from "@/lib/content";
import Image from "next/image";

type AnimatedEvent = Event & { animationClass: string; key: string; positionClass?: string };

const isPast = (eventDate: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(eventDate) < today;
};

const findInitialIndex = (events: Event[]) => {
  const firstUpcomingIndex = events.findIndex(event => !isPast(event.date));
  if (firstUpcomingIndex === -1) return Math.max(0, events.length - 3);
  return firstUpcomingIndex;
};

export default function EventsList({ events }: { events: Event[] }) {
  const [viewStartIndex, setViewStartIndex] = useState(() => findInitialIndex(events));
  const [transitioningItems, setTransitioningItems] = useState<{ exiting: AnimatedEvent[], entering: AnimatedEvent[] }>({ exiting: [], entering: [] });
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedEventSlug, setSelectedEventSlug] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [transformOriginClass, setTransformOriginClass] = useState('');
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right' | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const eventsToShow = useMemo(() => {
    return events.slice(viewStartIndex, viewStartIndex + 3);
  }, [viewStartIndex, events]);

  useEffect(() => {
    // Set initialLoad to false after the first render.
    setInitialLoad(false);
  }, []);

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTransitionDirection(null);
        setTransitioningItems({ exiting: [], entering: [] });
        if (transitionDirection === 'left') {
          setViewStartIndex(v => v + 1);
        } else if (transitionDirection === 'right') {
          setViewStartIndex(v => v - 1);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAnimating, transitionDirection]);

  const handlePrev = () => {
    if (viewStartIndex > 0 && !isAnimating) {
      setTransitionDirection('right');
      const exitingEvent = events[viewStartIndex + 2];
      const enteringEvent = events[viewStartIndex - 1];
      setTransitioningItems({
        exiting: exitingEvent ? [{ ...exitingEvent, key: exitingEvent.slug + '_exiting', animationClass: 'animate-slide-out-right-and-rotate', positionClass: 'left-[66.66%]' }] : [],
        entering: [{ ...enteringEvent, key: enteringEvent.slug + '_entering', animationClass: 'animate-slide-in-from-left-and-rotate', positionClass: 'left-[-33.33%]' }],
      });
      setIsAnimating(true);
    }
  };

  const handleNext = () => {
    if (viewStartIndex < events.length - 3 && !isAnimating) {
      setTransitionDirection('left');
      const exitingEvent = events[viewStartIndex];
      const enteringEvent = events[viewStartIndex + 3];
      setTransitioningItems({
        exiting: [{ ...exitingEvent, key: exitingEvent.slug + '_exiting', animationClass: 'animate-slide-out-left-and-rotate', positionClass: 'left-0' }],
        entering: [{ ...enteringEvent, key: enteringEvent.slug + '_entering', animationClass: 'animate-slide-in-from-right-and-rotate', positionClass: 'left-[100%]' }],
      });
      setIsAnimating(true);
    }
  };

  const handleSelect = (slug: string, index?: number) => {
    if (isAnimating) return;
    if (selectedEventSlug === slug) {
      setIsClosing(true);
      setTimeout(() => {
        setSelectedEventSlug(null);
        setIsClosing(false);
      }, 300); // Animation duration
    } else {
      if (index === 0) {
        setTransformOriginClass('transform-origin-top-left');
      } else if (index === 1) {
        setTransformOriginClass('transform-origin-top-center');
      } else {
        setTransformOriginClass('transform-origin-top-right');
      }
      setSelectedEventSlug(slug);
    }
  };

  const getOnScreenAnimation = (index: number) => {
    if (initialLoad) return 'animate-fade-in';
    if (isAnimating) {
      if (transitionDirection === 'left') return 'animate-slide-left-only';
      if (transitionDirection === 'right') return 'animate-slide-right-only';
    }
    return '';
  };

  const selectedEvent = useMemo(() => {
    if (!selectedEventSlug) return null;
    return events.find(e => e.slug === selectedEventSlug);
  }, [selectedEventSlug, events]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <button onClick={handlePrev} disabled={viewStartIndex === 0 || isAnimating || !!selectedEventSlug} className="px-4 py-2 rounded-full font-bold bg-charcoal-gray/10 hover:bg-charcoal-gray/20 transition disabled:opacity-50 disabled:cursor-not-allowed">&larr; Past</button>
        <button onClick={handleNext} disabled={viewStartIndex >= events.length - 3 || isAnimating || !!selectedEventSlug} className="px-4 py-2 rounded-full font-bold bg-charcoal-gray/10 hover:bg-charcoal-gray/20 transition disabled:opacity-50 disabled:cursor-not-allowed">Future &rarr;</button>
      </div>

      <div className="relative h-[44rem] overflow-hidden">
        {selectedEvent && (
          <div className="w-full h-full flex justify-center items-center" onClick={() => handleSelect(selectedEvent.slug)}>
            <div className={`relative max-w-2xl w-full h-full cursor-pointer ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'} ${transformOriginClass}`}>
              <Image
                src={selectedEvent.image}
                alt={selectedEvent.title}
                fill
                className="object-contain rounded-2xl"
              />
            </div>
          </div>
        )}
        {!selectedEvent && (
          <>
            {/* On-screen items */}
            <div className="grid grid-cols-3 gap-6 w-full">
              {eventsToShow.map((event, index) => {
                const isFaded = isPast(event.date);
                return (
                  <div key={event.slug} onClick={() => handleSelect(event.slug, index)} className={`rounded-2xl shadow-lg transition-all duration-500 ${isAnimating ? '' : 'cursor-pointer'} ${isFaded ? 'opacity-50' : ''} ${getOnScreenAnimation(index)}`}>
                    <div className="relative w-full" style={{ aspectRatio: "8.5 / 11" }}>
                      <Image src={event.image} alt={event.title} fill className="object-contain rounded-2xl" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Absolutely positioned transitioning items */}
            {[...transitioningItems.exiting, ...transitioningItems.entering].map(event => (
              <div key={event.key} className={`absolute top-0 w-1/3 p-[0.75rem] ${event.positionClass} ${event.animationClass}`}>
                <div className="relative w-full rounded-2xl shadow-lg" style={{ aspectRatio: "8.5 / 11" }}>
                  <Image src={event.image} alt={event.title} fill className="object-contain rounded-2xl" />
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
