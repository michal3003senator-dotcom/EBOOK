import { safeEqual } from "@/lib/crypto";
import { db } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = new URL(req.url).searchParams.get("t") ?? "";
  const order = await db.order.findUnique({ where: { id }, select: { status: true, accessToken: true } });
  if (!order || !safeEqual(t, order.accessToken)) return Response.json({}, { status: 404 });
  return Response.json({ status: order.status });
}
