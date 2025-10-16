import { NextResponse } from "next/server";
import { gh } from "@/lib/github";
import type { Event } from "@/lib/content";

/**
 * A temporary diagnostic endpoint to list all event dates from the GitHub repo.
 */
export async function GET() {
  try {
    console.log("--- Diagnostic: Listing Event Dates ---");

    if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_OWNER || !process.env.GITHUB_REPO) {
      return NextResponse.json(
        { error: "GitHub environment variables are not configured." },
        { status: 500 }
      );
    }

    const files: any[] = await gh("content/events");

    const eventDates: { fileName: string; date: string }[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (file.type !== "file" || !file.name.endsWith(".json")) continue;

      try {
        const fileData: { content: string } = await gh(file.path);
        const fileContent = Buffer.from(fileData.content, "base64").toString("utf-8");
        const parsedEvent = JSON.parse(fileContent) as Partial<Event> & {
          startDate?: string;
        };

        const date = parsedEvent.date || parsedEvent.startDate;
        if (date) {
          eventDates.push({ fileName: file.name, date });
        }
      } catch (e: any) {
        errors.push(`Failed to process ${file.name}: ${e.message}`);
      }
    }

    eventDates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({ eventDates, errors });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
