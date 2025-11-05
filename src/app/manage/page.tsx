import Link from "next/link";

const managementSections = [
  {
    name: "General Settings",
    href: "/manage/general",
    description: "Business name, address, contact info.",
  },
  {
    name: "Events",
    href: "/manage/events",
    description: "Manage recurring and one-time events.",
  },
  {
    name: "Announcements",
    href: "/manage/announcements",
    description: "Site-wide banners and pop-ups.",
  },
  {
    name: "Manage Menu",
    href: "/manage/menu",
    description: "Edit all menu items, including flavors, toppings, and food.",
  },
  {
    name: "Party Information",
    href: "/manage/parties",
    description: "Edit the paragraph about party bookings.",
  },
];

export default function ManagePage() {
  return (
    <main className="p-6 md:p-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Manage Site</h1>
      <ul className="space-y-4">
        {managementSections.map((section) => (
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
