import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * Handles POST requests to revalidate one or more Next.js cache paths.
 * Expects a JSON body with a `path` (string) or `paths` (string[]).
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const pathsToRevalidate = body.path ? [body.path] : body.paths;

  if (!pathsToRevalidate || !Array.isArray(pathsToRevalidate)) {
    return NextResponse.json(
      { message: "Missing 'path' or 'paths' in request body" },
      { status: 400 }
    );
  }

  try {
    pathsToRevalidate.forEach((path: string) => revalidatePath(path));
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ revalidated: false, message }, { status: 500 });
  }
}
