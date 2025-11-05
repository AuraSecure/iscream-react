import { NextResponse } from "next/server";
import { gh, GitHubAPIError } from "@/lib/github";

const CONTENT_PATH = "content/menu/drinks.json";

/**
 * GET /api/content/drinks
 *
 * Fetches the drinks menu file.
 */
export async function GET() {
  try {
    const fileData: { content: string; sha: string } = await gh(CONTENT_PATH);
    const content = Buffer.from(fileData.content, "base64").toString("utf-8");

    return NextResponse.json({ json: JSON.parse(content), sha: fileData.sha });
  } catch (error: any) {
    // If the file doesn't exist, return a default empty state.
    if (error instanceof GitHubAPIError && error.status === 404) {
      return NextResponse.json({ json: { categories: [] }, sha: null });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/content/drinks
 *
 * Creates or updates the drinks menu file.
 */
export async function PUT(request: Request) {
  try {
    const { json, sha } = await request.json();
    const content = Buffer.from(JSON.stringify(json, null, 2) + "\n").toString("base64");

    await gh(CONTENT_PATH, {
      method: "PUT",
      body: { message: "feat: update drinks menu", content, sha },
    });

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
