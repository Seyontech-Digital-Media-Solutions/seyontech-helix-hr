import { supabase } from "@/lib/supabase-client";

const BUCKETS = {
  preJoining: import.meta.env.VITE_BUCKET_PRE_JOINING as string,
  postJoining: import.meta.env.VITE_BUCKET_POST_JOINING as string,
}

export async function uploadFile(
  file: File,
  fieldKey: string,
  userId: string,
  formType: "pre-joining" | "post-joining"
): Promise<string> {
  const bucket = formType === "pre-joining"
    ? BUCKETS.preJoining
    : BUCKETS.postJoining

  const ext = file.name.split(".").pop();
  const path = `${userId}/${fieldKey}_${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (error) throw new Error(error.message);
  return path;
}