import "server-only";
import { MAIN_PRODUCT_SLUG } from "./constants";
import { db } from "./db";

/** Produkt główny landing page'a: po slugu, a w razie braku — pierwszy aktywny. */
export async function mainProduct() {
  return (
    (await db.product.findFirst({ where: { slug: MAIN_PRODUCT_SLUG, active: true } })) ??
    db.product.findFirst({ where: { active: true }, orderBy: { createdAt: "asc" } })
  );
}
