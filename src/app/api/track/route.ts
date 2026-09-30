import { clientEventSchema, trackClientEvent } from "@/lib/analytics/track";
import { limited } from "@/lib/rate-limit";
import { clientInfo } from "@/lib/request";

export async function POST(req: Request) {
  const { ip } = await clientInfo();
  if (limited(`track:${ip}`, 120, 60_000)) return new Response(null, { status: 429 });

  let json: unknown;
  try {
    json = JSON.parse(await req.text());
  } catch {
    return new Response(null, { status: 400 });
  }
  const parsed = clientEventSchema.safeParse(json);
  if (!parsed.success) return new Response(null, { status: 400 });

  await trackClientEvent(parsed.data);
  return new Response(null, { status: 204 });
}
