export interface GeneralSettings {
  businessName: string;
  address: string;
  email: string;
  instagram: string;
  hours: string;
}

export interface Event {
  slug: string;
  title: string;
  date: string;
  time: string;
  description: string;
}

export async function getGeneralSettings(): Promise<GeneralSettings> {
  // We use an absolute URL here, pointing to our running dev server.
  // In production, this would be your public site URL.
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/content/general`, {
    // This tells Next.js to always fetch the latest data from the API route.
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch general settings");
  const data = await res.json();
  return data.json;
}

export async function getEvents(): Promise<Event[]> {
  // In production, this would be your public site URL.
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/content/events`, {});
  if (!res.ok) {
    return [];
  }
  const data = await res.json();
  return data.json;
}
