import React from 'react';
import { MenuItem } from './MenuItem'; // Assuming MenuItem will be created

interface MenuItemData {
  name: string;
  description?: string;
  price: string;
  image?: string;
}

interface MenuCategory {
  name: string;
  items: MenuItemData[];
}

interface MenuSectionProps {
  category: MenuCategory;
}

export function MenuSection({ category }: MenuSectionProps) {
  return (
    <section className="mb-8">
      <h3 className="text-3xl font-bold text-hot-pink mb-4">{category.name}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {category.items.map((item) => (
          <MenuItem key={item.name} item={item} />
        ))}
      </div>
    </section>
  );
}
