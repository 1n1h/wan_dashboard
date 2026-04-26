import { NextResponse } from "next/server";
import { getInsforgeServer } from "@/lib/insforge";
import { getSessionUser } from "@/lib/session";

const BUCKET = "assets";
const MAX_BYTES = 25 * 1024 * 1024; // 25 MB hard cap
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

/**
 * POST /api/upload
 *
 * Multipart form upload → InsForge `assets` bucket.
 * Auth required. Returns the public URL the SDK gives back, which is what
 * Replicate then fetches when we submit a prediction.
 */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large. Max ${Math.floor(MAX_BYTES / 1024 / 1024)}MB.` },
      { status: 413 }
    );
  }

  if (file.type && !ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported type: ${file.type}` },
      { status: 415 }
    );
  }

  const sdk = await getInsforgeServer();

  const { data, error } = await sdk.storage.from(BUCKET).uploadAuto(file);

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Upload failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    url: data.url,
    key: data.key,
    size: data.size,
    mimeType: data.mimeType,
  });
}
