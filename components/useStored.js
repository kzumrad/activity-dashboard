"use client";
// A setting remembered in this browser (grade scale, activity-mix toggle).
// Starts with the default and switches to the saved value once the page has loaded.
import { useEffect, useState } from "react";

export default function useStored(key, fallback, allowed) {
  const [value, setValue] = useState(fallback);
  useEffect(() => {
    try {
      const v = localStorage.getItem(key);
      if (v !== null && (!allowed || allowed.includes(v))) setValue(v);
    } catch {
      // Storage blocked: keep the default.
    }
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  function set(v) {
    setValue(v);
    try {
      localStorage.setItem(key, v);
    } catch {
      // Not remembered, but still works for this visit.
    }
  }
  return [value, set];
}
