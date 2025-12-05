import { useEffect, useState } from "react";
import { useContentManager } from "@/hooks/useContentManager";
import EventRecurrenceForm from "@/components/manage/EventRecurrenceForm";
import { ImageUploader } from "@/components/manage/ImageUploader";
import { useParams, useRouter } from "next/navigation";
import type { Event } from "@/lib/content";

// The data structure for a single event, matching our content model.
// Note: The `useContentManager` hook is generic, so we use `Event` here.
// The `date` property from the `Event` interface is used as `startDate`.
type EventData = Omit<Event, "slug">;

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
    onSave: () => {
      router.push("/manage/events");
    },
  });

  useEffect(() => {
    if (isNew && !data) {
      setData({
        title: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
        image: "",
      });
    }
  }, [isNew, data, setData]);

  // For a new event, we manually control the saving state.
  const saving = isSavingExisting;

  const handleInputChange = (
    field: keyof EventData,
    value: string | Event["repeat"] | undefined
  ) => {
    if (!data) return;
    setData({ ...data, [field]: value });
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
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={data.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
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
          </div>
        </div>

        {/* Image Uploader */}
        <ImageUploader
          title="Event Image"
          initialImage={data.image}
          onUpload={(path) => handleInputChange("image", path)}
        />

        {/* Recurrence Rules */}
        <div className="p-4 border rounded-md bg-white">
          <h2 className="text-xl font-semibold mb-4">Event Schedule</h2>
          <EventRecurrenceForm
            recurrence={data.repeat}
            onChange={(repeatRule) => handleInputChange("repeat", repeatRule)}
            startDate={data.date}
          />
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
