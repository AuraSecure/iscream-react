import { NextRequest, NextResponse } from "next/server";

const owner = process.env.GITHUB_OWNER!;
const repo = process.env.GITHUB_REPO!;
const branch = process.env.GITHUB_BRANCH || "main";
const token = process.env.GITHUB_TOKEN!;
const filePath = "content/settings/general.json";

const GITHUB_API = "https://api.github.com";

async function gh<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers || {}),
    },
    // Ensure Node runtime (not edge) so Buffer is available
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// GET: return current JSON
export async function GET() {
  try {
    // https://docs.github.com/rest/repos/contents#get-repository-content
    const data = await gh<{
      content: string;
      encoding: "base64";
      sha: string;
    }>(`/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}?ref=${branch}`);

    const jsonStr = Buffer.from(data.content, "base64").toString("utf-8");
    return NextResponse.json({ json: JSON.parse(jsonStr) }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: update JSON with a commit
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json(); // expected: { json: {...}, message?: string }
    const newJson = body?.json;
    const commitMessage: string = body?.message || "Update general.json via /manage";

    if (!newJson || typeof newJson !== "object") {
      return NextResponse.json({ error: "Invalid body.json" }, { status: 400 });
    }
    const newContent = Buffer.from(JSON.stringify(newJson, null, 2), "utf-8").toString("base64");

    // Get current sha (required by GitHub for updates)
    const head = await gh<{ sha: string }>(
      `/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}?ref=${branch}`
    );

    // https://docs.github.com/rest/repos/contents#create-or-update-file-contents
    const result = await gh(`/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}`, {
      method: "PUT",
      body: JSON.stringify({
        message: commitMessage,
        content: newContent,
        sha: (head as any).sha,
        branch,
        committer: { name: "I Scream CMS", email: "noreply@example.com" },
      }),
    });

    return NextResponse.json({ ok: true, result }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
