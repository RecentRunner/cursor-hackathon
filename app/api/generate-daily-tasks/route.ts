import { NextResponse } from "next/server";

import { generateAndSyncDailyTasks } from "@/lib/ai-daily-tasks-server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const result = await generateAndSyncDailyTasks(
      supabase,
      user.id,
      user.user_metadata,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("generate-daily-tasks failed:", error);

    return NextResponse.json(
      {
        generated: false,
        source: "fallback",
        tasks: [],
        error:
          error instanceof Error
            ? error.message
            : "Could not generate daily tasks.",
      },
      { status: 500 },
    );
  }
}
