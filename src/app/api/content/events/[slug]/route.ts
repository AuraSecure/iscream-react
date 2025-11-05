import { NextResponse } from "next/server";
import { gh, GitHubAPIError } from "@/lib/github";

interface RouteParams {
  params: { slug: string };
}

/**
 * GET /api/content/events/[slug]
 * 
 * Fetches a single event file from GitHub.
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { slug } = params;
  const path = `content/events/${slug}.json`;

  try {
    const fileData = await gh<{ content: string; sha: string }>(path);
    const content = Buffer.from(fileData.content, "base64").toString("utf-8");
    const json = JSON.parse(content);

    // Coalesce date and startDate to handle data inconsistency
    const eventDate = json.date || json.startDate;

    return NextResponse.json({
      json: { ...json, date: eventDate },
      sha: fileData.sha,
    });

  } catch (error: any) {
    if (error instanceof GitHubAPIError && error.status === 404) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/content/events/[slug]
 * 
 * Updates a single event file on GitHub.
 */
export async function PUT(request: Request, { params }: RouteParams) {
  const { slug } = params;
  const path = `content/events/${slug}.json`;

  try {
    const { json, sha } = await request.json();
    if (!json || !sha) {
      return NextResponse.json({ error: "Missing required fields: json and sha" }, { status: 400 });
    }

    // Add timestamp
    const updatedJson = { ...json, updatedAt: new Date().toISOString() };
    const content = Buffer.from(JSON.stringify(updatedJson, null, 2) + "\n").toString("base64");

    await gh(path, {
      method: "PUT",
      body: {
        message: `feat: update event ${slug}`,
        content,
        sha,
      },
    });

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}