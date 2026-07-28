import { recentActivity } from "@/lib/activity";
import { LiveActivityFeed } from "@/components/LiveActivityFeed";

/** Loads recent public activity for the live feed toasts. */
export async function LiveActivity() {
  const items = await recentActivity();
  if (!items.length) return null;
  return <LiveActivityFeed items={items} />;
}
