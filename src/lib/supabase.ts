import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface UpsertUserParams {
  authId: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  avatarUrl: string | null;
  provider: string;
}

export async function upsertUser(params: UpsertUserParams): Promise<void> {
  const { error } = await supabaseAdmin.from("users").upsert(
    {
      auth_id: params.authId,
      email: params.email,
      phone: params.phone,
      name: params.name,
      avatar_url: params.avatarUrl,
      provider: params.provider,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "auth_id" }
  );

  if (error) throw error;
}
