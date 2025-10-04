"use client";

import { useEffect, useState } from "react";

type GeneralSettings = {
  businessName: string;
  address: string;
  email: string;
  instagram: string;
  hours: string;
};

export default function ManagePage() {
  const [data, setData] = useState<GeneralSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/content/general", { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => {
        setData(res.json);
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
        body: JSON.stringify({ json: data, message: "Update general settings" }),
      });
      if (!res.ok) throw new Error(await res.text());
      setMsg("✅ Saved to GitHub");
    } catch (e: any) {
      console.error(e);
      setMsg("❌ Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main style={{ padding: 24 }}>Loading…</main>;
  if (!data) return <main style={{ padding: 24 }}>No data.</main>;

  return (
    <main style={{ padding: 24, maxWidth: 640, margin: "0 auto" }}>
      <h1>Manage Site Settings</h1>

      {(["businessName","address","email","instagram","hours"] as (keyof GeneralSettings)[]).map((k) => (
        <div key={k} style={{ margin: "12px 0" }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
            {k}
          </label>
          <input
            value={data[k] || ""}
            onChange={(e) => update(k, e.target.value)}
            style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
          />
        </div>
      ))}

      <button
        onClick={save}
        disabled={saving}
        style={{ marginTop: 16, padding: "10px 16px", fontWeight: 700, borderRadius: 8 }}
      >
        {saving ? "Saving…" : "Save changes"}
      </button>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </main>
  );
}
