import { getGeneralSettings } from "@/lib/content";

export default async function MenuPage() {
  const settings = await getGeneralSettings({ cache: "no-store" });
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">{settings.businessName} - Menu</h1>
      <p>Classic scoops, sundaes, and rotating flavors. Ask in-shop for today’s specials!</p>
    </div>
  );
}
