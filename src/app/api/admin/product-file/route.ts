import { currentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { saveProductFile } from "@/lib/storage";

const MAX_BYTES = 200 * 1024 * 1024;

export async function POST(req: Request) {
  if (!(await currentAdmin())) return Response.json({ error: "Brak dostępu" }, { status: 401 });
  if (req.headers.get("origin") !== new URL(env.APP_URL).origin) return Response.json({ error: "Nieprawidłowe źródło żądania" }, { status: 403 });

  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!(await db.product.findUnique({ where: { id } }))) return Response.json({ error: "Nie ma takiego produktu" }, { status: 404 });
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BYTES) return Response.json({ error: "Plik jest za duży (max 200 MB)" }, { status: 413 });

  const bytes = Buffer.from(await req.arrayBuffer());
  if (bytes.length > MAX_BYTES) return Response.json({ error: "Plik jest za duży (max 200 MB)" }, { status: 413 });
  try {
    const filePath = await saveProductFile(bytes);
    await db.product.update({ where: { id }, data: { filePath } });
    return Response.json({ ok: true, filePath });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Błąd zapisu" }, { status: 400 });
  }
}
