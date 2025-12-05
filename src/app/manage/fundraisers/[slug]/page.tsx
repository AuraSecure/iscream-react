"use client";

import { useContentManager } from "@/hooks/useContentManager";
import { useRouter } from "next/navigation";
import type { Fundraiser } from "@/lib/content";
import { useState, useEffect } from "react";
import { ImageUploader } from "@/components/manage/ImageUploader";

export default function ManageFundraiserPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { data, setData, loading, saving, msg, hasChanges, save, handleDiscard } =
    useContentManager<Fundraiser>({
      apiPath: `/api/content/fundraisers/${params.slug}`,
      onSave: async () => {
        await fetch("/api/revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paths: ["/fundraisers"] }),
        });
        router.push("/manage/fundraisers");
      },
    });

  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (data?.images) {
      setImages(data.images);
    }
  }, [data]);

  const update = (field: keyof Fundraiser, value: any) => {
    if (!data) return;
    setData({ ...data, [field]: value });
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
    update("images", newImages);
  };

  const addImage = () => {
    if (images.length < 3) {
      setImages([...images, ""]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    update("images", newImages);
  };

  if (loading) return <main style={{ padding: 24 }}>Loading fundraiser...</main>;
  if (!data) return <main style={{ padding: 24 }}>Could not load fundraiser data.</main>;

  return (
    <section className="bg-gray-100 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">
        {params.slug === "new" ? "New Fundraiser" : `Edit Fundraiser: ${data.title}`}
      </h2>
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
        {images.map((image, index) => (
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
      {images.length < 3 && (
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
          {saving ? "Saving…" : "Save Fundraiser"}
        </button>
      </div>
      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </section>
  );
}
