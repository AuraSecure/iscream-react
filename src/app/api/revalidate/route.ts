import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { path } = await request.json();

  if (!path) {
    return NextResponse.json({ message: "Missing path to revalidate" }, { status: 400 });
  }

  try {
    revalidatePath(path);
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (error: any) {
    return NextResponse.json({ message: `Error revalidating: ${error.message}` }, { status: 500 });
  }
}
