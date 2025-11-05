import Link from "next/link";

const menuManagementSections = [
  {
    name: "Coffee Menu",
    href: "/manage/coffee",
    description: "Edit coffee, espresso, and other drinks.",
  },
  {
    name: "Ice Cream Flavors",
    href: "/manage/flavors",
    description: "Manage all ice cream flavor categories and items.",
  },
  {
    name: "Ice Cream Toppings",
    href: "/manage/toppings",
    description: "Manage all topping categories and items.",
  },
  {
    name: "Ice Cream Creations",
    href: "/manage/creations",
    description: "Sundaes, splits, shakes, and other creations.",
  },
  {
    name: "Drinks and Floats",
    href: "/manage/drinks",
    description: "Manage sodas, floats, and other beverages.",
  },
  {
    name: "Food (Hot Dogs, Chips,etc.)",
    href: "/manage/food",
    description: "Manage hot dogs, savory treats, and other food items.",
  },
];

export default function ManageMenuPage() {
  return (
    <main className="p-6 md:p-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Manage Menu</h1>
      <ul className="space-y-4">
        {menuManagementSections.map((section) => (
          <li key={section.name}>
            <Link
              href={section.href}
              className="block rounded-lg border bg-white p-4 shadow-sm transition hover:bg-gray-100"
            >
              <h2 className="font-semibold text-gray-900">{section.name}</h2>
              <p className="text-sm text-gray-600">{section.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
