import HikingScreen from "@/components/hiking/HikingScreen";
import { loadActivities } from "@/lib/data-files";

export const metadata = { title: "Hiking · My Activity Dashboard" };

export default function HikingPage() {
  return <HikingScreen acts={loadActivities().items} />;
}
