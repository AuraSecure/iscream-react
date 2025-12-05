"use client";

import { useState } from 'react';
import Image from 'next/image';

interface MenuItemProps {
  item: {
    name: string;
    description?: string;
    price: string;
    image?: string;
  };
}

export function MenuItem({ item }: MenuItemProps) {
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);

  // An item is expandable if it has a description or an image
  const isExpandable = (item.description && item.description.trim() !== "") || item.image;

  const formatPrice = (price: string) => {
    if (!price) {
      return null;
    }
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) {
      return null;
    }
    return numericPrice.toFixed(2);
  };

  const formattedPrice = formatPrice(item.price);

  return (
    <div
      className="bg-cream-white/50 rounded-lg p-4 shadow-inner flex flex-col transition-all duration-200 transform hover:scale-[1.03] hover:shadow-lg"
      onClick={() => isExpandable && setIsDescriptionVisible(!isDescriptionVisible)}
      role={isExpandable ? "button" : "article"}
      tabIndex={isExpandable ? 0 : -1}
      onKeyDown={(e) => {
        if (isExpandable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          setIsDescriptionVisible(!isDescriptionVisible);
        }
      }}
    >
      <div className="flex justify-between items-baseline">
        <h4 className="text-lg font-bold text-charcoal-gray">{item.name}</h4>
      </div>

      {/* Animated description container */}
      <div
        className={`transition-all duration-300 ease-in-out grid ${
          isDescriptionVisible && isExpandable ? 'grid-rows-[1fr] mt-2' : 'grid-rows-[0fr] mt-0'
        }`}
      >
        <div className="overflow-hidden">
          {item.image && (
            <div className="relative w-full aspect-video rounded-md overflow-hidden mb-2">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          {item.description && (
            <p className="text-sm text-charcoal-gray/80 font-normal pt-2 border-t border-hot-pink/20">
              {item.description}
            </p>
          )}
        </div>
      </div>
      {formattedPrice && (
        <div className="text-center mt-2">
          <span className="text-lg font-bold text-retro-orange">
            ${formattedPrice}
          </span>
        </div>
      )}
    </div>
  );
}
