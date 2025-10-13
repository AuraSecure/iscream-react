import { NextRequest, NextResponse } from "next/server";
import { gh } from "@/lib/github";

const DIR_PATH = "content/events";

interface GitHubFileContent {
  content: string;
  sha: string;
}

/**
 * Handles GET requests to fetch a single event file from GitHub.
 */
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const path = `${DIR_PATH}/${slug}.json`;

  try {
    const file = await gh<GitHubFileContent>(path);
    const content = Buffer.from(file.content, "base64").toString("utf-8");
    const json = JSON.parse(content);
    return NextResponse.json({ json, sha: file.sha });
  } catch (error) {
    console.error(`Failed to read event file for ${slug}`, error);
    return NextResponse.json(
      { error: `Failed to read event data for "${slug}".` },
      { status: 500 }
    );
  }
}

/**
 * Handles PUT requests to update an event file on GitHub.
 */
export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const path = `${DIR_PATH}/${slug}.json`;

  try {
    const { json, sha } = await request.json();
    const content = Buffer.from(JSON.stringify(json, null, 2)).toString("base64");

    await gh(path, {
      method: "PUT",
      body: JSON.stringify({
        message: `Update event: ${slug}`,
        content,
        sha,
      }),
    });

    return NextResponse.json({ message: "Event updated successfully" });
  } catch (error) {
    console.error(`Failed to update event file for ${slug}`, error);
    return NextResponse.json(
      { error: `Failed to save event data for "${slug}".` },
      { status: 500 }
    );
  }
}

/**
 * Handles DELETE requests to remove an event file from GitHub.
 */
export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const path = `${DIR_PATH}/${slug}.json`;
  const { sha } = await request.json();
  await gh(path, {
    method: "DELETE",
    body: JSON.stringify({ message: `Delete event: ${slug}`, sha }),
  });
  return NextResponse.json({ message: "Event deleted successfully" });
}
