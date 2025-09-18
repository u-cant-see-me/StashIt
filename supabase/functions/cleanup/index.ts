// supabase/functions/cleanup/index.ts
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("PROJECT_URL")!,
  Deno.env.get("SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  try {
    // 1. Check for authorization header
    const authHeader = req.headers.get("x-service-key");
    const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY");
    if (!authHeader || authHeader !== SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ code: 401, message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const now = new Date();

    // 2. Get all rows that might be expired
    const { data: stashRows, error } = await supabase.from("stash").select("*");
    if (error) throw error;
    if (!stashRows || stashRows.length === 0)
      return new Response(JSON.stringify({ status: "No rows found" }), { status: 200 });

    for (const row of stashRows) {
      const createdAt = new Date(row.created_at);
      let expired = false;

      // Handle 'once' keys
      if (row.expiry === "once" && now.getTime() - createdAt.getTime() > 15 * 60 * 1000) {
        expired = true;
      }

      // Handle 30m and 1h expiries
      if (row.expiry === "30m" && now.getTime() - createdAt.getTime() > 30 * 60 * 1000) {
        expired = true;
      }
      if (row.expiry === "1h" && now.getTime() - createdAt.getTime() > 60 * 60 * 1000) {
        expired = true;
      }

      if (expired) {
        // Delete files from Supabase Storage
        if (row.files && Array.isArray(row.files)) {
          const filePaths = row.files.map((f: any) => f.file_path).filter(Boolean);
          if (filePaths.length > 0) {
            const { error: storageError } = await supabase.storage
              .from("stash")
              .remove(filePaths);
            if (storageError) console.error("Storage delete error:", storageError.message);
          }
        }

        // Delete the row from the table
        const { error: tableError } = await supabase.from("stash").delete().eq("id", row.id);
        if (tableError) console.error("Table delete error:", tableError.message);
      }
    }

    return new Response(JSON.stringify({ status: "Cleanup done" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 });
  }
});
