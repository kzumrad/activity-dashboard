import OverviewScreen from "@/components/overview/OverviewScreen";
import { loadActivities, loadSessions } from "@/lib/data-files";

export default function OverviewPage() {
  return <OverviewScreen acts={loadActivities().items} sessions={loadSessions()} />;
}
