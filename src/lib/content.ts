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

export interface Announcement {
  slug: string;
  title: string;
  text: string;
  startDate: string;
  endDate: string;
}

export interface PartyInfo {
  text: string;
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
    throw new Error("Failed to fetch events");
  }
  const data = await res.json();
  return data;
}

export async function getAnnouncements(options?: RequestInit): Promise<Announcement[]> {
  const res = await fetch(`${getSiteURL()}/api/content/announcements?full=true`, {
    ...options,
  });
  if (!res.ok) {
    throw new Error("Failed to fetch announcements");
  }
  const announcements: Announcement[] = await res.json();

  // Filter for active announcements on the server
  const now = new Date();
  return announcements.filter((announcement) => {
    if (!announcement.startDate || !announcement.endDate) {
      return false;
    }
    const startDate = new Date(announcement.startDate);
    const endDate = new Date(announcement.endDate);
    // Set endDate to the end of the day
    endDate.setHours(23, 59, 59, 999);
    return now >= startDate && now <= endDate;
  });
}

export async function getPartyInfo(options?: RequestInit): Promise<PartyInfo> {
  const res = await fetch(`${getSiteURL()}/api/content/parties`, {
    ...options,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch party info");
  }
  const data = await res.json();
  return data.json;
}
