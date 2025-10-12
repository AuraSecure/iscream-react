"use client";

import { useEffect, useState } from "react";
import type { GeneralSettings } from "@/lib/content";

export default function ManageGeneralPage() {
  const [data, setData] = useState<GeneralSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/content/general", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setMsg(`Failed to load settings: ${data.error}`);
        } else {
          setData(data.json);
        }
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setMsg("Failed to load settings.");
        setLoading(false);
      });
  }, []);

  const update = (field: keyof GeneralSettings, value: string) => {
    if (!data) return;
    setData({ ...data, [field]: value });
  };

  const save = async () => {
    if (!data) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/content/general", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: data, message: "Update general.json via /manage" }),
      });
      if (!res.ok) throw new Error(await res.text());
      setMsg("✅ Saved to GitHub");

      // Revalidate the paths that use this data
      await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paths: ["/", "/contact", "/events", "/menu"] }),
      });
    } catch (e) {
      console.error(e);
      setMsg("❌ Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main style={{ padding: 24 }}>Loading…</main>;
  if (!data) return <main style={{ padding: 24 }}>No data.</main>;

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
      <button
        onClick={save}
        disabled={saving}
        className="mt-4 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {saving ? "Saving…" : "Save Settings"}
      </button>
      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </section>
  );
}
