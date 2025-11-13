import React from 'react';

interface MenuItemProps {
  item: {
    name: string;
    description?: string;
    price: string;
  };
}

export function MenuItem({ item }: MenuItemProps) {
  return (
    <div className="flex justify-between items-baseline border-b border-gray-300 pb-2">
      <div>
        <h4 className="text-lg font-semibold text-dark-magenta">{item.name}</h4>
        {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
      </div>
      <span className="text-lg font-bold text-hot-pink">{item.price}</span>
    </div>
  );
}
