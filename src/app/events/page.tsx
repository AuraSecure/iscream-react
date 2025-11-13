import { getEvents, Event } from "@/lib/content";
import EventsList from "./EventsList";

export default async function EventsPage() {
  // Fetch events directly on the server
  const events = await getEvents();
  console.log("Events received in EventsPage:", events);

  const sorted = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <main className="min-h-screen bg-[#111] text-white p-6 md:p-12">
      <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8 text-[#ff3b7f] drop-shadow-md">
        Upcoming Events
      </h1>
      <EventsList events={sorted} />
    </main>
  );
}
