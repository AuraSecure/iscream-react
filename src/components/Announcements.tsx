import { getAnnouncements } from "@/lib/content";

export async function Announcements() {
  // Fetch only active announcements. The getAnnouncements function handles this by default.
  const announcements = await getAnnouncements();

  if (announcements.length === 0) {
    return null;
  }

  return (
    <div className="bg-brand-yellow text-center p-2 text-sm font-semibold text-dark-magenta shadow-inner">
      {announcements.map((announcement) => (
        <p key={announcement.slug}>{announcement.text}</p>
      ))}
    </div>
  );
}
