"use client";

import { useState } from "react";
import type { Fundraiser } from "@/lib/content";
import Image from "next/image";

export default function FundraiserList({ fundraisers }: { fundraisers: Fundraiser[] }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  console.log("Fundraisers in list component:", fundraisers);

  const handleImageClick = (image: string) => {
    if (selectedImage === image) {
      setIsClosing(true);
      setTimeout(() => {
        setSelectedImage(null);
        setIsClosing(false);
      }, 300);
    } else {
      setSelectedImage(image);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {fundraisers.map((fundraiser) => (
        <div key={fundraiser.slug} className="bg-cream-white/90 rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-3xl font-heading text-hot-pink mb-4">{fundraiser.title}</h2>
          <p className="text-lg mb-4">{fundraiser.text}</p>
          <div className="flex justify-center gap-4">
            {fundraiser.images.slice(0, 3).map((image, index) => (
              <div
                key={index}
                className="relative w-full cursor-pointer"
                style={{ aspectRatio: "1 / 1", maxWidth: "200px" }}
                onClick={() => handleImageClick(image)}
              >
                <Image
                  src={image}
                  alt={`${fundraiser.title} image ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => handleImageClick(selectedImage)}
        >
          <div
            className={`relative w-full max-w-3xl h-full max-h-[80vh] ${
              isClosing ? "animate-zoom-out" : "animate-zoom-in"
            }`}
          >
            <Image
              src={selectedImage}
              alt="Selected image"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
