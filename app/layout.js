import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import Tabs from "@/components/Tabs";
import { fmtShort } from "@/lib/dates";
import { loadActivities } from "@/lib/data-files";
import "./globals.css";

const display = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-display" });
const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata = {
  title: "My Activity Dashboard",
  description: "Activities from my COROS watch: climbing, hiking, walking and cycling.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Read the data files on every visit, so a sync or a logged route shows up straight away.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }) {
  const { syncedAt } = loadActivities();
  return (
    <html lang="en-GB" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <div className="wrap">
          <header>
            <div className="eyebrow">From your COROS watch</div>
            <h1>My Activity Dashboard</h1>
          </header>
          <Tabs />
          {children}
          <p className="foot">
            {syncedAt ? `Last synced from COROS on ${fmtShort(syncedAt)}. ` : ""}
            Ask Claude to sync your activities to bring in new ones.
          </p>
        </div>
      </body>
    </html>
  );
}
