"use client";
// Today's date as "YYYY-MM-DD", read in the browser so it's the viewer's own day.
import { useState } from "react";
import { todayStr } from "@/lib/dates";

export default function useToday() {
  const [today] = useState(() => todayStr());
  return today;
}
