"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface ImageUploaderProps {
  onUpload: (path: string) => void;
  initialImage?: string;
  title?: string;
}

export function ImageUploader({ onUpload, initialImage, title }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImageUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setMsg(null);
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
        if (!res.ok) throw new Error(await res.text());
        const { path } = await res.json();
        onUpload(path);
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      console.error(message);
      setMsg(`❌ Image upload failed: ${message}`);
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

  return (
    <div className="p-4 border rounded-md bg-white">
      <h2 className="text-xl font-semibold mb-4">{title || "Image"}</h2>
      {initialImage && initialImage.startsWith('/') && (
        <div className="relative w-full max-w-sm mx-auto mb-4" style={{ aspectRatio: "1 / 1" }}>
          <Image src={initialImage} alt={title || "Image"} fill className="object-contain rounded-md" />
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
            <p className="relative rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500">
              <span>Upload a file</span>
            </p>
            <p className="pl-1">or drag and drop</p>
            <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileSelect} />
          </div>
          <p className="text-xs leading-5 text-gray-600">PNG, JPG up to 10MB</p>
        </div>
      </div>
      {isUploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
      {msg && <p className="text-sm text-red-500 mt-2">{msg}</p>}
    </div>
  );
}
