"use client";
import { useState, useEffect } from "react";
import { useContentManager } from "@/hooks/useContentManager";
import { Event } from "@/lib/content";
import EventRecurrenceForm from "@/components/manage/EventRecurrenceForm";

export default function EditEventPage({
  params,
}: {
  params: { slug: string };
}) {
  const { data: event, error, save, setData } = useContentManager<Event>({
    apiPath: `/api/content/events/${params.slug}`,
  });
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (event) {
      setData({ ...event, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async () => {
    await save();
  };

  if (error) {
    return <div>Error loading event: {error}</div>;
  }

  if (!event) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Edit Event</h1>
      <form>
        <div>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={event.title}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={event.description}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={event.date}
            onChange={handleInputChange}
          />
        </div>
        <EventRecurrenceForm
          recurrence={event.repeat}
          onChange={(repeat) => {
            setData({ ...event, repeat });
          }}
        />
        <button type="button" onClick={handleSave}>
          Save
        </button>
      </form>
    </div>
  );
}