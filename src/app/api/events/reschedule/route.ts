import { NextResponse } from "next/server";
import { getNextOccurrence } from "@/lib/events";
import type { Event } from "@/lib/content";
import { gh, GitHubAPIError } from "@/lib/github";

export async function POST(request: Request) {
  // Protect the endpoint with a secret key
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_OWNER || !process.env.GITHUB_REPO) {
    return NextResponse.json(
      { status: "error", message: "GitHub environment variables are not configured." },
      { status: 500 }
    );
  }

  try {
    // 1. Fetch all event files from the GitHub repository
    console.log("--- Reschedule Job Started ---");
    const files: any[] = await gh("content/events");

    const updatedEvents: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (file.type !== "file" || !file.name.endsWith(".json")) continue;

      try {
        // 2. Fetch the content of the event file
        const fileData: { content: string; sha: string } = await gh(file.path);
        const fileContent = Buffer.from(fileData.content, "base64").toString("utf-8");
        const parsedEvent = JSON.parse(fileContent);

        // FIX: Handle both 'date' and 'startDate' property names
        const event: Event = { ...parsedEvent, date: parsedEvent.date || parsedEvent.startDate };
        event.slug = file.name.replace(".json", "");

        if (!event.date) {
          console.warn(`Event ${event.slug} is missing a date. Skipping.`);
          continue;
        }

        const originalDate = event.date;

        // 3. Calculate the next occurrence
        const nextDate = getNextOccurrence(event);

        if (nextDate && nextDate !== originalDate) {
          console.log(`Updating event ${event.slug}: ${originalDate} -> ${nextDate}`);
          // 4. If the date has changed, update the file in the GitHub repo
          const updatedEvent = { ...parsedEvent, date: nextDate, startDate: nextDate };

          const updatedContent = Buffer.from(JSON.stringify(updatedEvent, null, 2) + "\n").toString(
            "base64"
          );

          const shaForUpdate = fileData.sha;
          console.log(`Preparing to update ${file.name} with SHA: ${shaForUpdate}`);

          const bodyForGithub = {
            message: `chore: auto-reschedule event ${event.slug}`,
            content: updatedContent,
            sha: shaForUpdate,
          };

          console.log("Calling GitHub API to update file...");
          await gh(file.path, {
            method: "PUT",
            body: bodyForGithub,
          });
          console.log(`Successfully updated ${file.name}`);

          updatedEvents.push(`${event.slug} (from ${originalDate} -> ${nextDate})`);
        }
      } catch (e: any) {
        errors.push(`Failed to process ${file.name}: ${e.message}`);
        console.error(`--- ERROR processing ${file.name}: ---`);
        if (e instanceof GitHubAPIError) {
          // If it's a GitHub API error, we have more context
          console.error(`GitHub API responded with status ${e.status}`);
          errors.push(`GitHub API error for ${file.name}: Status ${e.status} - ${e.message}`);
        }
        console.error(e); // Log the full error object, which might contain the GitHub API response
      }
    }

    if (updatedEvents.length > 0) {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/events" }),
      });
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { status: "error", message: "Some events failed to update.", errors, updatedEvents },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "success",
      message:
        updatedEvents.length > 0
          ? "Events rescheduled successfully."
          : "No events needed rescheduling.",
      updatedEvents,
    });
  } catch (error: any) {
    console.error("--- FATAL Reschedule API Error ---");
    console.error("Reschedule API Error:", error);
    return NextResponse.json(
      { status: "error", message: `An unexpected error occurred: ${error.message}` },
      { status: 500 }
    );
  }
}
