import { createClient } from "@supabase/supabase-js";

// Retained for Supabase-specific features (storage, realtime, RLS queries).
// User persistence is handled by Prisma — see src/lib/user.ts.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
