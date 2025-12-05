import { NextResponse } from "next/server";
import { gh } from "@/lib/github";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const fileData: { content: string; sha: string } = await gh(
      `content/events/${params.slug}.json`
    );
    const content = Buffer.from(fileData.content, "base64").toString("utf-8");

    return NextResponse.json({ json: JSON.parse(content), sha: fileData.sha });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { json, sha } = await request.json();
    const content = Buffer.from(JSON.stringify(json, null, 2) + "\n").toString(
      "base64"
    );

    await gh(`content/events/${params.slug}.json`, {
      method: "PUT",
      body: {
        message: `feat: update event ${params.slug}`,
        content,
        sha,
      },
    });

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("Error in events PUT API route:", error);
    return NextResponse.json({ error: error.message, details: error }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { sha } = await request.json();
    await gh(`content/events/${params.slug}.json`, {
      method: "DELETE",
      body: {
        message: `feat: delete event ${params.slug}`,
        sha,
      },
    });

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
