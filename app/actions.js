"use server";
// Changes to the climbing log, run on the server so they can write the session files in data/.
// Everything sent from the page is checked before it's written.
import { revalidatePath } from "next/cache";
import { cleanRoutes, manualSession, validDate, validId } from "@/lib/climbing";
import { deleteSessionFile, readSession, saveSession } from "@/lib/data-files";

function refresh() {
  revalidatePath("/", "layout");
}

export async function saveRoutes(id, routes) {
  const clean = cleanRoutes(routes);
  if (!validId(id) || !clean) return { error: "That change couldn't be saved." };
  const s = readSession(id);
  if (!s) return { error: "That session no longer exists." };
  saveSession({ ...s, routes: clean });
  refresh();
  return { ok: true };
}

export async function addSession(date) {
  if (!validDate(date)) return { error: "Pick a valid date." };
  const s = manualSession(date);
  saveSession(s);
  refresh();
  return { ok: true, session: s };
}

// Only sessions added by hand can be deleted; the watch's sessions come back on the next sync anyway.
export async function deleteSession(id) {
  const s = validId(id) && readSession(id);
  if (!s || s.source !== "manual") return { error: "Only sessions added by hand can be deleted." };
  deleteSessionFile(id);
  refresh();
  return { ok: true };
}
