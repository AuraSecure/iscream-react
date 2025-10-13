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

    // Guard against non-array responses before iterating
    if (!Array.isArray(files)) {
      return NextResponse.json([]);
    }

    const events = await Promise.all(
      files
        .filter((f) => f.type === "file" && f.name.endsWith(".json"))
        .map(async (file) => {
          const res = await fetch(file.download_url); // download_url is already authenticated
          const data = await res.json();
          return {
            ...data,
            slug: file.name.replace(/\.json$/, ""),
            sha: file.sha, // Include the sha for delete operations
          };
        })
    );

    return NextResponse.json(events);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
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
