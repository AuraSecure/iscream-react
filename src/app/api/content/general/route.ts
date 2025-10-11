import { NextRequest, NextResponse } from "next/server";
import { gh } from "@/lib/github";

const filePath = "content/settings/general.json";

// GET: return current JSON
export async function GET() {
  const branch = process.env.GITHUB_BRANCH || "main";
  try {
    // https://docs.github.com/rest/repos/contents#get-repository-content
    const data = await gh<{ content: string; encoding: "base64"; sha: string }>(
      `${filePath}?ref=${branch}`
    );

    const jsonStr = Buffer.from(data.content, "base64").toString("utf-8");
    return NextResponse.json({ json: JSON.parse(jsonStr) }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("ERROR in GET handler:", message);
    return NextResponse.json({ json: null, error: message }, { status: 500 });
  }
}

// PUT: update JSON with a commit
export async function PUT(req: NextRequest) {
  const branch = process.env.GITHUB_BRANCH || "main";
  try {
    const body = await req.json(); // expected: { json: {...}, message?: string }
    const newJson = body?.json;
    const commitMessage: string = body?.message || "Update general.json via /manage";

    if (!newJson || typeof newJson !== "object") {
      return NextResponse.json({ error: "Invalid body.json" }, { status: 400 });
    }
    const newContent = Buffer.from(JSON.stringify(newJson, null, 2), "utf-8").toString("base64");

    // Get current sha (required by GitHub for updates)
    const head = await gh<{ sha: string }>(`${filePath}?ref=${branch}`);

    // https://docs.github.com/rest/repos/contents#create-or-update-file-contents
    const result = await gh(filePath, {
      method: "PUT",
      body: JSON.stringify({
        message: commitMessage,
        content: newContent,
        sha: head.sha,
        branch,
        committer: { name: "I Scream CMS", email: "noreply@example.com" },
      }),
    });

    return NextResponse.json({ ok: true, result }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
