import { NextResponse } from "next/server";

const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH } = process.env;

async function githubRequest(path: string, options: any = {}) {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
  const headers = {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
    ...options.headers,
  };
  return fetch(url, { ...options, headers });
}

// GET single event
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;

  const res = await githubRequest(`content/events/${slug}.json?ref=${GITHUB_BRANCH}`);

  if (!res.ok) {
    return NextResponse.json(
      { error: `GitHub fetch failed: ${res.status}` },
      { status: res.status }
    );
  }

  const json = await res.json();
  return NextResponse.json(json);
}

// PUT update event
export async function PUT(req: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const body = await req.json();

  // Get the current file SHA
  const getRes = await githubRequest(`content/events/${slug}.json?ref=${GITHUB_BRANCH}`);
  if (!getRes.ok) {
    return NextResponse.json(
      { error: `Event not found: ${getRes.status}` },
      { status: getRes.status }
    );
  }
  const file = await getRes.json();

  // Update file
  const updateRes = await githubRequest(`content/events/${slug}.json`, {
    method: "PUT",
    body: JSON.stringify({
      message: `Update event ${slug}`,
      content: Buffer.from(JSON.stringify(body, null, 2)).toString("base64"),
      branch: GITHUB_BRANCH,
      sha: file.sha,
    }),
  });

  if (!updateRes.ok) {
    const text = await updateRes.text();
    return NextResponse.json({ error: text }, { status: updateRes.status });
  }

  return NextResponse.json({ success: true });
}

// DELETE event
export async function DELETE(req: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;

  // Get the current file SHA
  const getRes = await githubRequest(`content/events/${slug}.json?ref=${GITHUB_BRANCH}`);
  if (!getRes.ok) {
    return NextResponse.json(
      { error: `Event not found: ${getRes.status}` },
      { status: getRes.status }
    );
  }
  const file = await getRes.json();

  // Delete file
  const deleteRes = await githubRequest(`content/events/${slug}.json`, {
    method: "DELETE",
    body: JSON.stringify({
      message: `Delete event ${slug}`,
      sha: file.sha,
      branch: GITHUB_BRANCH,
    }),
  });

  if (!deleteRes.ok) {
    const text = await deleteRes.text();
    return NextResponse.json({ error: text }, { status: deleteRes.status });
  }

  return NextResponse.json({ success: true });
}
