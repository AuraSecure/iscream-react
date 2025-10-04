import { NextResponse } from "next/server";

const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH } = process.env;

function checkConfig() {
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO || !GITHUB_BRANCH) {
    throw new Error("Missing GitHub configuration");
  }
}

// ------------------------- GET -------------------------
export async function GET() {
  try {
    checkConfig();

    const listRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/content/events?ref=${GITHUB_BRANCH}`,
      { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
    );

    if (!listRes.ok) {
      throw new Error(`GitHub API error: ${listRes.status}`);
    }

    const files: any[] = await listRes.json();

    const events = await Promise.all(
      files
        .filter((f) => f.type === "file")
        .map(async (file) => {
          const res = await fetch(file.download_url);
          const data = await res.json();
          return {
            ...data,
            slug: file.name.replace(/\.json$/, ""),
          };
        })
    );

    return NextResponse.json(events);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ------------------------- POST -------------------------
export async function POST(req: Request) {
  try {
    checkConfig();

    const body = await req.json();
    if (!body || !body.title) {
      return NextResponse.json({ error: "Missing required field: title" }, { status: 400 });
    }

    const now = new Date().toISOString();

    // safer slug
    const safeTitle = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = `${safeTitle}-${Date.now()}`;
    const path = `content/events/${slug}.json`;

    // inject timestamps
    const eventData = {
      ...body,
      createdAt: now,
      updatedAt: now,
    };

    const content = Buffer.from(JSON.stringify(eventData, null, 2)).toString("base64");

    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          message: `Add new event: ${body.title}`,
          content,
          branch: GITHUB_BRANCH,
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GitHub API error: ${res.status} - ${text}`);
    }

    const result = await res.json();

    return NextResponse.json({
      success: true,
      slug,
      commit: result?.commit?.sha || null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ------------------------- DELETE -------------------------
export async function DELETE(req: Request) {
  try {
    checkConfig();

    const url = new URL(req.url);
    const slug = url.pathname.split("/").pop();
    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const path = `content/events/${slug}.json`;

    // get file sha first
    const getRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`,
      { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
    );

    if (!getRes.ok) {
      const text = await getRes.text();
      throw new Error(`Failed to fetch file for delete: ${getRes.status} - ${text}`);
    }

    const fileData = await getRes.json();

    const delRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          message: `Delete event: ${slug}`,
          sha: fileData.sha,
          branch: GITHUB_BRANCH,
        }),
      }
    );

    if (!delRes.ok) {
      const text = await delRes.text();
      throw new Error(`GitHub API error: ${delRes.status} - ${text}`);
    }

    const result = await delRes.json();

    return NextResponse.json({
      success: true,
      commit: result?.commit?.sha || null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
