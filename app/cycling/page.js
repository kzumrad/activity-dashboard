import CyclingScreen from "@/components/cycling/CyclingScreen";
import { loadActivities } from "@/lib/data-files";

export const metadata = { title: "Cycling · My Activity Dashboard" };

export default function CyclingPage() {
  return <CyclingScreen acts={loadActivities().items} />;
}
