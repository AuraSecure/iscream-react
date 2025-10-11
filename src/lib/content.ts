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
  description: string;
  date: string;
  endDate?: string;
  time?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
  repeat?: {
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    interval: number; // e.g., every 2 weeks
    byday?: string | string[]; // e.g., 'SU', 'MO,TU'
    bymonthday?: number; // e.g., the 15th of the month
    until?: string; // An end date for the recurrence
  };
}

function getSiteURL() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export async function getGeneralSettings(options?: RequestInit): Promise<GeneralSettings> {
  const res = await fetch(`${getSiteURL()}/api/content/general`, {
    ...options,
  });
  if (!res.ok) throw new Error("Failed to fetch general settings");
  const data = await res.json();
  return data.json;
}

export async function getEvents(options?: RequestInit): Promise<Event[]> {
  const res = await fetch(`${getSiteURL()}/api/content/events`, {
    ...options,
  });
  if (!res.ok) {
    console.error("Failed to fetch events");
    return [];
  }
  const data = await res.json();
  return data;
}
