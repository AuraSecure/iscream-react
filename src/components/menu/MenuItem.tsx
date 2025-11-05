interface MenuItemProps {
  name: string;
  description?: string;
  price?: number;
}

export function MenuItem({ name, description, price }: MenuItemProps) {
  return (
    <div className="py-2">
      <div className="flex justify-between items-baseline gap-2">
        <h4 className="font-semibold text-lg text-dark-magenta">{name}</h4>
        <div className="flex-grow border-b-2 border-dotted border-dark-magenta/30"></div>
        {typeof price === "number" && (
          <span className="font-semibold font-mono text-dark-magenta">${price.toFixed(2)}</span>
        )}
      </div>
      {description && <p className="text-sm text-dark-magenta/80 italic mt-1">{description}</p>}
    </div>
  );
}
