interface GeneralSettings {
  businessName: string;
  address: string;
  email: string;
  instagram: string;
  hours: string;
}

async function getGeneralSettings(): Promise<GeneralSettings> {
  // We use an absolute URL here, pointing to our running dev server.
  // In production, this would be your public site URL.
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/content/general`, {
    // This tells Next.js to always fetch the latest data from the API route.
    cache: "no-store",
  });
  const data = await res.json();
  return data.json;
}

export default async function MenuPage() {
  const settings = await getGeneralSettings();
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">{settings.businessName} - Menu</h1>
      <p>Classic scoops, sundaes, and rotating flavors. Ask in-shop for today’s specials!</p>
    </div>
  );
}
