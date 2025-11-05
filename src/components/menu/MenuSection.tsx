import { MenuItem } from "./MenuItem";
import type { MenuCategory, MenuItem as MenuItemType } from "@/lib/content/menu";

interface MenuSectionProps<T extends MenuItemType> {
  category: MenuCategory<T>;
}

export function MenuSection<T extends MenuItemType>({ category }: MenuSectionProps<T>) {
  if (!category.items || category.items.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h3 className="text-2xl font-bold text-deep-magenta border-b-4 border-brand-yellow pb-2 mb-4">
        {category.name}
      </h3>
      {category.description && (
        <p className="text-center italic text-dark-magenta/90 mb-4">{category.description}</p>
      )}
      <div className="divide-y divide-dark-magenta/10">
        {category.items.map((item) => (
          <MenuItem key={item.name} {...item} />
        ))}
      </div>
    </div>
  );
}
