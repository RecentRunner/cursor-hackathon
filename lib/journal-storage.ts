import { createClient } from "@/lib/supabase/client";

export type JournalEntry = {
  entryDate: string;
  content: string;
};

const LOCAL_STORAGE_KEY = "habit-pet-journal";

export function getTodayDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getLocalJournalEntry(entryDate = getTodayDateKey()): JournalEntry | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const entry = JSON.parse(raw) as JournalEntry;
    return entry.entryDate === entryDate ? entry : null;
  } catch {
    return null;
  }
}

function saveLocalJournalEntry(content: string, entryDate = getTodayDateKey()) {
  const entry: JournalEntry = { entryDate, content };
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entry));
  return entry;
}

export async function getJournalEntryForToday(): Promise<JournalEntry | null> {
  const entryDate = getTodayDateKey();
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return getLocalJournalEntry(entryDate);
  }

  const { data, error } = await supabase
    .from("journal_entries")
    .select("entry_date, content")
    .eq("user_id", user.id)
    .eq("entry_date", entryDate)
    .maybeSingle();

  if (error) {
    console.error("Failed to load journal entry:", error.message);
    return getLocalJournalEntry(entryDate);
  }

  if (!data) {
    return null;
  }

  return {
    entryDate: data.entry_date,
    content: data.content,
  };
}

export async function saveJournalEntry(content: string): Promise<JournalEntry> {
  const entryDate = getTodayDateKey();
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return saveLocalJournalEntry(content, entryDate);
  }

  const { data, error } = await supabase
    .from("journal_entries")
    .upsert(
      {
        user_id: user.id,
        entry_date: entryDate,
        content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,entry_date" },
    )
    .select("entry_date, content")
    .single();

  if (error) {
    console.error("Failed to save journal entry:", error.message);
    return saveLocalJournalEntry(content, entryDate);
  }

  return {
    entryDate: data.entry_date,
    content: data.content,
  };
}

export function hasJournalEntryToday(entry: JournalEntry | null) {
  return entry?.entryDate === getTodayDateKey() && entry.content.trim().length > 0;
}
