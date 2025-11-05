"use client";

import { useContentManager } from "@/hooks/useContentManager";
import type { Event } from "@/lib/content";
import { EventRecurrenceForm } from "@/components/manage/EventRecurrenceForm";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useRef } from "react";

interface EditEventPageProps {
  params: { slug: string };
}

export default function EditEventPage({ params }: EditEventPageProps) {
  const { slug } = params;
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: event, setData: setEvent, loading, saving, save, hasChanges, handleDiscard } = 
    useContentManager<Event>({
      apiPath: `/api/content/events/${slug}`,
      onSave: () => {
        // After saving, redirect to the main events management page
        router.push("/manage/events");
      },
    });

  if (loading) {
    return <div>Loading event data...</div>;
  }

  if (!event) {
    return <div>Event not found.</div>;
  }

  const [isDragging, setIsDragging] = useState(false);

  const processImageUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Content = (reader.result as string).split(",")[1];

        const res = await fetch("/api/content/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: file.name, content: base64Content }),
        });

        if (!res.ok) {
          throw new Error(await res.text());
        }

        const { path } = await res.json();

        if (event) {
          setEvent({ ...event, image: path });
        }
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      console.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    processImageUpload(e.target.files?.[0] as File);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processImageUpload(e.dataTransfer.files?.[0] as File);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleRecurrenceChange = (repeatRule: Event["repeat"] | undefined) => {
    setEvent((prevEvent) => prevEvent ? { ...prevEvent, repeat: repeatRule } : null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Edit Event: {event.title}</h1>
      
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="p-6 bg-white rounded-lg shadow">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            id="title"
            value={event.title}
            onChange={(e) => setEvent({ ...event, title: e.target.value })}
            className="mt-1 block w-full input"
          />
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            rows={5}
            value={event.description}
            onChange={(e) => setEvent({ ...event, description: e.target.value })}
            className="mt-1 block w-full input"
          />
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            id="date"
            value={event.date}
            onChange={(e) => setEvent({ ...event, date: e.target.value })}
            className="mt-1 block w-full input"
          />
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Event Image</h3>
          {event.image && (
            <div className="relative w-full max-w-sm mx-auto mb-4" style={{ aspectRatio: "8.5 / 11" }}>
              <Image src={event.image} alt={event.title} fill className="object-cover rounded-md" />
            </div>
          )}
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop} 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`mt-2 flex cursor-pointer justify-center rounded-lg border border-dashed px-6 py-10 ${
              isDragging ? 'border-blue-600 bg-blue-50' : 'border-gray-900/25 hover:border-blue-500'
            }`}>
            <div className="text-center">
              <div className="mt-4 flex text-sm leading-6 text-gray-600">
                <label
                  className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                >
                  <span>Upload a file</span>
                  <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileSelect} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs leading-5 text-gray-600">PNG, JPG up to 10MB</p>
            </div>
          </div>
          {isUploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Event Schedule</h3>
          <EventRecurrenceForm value={event.repeat} onChange={handleRecurrenceChange} />
        </div>
      </div>

      <div className="mt-8 flex justify-end items-center gap-4 max-w-2xl mx-auto">
        {hasChanges && (
          <button
            type="button"
            onClick={handleDiscard}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Discard Changes
          </button>
        )}
        <button
          type="button"
          onClick={save}
          disabled={saving || !hasChanges}
          className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
