import { listingFeed } from "@/lib/listingFeed";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return listingFeed("marketplace", request);
}
