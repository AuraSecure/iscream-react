import { NextResponse } from "next/server";
import { gh } from "@/lib/github";
import { Buffer } from "buffer";

// GET single event
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = await params;
    // The GitHub API returns the file content, which is the event object.
    // We can be more specific than `any`.
    const fileContent = await gh<{ content: string; encoding: "base64" }>(
      `content/events/${slug}.json?ref=${process.env.GITHUB_BRANCH}`
    );
    // The 'encoding' from GitHub is 'base64', so we need to decode it.
    const decodedContent = Buffer.from(fileContent.content, "base64").toString("utf-8");
    const json = JSON.parse(decodedContent);
    return NextResponse.json(json);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT update event
export async function PUT(req: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = await params;
    const body = await req.json();

    // Get the current file SHA
    const file = await gh<{ sha: string }>(`content/events/${slug}.json`);

    // Update file
    await gh(`content/events/${slug}.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Update event ${slug}`,
        content: Buffer.from(JSON.stringify(body, null, 2)).toString("base64"),
        branch: process.env.GITHUB_BRANCH || "main",
        sha: file.sha,
        committer: { name: "I Scream CMS", email: "noreply@example.com" },
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE event
export async function DELETE(req: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = await params;
    const branch = process.env.GITHUB_BRANCH || "main";

    // Get the current file SHA. The outer try/catch will handle 404s if the file doesn't exist.
    const file = await gh<{ sha: string }>(`content/events/${slug}.json?ref=${branch}`);

    await gh(`content/events/${slug}.json?branch=${branch}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Delete event ${slug}`,
        sha: file.sha,
        committer: { name: "I Scream CMS", email: "noreply@example.com" },
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("DELETE error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
