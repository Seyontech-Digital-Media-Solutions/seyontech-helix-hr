import { supabase } from "@/lib/supabase-client";

const BUCKETS = {
  preJoining: import.meta.env.VITE_BUCKET_PRE_JOINING as string,
  postJoining: import.meta.env.VITE_BUCKET_POST_JOINING as string,
}

// Sanitize name for use as folder: lowercase, spaces → underscore
function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")        // spaces → underscore
    .replace(/[^a-z0-9_]/g, "") // remove special chars
    || "unknown"
}

export async function uploadFile(
  file: File,
  fieldKey: string,
  userId: string,
  formType: "pre-joining" | "post-joining",
  userName?: string              
): Promise<string> {
  const bucket = formType === "pre-joining"
    ? BUCKETS.preJoining
    : BUCKETS.postJoining

  // Use sanitized username if provided, fallback to userId
  const folderName = userName ? sanitizeName(userName) : userId

  const ext = file.name.split(".").pop();
  const path = `${folderName}/${fieldKey}_${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (error) throw new Error(error.message);
  return path;
}