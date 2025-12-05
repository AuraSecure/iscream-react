"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Fundraiser } from "@/lib/content";
import { ImageUploader } from "@/components/manage/ImageUploader";

export default function NewFundraiserPage() {
  const router = useRouter();
  const [data, setData] = useState<Partial<Fundraiser>>({
    title: "",
    text: "",
    images: [],
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const update = (field: keyof Fundraiser, value: any) => {
    setData({ ...data, [field]: value });
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...(data.images || [])];
    newImages[index] = value;
    update("images", newImages);
  };

  const addImage = () => {
    if ((data.images || []).length < 3) {
      update("images", [...(data.images || []), ""]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = (data.images || []).filter((_, i) => i !== index);
    update("images", newImages);
  };

  const save = async () => {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/content/fundraisers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to create fundraiser");
      }
      await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paths: ["/fundraisers"] }),
      });
      router.push("/manage/fundraisers");
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-gray-100 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">New Fundraiser</h2>
      <div className="mb-4">
        <label className="block font-medium text-gray-700 capitalize mb-1">Title</label>
        <input
          value={data.title || ""}
          onChange={(e) => update("title", e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <div className="mb-4">
        <label className="block font-medium text-gray-700 capitalize mb-1">Text</label>
        <textarea
          value={data.text || ""}
          onChange={(e) => update("text", e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
          rows={5}
        />
      </div>
      <div className="space-y-4">
        {(data.images || []).map((image, index) => (
          <div key={index}>
            <ImageUploader
              title={`Image ${index + 1}`}
              initialImage={image}
              onUpload={(path) => handleImageChange(index, path)}
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="mt-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Remove Image {index + 1}
            </button>
          </div>
        ))}
      </div>
      {(data.images || []).length < 3 && (
        <button
          type="button"
          onClick={addImage}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Add Image
        </button>
      )}
      <div className="mt-8 flex justify-end gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {saving ? "Saving…" : "Save Fundraiser"}
        </button>
      </div>
      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </section>
  );
}
