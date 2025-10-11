import { NextResponse } from "next/server";
import { gh } from "@/lib/github";

export async function GET() {
  try {
    type GithubFile = { name: string; type: string; download_url: string };
    const files = await gh<GithubFile[]>(
      `content/events?ref=${process.env.GITHUB_BRANCH || "main"}`
    );

    // Guard against non-array responses before iterating
    if (!Array.isArray(files)) {
      return NextResponse.json([]);
    }

    const events = await Promise.all(
      files
        .filter((f) => f.type === "file")
        .map(async (file) => {
          const res = await fetch(file.download_url); // download_url is already authenticated
          const data = await res.json();
          return {
            ...data,
            slug: file.name.replace(/\.json$/, ""),
          };
        })
    );

    return NextResponse.json(events);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ------------------------- POST -------------------------
export async function POST(req: Request) {
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
    const eventData = {
      ...body,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const content = Buffer.from(JSON.stringify(eventData, null, 2)).toString("base64");

    // Define the expected response shape from the GitHub API for a file creation
    type GithubPutResponse = { commit: { sha: string } };

    const result = await gh<GithubPutResponse>(path, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Add new event: ${body.title}`,
        content,
        branch: process.env.GITHUB_BRANCH || "main",
        committer: { name: "I Scream CMS", email: "noreply@example.com" },
      }),
    });

    return NextResponse.json({
      success: true,
      slug,
      // Use optional chaining for safe access
      commit: result?.commit?.sha ?? null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// The DELETE functionality is handled by the dynamic route src/app/api/content/events/[slug]/route.ts
// This file should only handle GET for all events and POST for creating a new event.
// We can remove the DELETE handler from here to avoid confusion and potential bugs.
