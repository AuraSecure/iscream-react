import { NextResponse } from "next/server";
import { gh } from "@/lib/github";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const full = searchParams.get("full") === "true";

  try {
    const files: any[] = await gh("content/events");

    if (full) {
      const events = await Promise.all(
        files.map(async (file) => {
          const fileData: { content: string; sha: string } = await gh(file.path);
          const content = Buffer.from(fileData.content, "base64").toString(
            "utf-8"
          );
          const json = JSON.parse(content);
          return { ...json, slug: file.name.replace(".json", ""), sha: fileData.sha };
        })
      );
      return NextResponse.json({ events });
    } else {
      return NextResponse.json({ events: files });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}