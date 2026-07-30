import { GlobalChat } from "@/components/GlobalChat";
import { getCurrentUser } from "@/lib/auth";
import { recentChat } from "@/lib/chat";

/**
 * Server wrapper so any page can drop the one global chat room into spare space
 * without repeating the user and message lookup.
 */
export async function ChatPanel() {
  const user = await getCurrentUser();
  const messages = await recentChat(user?.id ?? null);
  return <GlobalChat initial={messages} signedIn={user !== null} />;
}
