"use client";

import { useContentManager } from "@/hooks/useContentManager";
import { useParams, useRouter } from "next/navigation";
import type { Announcement } from "@/lib/content";

type AnnouncementData = Omit<Announcement, "slug">;

export default function EditAnnouncementPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const isNew = slug === "new";

  const { data, setData, loading, saving, setSaving, msg, setMsg, save } =
    useContentManager<AnnouncementData>({
      apiPath: `/api/content/announcements/${slug}`,
      disabled: isNew,
      onSave: () => {
        // After saving, redirect back to the announcements list
        router.push("/manage/announcements");
      },
      initialData: isNew
        ? {
            title: "",
            text: "",
            startDate: "",
            endDate: "",
          }
        : undefined,
    });

  const handleInputChange = (field: keyof AnnouncementData, value: string) => {
    if (!data) return;
    setData({ ...data, [field]: value });
  };

  const handleSave = async () => {
    if (!data) return;

    if (!data.title.trim()) {
      setMsg("❌ Announcement Title cannot be empty.");
      return;
    }

    if (!data.text.trim()) {
      setMsg("❌ Announcement text cannot be empty.");
      return;
    }

    if (isNew) {
      setSaving(true);
      setMsg(null);
      try {
        const res = await fetch("/api/content/announcements", {
          method: "POST", // This creates a new file
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error(await res.text());

        setMsg("✅ Saved successfully!");
        // After creating, redirect back to the announcements list
        router.push("/manage/announcements");
      } catch (e) {
        console.error(e);
        setMsg(`❌ Save failed: ${e instanceof Error ? e.message : String(e)}`);
      } finally {
        setSaving(false);
      }
    } else {
      // For existing items, the hook's save function handles the PUT request
      await save();
    }
  };

  if (loading && !isNew) return <main className="p-6">Loading announcement...</main>;
  if (!data) return <main className="p-6">Could not load announcement data.</main>;

  return (
    <section className="bg-gray-100 p-6 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6">
        {isNew ? "Add New Announcement" : "Edit Announcement"}
      </h1>
      {data && (
        <div className="space-y-6">
          <div className="p-4 border rounded-md bg-white">
            <h2 className="text-xl font-semibold mb-4">Announcement Details</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Announcement Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={data.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="mt-1 block w-full input"
                  placeholder="e.g., We'll be closed on July 4th"
                />
              </div>
              <div>
                <label htmlFor="text" className="block text-sm font-medium text-gray-700">
                  Announcement Text
                </label>
                <textarea
                  id="text"
                  rows={4}
                  value={data.text}
                  onChange={(e) => handleInputChange("text", e.target.value)}
                  className="mt-1 block w-full input"
                  placeholder="e.g., We'll be closed on the 4th of July."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={data.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    className="mt-1 block w-full input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-end gap-4">
        <button
          type="button"
          onClick={() => (window.location.href = "/manage/announcements")}
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
          {saving ? "Saving..." : "Save Announcement"}
        </button>
      </div>
      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </section>
  );
}
