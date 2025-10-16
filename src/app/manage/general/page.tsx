"use client";

import { useContentManager } from "@/hooks/useContentManager";
import type { GeneralSettings } from "@/lib/content";

export default function ManageGeneralPage() {
  const { data, setData, loading, saving, msg, hasChanges, save, handleDiscard } =
    useContentManager<GeneralSettings>({
      apiPath: "/api/content/general",
      onSave: async () => {
        // Revalidate the paths that use this data
        await fetch("/api/revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paths: ["/", "/contact", "/events", "/menu"] }),
        });
      },
    });

  const update = (field: keyof GeneralSettings, value: string) => {
    if (!data) return;
    setData({ ...data, [field]: value });
  };

  if (loading) return <main style={{ padding: 24 }}>Loading settings...</main>;
  if (!data) return <main style={{ padding: 24 }}>Could not load settings data.</main>;

  return (
    <section className="bg-gray-100 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">General Settings</h2>
      {(
        ["businessName", "address", "email", "instagram", "hours"] as (keyof GeneralSettings)[]
      ).map((k) => (
        <div key={k} className="mb-4">
          <label className="block font-medium text-gray-700 capitalize mb-1">{k}</label>
          <input
            value={data[k] || ""}
            onChange={(e) => update(k, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
      ))}
      <div className="mt-8 flex justify-end gap-4">
        <button
          type="button"
          onClick={handleDiscard}
          disabled={!hasChanges || saving}
          className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Discard Changes
        </button>
        <button
          onClick={save}
          disabled={!hasChanges || saving}
          className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </section>
  );
}
