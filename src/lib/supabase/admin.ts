import { createClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Supabase URL or Service Role Key is not defined in environment variables.");
}

// This admin client can be used in server-side code that is not part of a request
// (e.g., cron jobs, queues) to perform privileged operations.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

logger.info("Supabase admin client initialized.");