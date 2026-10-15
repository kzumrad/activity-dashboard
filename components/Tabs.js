"use client";
// The tab bar. Each tab is its own page, so the browser's back button works.
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Overview" },
  { href: "/climbing", label: "Climbing", col: "var(--c-climb)" },
  { href: "/hiking", label: "Hiking", col: "var(--c-hike)" },
  { href: "/walking", label: "Walking", col: "var(--c-walk)" },
  { href: "/cycling", label: "Cycling", col: "var(--c-bike)" },
];

export default function Tabs() {
  const path = usePathname();
  return (
    <nav className="tabs" aria-label="Dashboard sections">
      {TABS.map((t) => (
        <Link key={t.href} href={t.href} aria-current={path === t.href ? "page" : undefined}>
          {t.col && <i style={{ background: t.col }} />}
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
