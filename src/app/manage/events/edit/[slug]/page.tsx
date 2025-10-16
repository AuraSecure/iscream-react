// Example usage in a hypothetical Event Edit Page
"use client";

import { useState } from "react";
import { Event } from "@/lib/content";
import { EventRecurrenceForm } from "@/components/manage/EventRecurrenceForm";

export default function EditEventPage() {
  // Assume 'event' is loaded from your API
  const [event, setEvent] = useState<Event>({
    slug: "example-event",
    title: "Weekly Ice Cream Social",
    description: "Come hang out!",
    date: "2024-10-28",
    repeat: {
      frequency: "weekly",
      interval: 1,
      byday: ["FR"],
    },
  });

  const handleRecurrenceChange = (repeatRule: Event["repeat"] | undefined) => {
    setEvent((prevEvent) => ({
      ...prevEvent,
      repeat: repeatRule,
    }));
  };

  return (
    <form>
      {/* ... other form fields for title, description, date, etc. ... */}

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Event Schedule</h3>
        <EventRecurrenceForm value={event.repeat} onChange={handleRecurrenceChange} />
      </div>

      <div className="mt-4">
        <h4 className="font-mono text-sm">Current Event Data:</h4>
        <pre className="text-xs bg-gray-800 text-white p-4 rounded-md mt-2">
          {JSON.stringify(event, null, 2)}
        </pre>
      </div>
    </form>
  );
}
