import { NextRequest, NextResponse } from "next/server";
import { gh } from "@/lib/github";

/**
 * Handles GET requests to fetch the full content of all event files from GitHub.
 */
export async function GET() {
  try {
    type GithubFile = { name: string; type: string; download_url: string; sha: string };
    const files = await gh<GithubFile[]>(
      `content/events?ref=${process.env.GITHUB_BRANCH || "main"}`
    );

    if (!Array.isArray(files)) {
      console.warn("GitHub API did not return an array for content/events");
      return NextResponse.json([]);
    }

    const eventPromises = files
      .filter((file) => file.type === "file" && file.name.endsWith(".json"))
      .map(async (file) => {
        try {
          const res = await fetch(file.download_url);
          if (!res.ok) {
            console.error(`Failed to fetch ${file.download_url}: ${res.statusText}`);
            return null;
          }
          const data = await res.json();

          // Coalesce date and startDate to handle data inconsistency
          const eventDate = data.date || data.startDate;

          // Validate essential fields
          if (!data || typeof data.title !== "string" || typeof eventDate !== "string") {
            console.warn(`Skipping invalid event file (missing title or date): ${file.name}`);
            return null;
          }

          return {
            ...data,
            date: eventDate, // Standardize the output to always have a `date` property
            slug: file.name.replace(/\.json$/, ""),
            sha: file.sha,
          };
        } catch (error) {
          console.error(`Error processing event file ${file.name}:`, error);
          return null;
        }
      });

    const events = (await Promise.all(eventPromises)).filter(Boolean);

    return NextResponse.json(events);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to get events:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Handles POST requests to create a new event file on GitHub.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.title) {
      return NextResponse.json({ error: "Missing required field: title" }, { status: 400 });
    }

    const now = new Date();
    const dateStamp = now.toISOString().split("T")[0]; // YYYY-MM-DD

    // safer slug
    const safeTitle = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = `${dateStamp}-${safeTitle}`;
    const path = `content/events/${slug}.json`;

    // inject timestamps
    const eventData = { ...body, createdAt: now.toISOString(), updatedAt: now.toISOString() };
    const content = Buffer.from(JSON.stringify(eventData, null, 2)).toString("base64");

    const result = await gh(path, {
      method: "PUT",
      body: JSON.stringify({
        message: `feat: Add new event '${body.title}'`,
        content,
      }),
    });

    return NextResponse.json({ success: true, slug, result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
