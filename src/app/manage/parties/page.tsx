"use client";

import { useContentManager } from "@/hooks/useContentManager";
import { useRouter } from "next/navigation";
import type { PartyInfo } from "@/lib/content";

export default function ManagePartiesPage() {
  const router = useRouter();
  const { data, setData, loading, saving, msg, save, hasChanges, handleDiscard } =
    useContentManager<PartyInfo>({
      apiPath: "/api/content/parties",
      onSave: () => {
        router.push("/manage");
      },
    });

  if (loading) {
    return (
      <section className="bg-gray-100 p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6">Party Information</h1>
        <p>Loading...</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="bg-gray-100 p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6">Party Information</h1>
        <p className="text-red-500">Could not load party information. Please try again later.</p>
      </section>
    );
  }

  return (
    <section className="bg-gray-100 p-6 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6">Party Information</h1>

      <div className="p-4 border rounded-md bg-white">
        <h2 className="text-xl font-semibold mb-4">
          Edit the paragraph that appears on your website regarding party bookings.
        </h2>
        <textarea
          id="text"
          rows={10}
          value={data.text}
          onChange={(e) => setData({ text: e.target.value })}
          className="mt-1 block w-full input"
          placeholder="Enter information about booking parties..."
        />
      </div>

      <div className="mt-8 flex justify-end items-center gap-4">
        {msg && <p className="text-sm mr-auto">{msg}</p>}
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
    </section>
  );
}
