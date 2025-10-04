import { NextResponse } from "next/server";

const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH } = process.env;
const FILE_PATH = "content/settings/general.json"; // where your settings live

// --- GET handler: fetch current settings ---
export async function GET() {
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO || !GITHUB_BRANCH) {
    return NextResponse.json(
      { error: "Missing GitHub configuration" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}?ref=${GITHUB_BRANCH}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3.raw", // ensures we get raw JSON
        },
      }
    );

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const json = await res.json();
    return NextResponse.json(json);
  } catch (err: any) {
    return NextResponse.json(
      { error: "GitHub fetch failed", details: err.message },
      { status: 500 }
    );
  }
}

// --- PUT handler: update settings file in GitHub ---
export async function PUT(req: Request) {
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO || !GITHUB_BRANCH) {
    return NextResponse.json(
      { error: "Missing GitHub configuration" },
      { status: 500 }
    );
  }

  try {
    const newData = await req.json();

    // Get the latest SHA for this file
    const shaRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`,
      {
        headers: { Authorization: `token ${GITHUB_TOKEN}` },
      }
    );
    const shaJson = await shaRes.json();
    const sha = shaJson.sha;

    // Commit update
    const commitRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Update site settings",
          content: Buffer.from(JSON.stringify(newData, null, 2)).toString("base64"),
          sha,
          branch: GITHUB_BRANCH,
        }),
      }
    );

    if (!commitRes.ok) {
      throw new Error(`GitHub commit failed: ${commitRes.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "GitHub update failed", details: err.message },
      { status: 500 }
    );
  }
}
