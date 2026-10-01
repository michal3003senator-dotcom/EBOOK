import { handleWebhook } from "@/lib/orders";

export async function POST(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  return handleWebhook((await params).provider, req);
}
