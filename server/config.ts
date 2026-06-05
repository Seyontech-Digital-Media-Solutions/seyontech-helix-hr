import "dotenv/config";

const required = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const usableKey = (value: string | undefined) =>
  value && !value.includes("paste ") && value !== "eyJ..." ? value : undefined;

const supabaseServiceRoleKey = usableKey(process.env.SUPABASE_SERVICE_ROLE_KEY);
const supabaseAnonKey = usableKey(
  process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY,
);

export const config = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required("DATABASE_URL"),
  supabaseUrl: required("SUPABASE_URL"),
  supabaseServiceRoleKey,
  supabaseServerKey:
    supabaseServiceRoleKey ?? supabaseAnonKey ?? required("SUPABASE_SERVICE_ROLE_KEY"),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:8080",
  frontendUrl: process.env.FRONTEND_URL ?? process.env.CORS_ORIGIN ?? "http://localhost:8080",
  adminEmails: (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
};
