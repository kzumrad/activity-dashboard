import WalkingScreen from "@/components/walking/WalkingScreen";
import { loadActivities, loadSteps } from "@/lib/data-files";

export const metadata = { title: "Walking · My Activity Dashboard" };

export default function WalkingPage() {
  return <WalkingScreen acts={loadActivities().items} steps={loadSteps()} />;
}
