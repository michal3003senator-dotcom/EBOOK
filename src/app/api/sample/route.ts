import { mainProduct } from "@/lib/products";
import { verifySample } from "@/lib/sample";
import { productFileExists, samplePdf } from "@/lib/storage";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  if (!verifySample(q.get("e"), q.get("s"))) return new Response("Link wygasł lub jest nieprawidłowy", { status: 410 });
  const product = await mainProduct();
  if (!product?.filePath || !productFileExists(product.filePath)) return new Response("Plik niedostępny", { status: 503 });

  const pdf = await samplePdf(product.filePath, product.samplePages);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Faceless-Cash-Cow-fragment.pdf"',
      "Cache-Control": "private, max-age=3600",
      "X-Robots-Tag": "noindex",
    },
  });
}
