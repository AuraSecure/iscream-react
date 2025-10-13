"use client";

import { useEffect, useState } from "react";
import { useContentManager } from "@/hooks/useContentManager";
import { useParams, useRouter } from "next/navigation";

interface Recurrence {
  frequency?: "WEEKLY" | "MONTHLY" | "YEARLY";
  interval?: number;
  byday?: string[];
}

interface EventData {
  title: string;
  startDate: string;
  description: string;
  image?: string;
  recurrence?: Recurrence;
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const isNew = slug === "new";

  // Disable the hook from running on "new" pages since there's nothing to fetch.
  const {
    data,
    setData,
    loading,
    saving: isSavingExisting,
    setSaving,
    msg,
    setMsg,
    save: saveExisting,
  } = useContentManager<EventData>({
    apiPath: `/api/content/events/${slug}`,
    disabled: isNew,
  });

  useEffect(() => {
    if (isNew && !data) {
      setData({
        title: "",
        startDate: new Date().toISOString().split("T")[0],
        description: "",
        image: "",
      });
    }
  }, [isNew, data, setData]);

  // For a new event, we manually control the saving state.
  const saving = isSavingExisting;

  const handleInputChange = (field: keyof EventData, value: string | Recurrence | undefined) => {
    if (!data) return;
    setData({ ...data, [field]: value });
  };

  const handleRecurrenceChange = (
    field: keyof Recurrence,
    value: string | number | string[] | undefined
  ) => {
    if (!data) return;
    const newRecurrence = { ...(data.recurrence || {}), [field]: value };
    if (!value) {
      delete newRecurrence[field];
    }
    setData({ ...data, recurrence: newRecurrence });
  };

  const handleSave = async () => {
    if (!data) return;

    if (!data.title.trim()) {
      setMsg("❌ Event Title cannot be empty.");
      return;
    }

    if (isNew) {
      setSaving(true);
      setMsg(null);
      try {
        const res = await fetch("/api/content/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error(await res.text());

        setMsg("✅ Saved successfully!");
        router.push("/manage/events");
        router.refresh(); // Refresh the page to show the new event
      } catch (e) {
        console.error(e);
        setMsg(`❌ Save failed: ${e instanceof Error ? e.message : String(e)}`);
      } finally {
        setSaving(false);
      }
    } else {
      await saveExisting();
    }
  };

  if (loading && !isNew) return <main style={{ padding: 24 }}>Loading event...</main>;
  if (!data) return <main style={{ padding: 24 }}>Could not load event data.</main>;

  return (
    <section className="bg-gray-100 p-6 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6">{isNew ? "Add New Event" : "Edit Event"}</h1>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="p-4 border rounded-md bg-white">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Event Title
              </label>
              <input
                type="text"
                id="title"
                value={data.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="mt-1 block w-full input"
              />
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={data.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                className="mt-1 block w-full input"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={data.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="mt-1 block w-full input"
              />
            </div>
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                Image Path
              </label>
              <input
                type="text"
                id="image"
                value={data.image || ""}
                onChange={(e) => handleInputChange("image", e.target.value)}
                className="mt-1 block w-full input"
                placeholder="/images/events/your-image.png"
              />
            </div>
          </div>
        </div>

        {/* Recurrence Rules */}
        <div className="p-4 border rounded-md bg-white">
          <h2 className="text-xl font-semibold mb-4">Recurrence (Optional)</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
                Frequency
              </label>
              <select
                id="frequency"
                value={data.recurrence?.frequency || ""}
                onChange={(e) => handleRecurrenceChange("frequency", e.target.value || undefined)}
                className="mt-1 block w-full input"
              >
                <option value="">One Time Event</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
            {data.recurrence?.frequency && (
              <div>
                <label htmlFor="interval" className="block text-sm font-medium text-gray-700">
                  Repeat every
                </label>
                <input
                  type="number"
                  id="interval"
                  min="1"
                  value={data.recurrence?.interval || 1}
                  onChange={(e) => handleRecurrenceChange("interval", parseInt(e.target.value, 10))}
                  className="mt-1 block w-full input"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.push("/manage/events")}
          className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {saving ? "Saving..." : "Save Event"}
        </button>
      </div>
      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </section>
  );
}
