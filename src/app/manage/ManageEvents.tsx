"use client";

import { useEffect, useState } from "react";
import type { Event } from "@/lib/content";

export default function ManageEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content/events");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (Array.isArray(data)) {
        setEvents(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setMsg(`❌ Failed to load events: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => {
        setMsg(null);
      }, 5000); // Clear message after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [msg]);

  const handleSave = async () => {
    if (!editingEvent) return;
    setSaving(true);
    setMsg(null);

    const isNew = !editingEvent.slug;
    const url = isNew ? "/api/content/events" : `/api/content/events/${editingEvent.slug}`;
    const method = isNew ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingEvent),
      });

      if (!res.ok) throw new Error(await res.text());

      setMsg("✅ Event saved!");
      setEditingEvent(null);
      await fetchEvents(); // Refresh list

      // "Publish" the changes
      await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/events" }),
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setMsg(`❌ Save failed: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch(`/api/content/events/${slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());

      setMsg("✅ Event deleted!");
      await fetchEvents(); // Refresh list

      // "Publish" the deletion
      await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/events" }),
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setMsg(`❌ Delete failed: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading events...</p>;

  if (editingEvent) {
    return (
      <section className="bg-gray-100 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">
          {editingEvent.slug ? "Edit Event" : "New Event"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            placeholder="Title"
            value={editingEvent.title || ""}
            onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
            className="p-2 border rounded-md"
          />
          <input
            type="date"
            value={editingEvent.date ? editingEvent.date.split("T")[0] : ""}
            onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
            className="p-2 border rounded-md"
          />
          <input
            placeholder="Time (e.g., 7:00 PM)"
            value={editingEvent.time || ""}
            onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
            className="p-2 border rounded-md"
          />
          <input
            placeholder="Location"
            value={editingEvent.location || ""}
            onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
            className="p-2 border rounded-md"
          />
          <textarea
            placeholder="Description"
            value={editingEvent.description || ""}
            onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
            className="p-2 border rounded-md md:col-span-2"
            rows={3}
          />
        </div>
        <div className="mt-4 flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? "Saving..." : "Save Event"}
          </button>
          <button
            onClick={() => setEditingEvent(null)}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
        {msg && <p className="mt-4 text-sm">{msg}</p>}
      </section>
    );
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Events</h2>
        <button
          onClick={() => setEditingEvent({ title: "", date: "" })}
          className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700"
        >
          Add New Event
        </button>
      </div>
      <div className="space-y-2">
        {events.map((event) => (
          <div
            key={event.slug}
            className="flex justify-between items-center p-3 bg-white rounded-lg shadow"
          >
            <div>
              <p className="font-bold">{event.title}</p>
              <p className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingEvent(event)}
                className="text-sm text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(event.slug)}
                disabled={saving}
                className="text-sm text-red-600 hover:underline disabled:text-gray-400"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </section>
  );
}
