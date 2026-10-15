import ClimbingScreen from "@/components/climbing/ClimbingScreen";
import { loadSessions } from "@/lib/data-files";

export const metadata = { title: "Climbing · My Activity Dashboard" };

export default function ClimbingPage() {
  return <ClimbingScreen sessions={loadSessions()} />;
}
