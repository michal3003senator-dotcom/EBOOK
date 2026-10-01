import { saveProduct } from "@/app/admin/actions";
import { ActionForm, Field } from "@/components/admin/action-form";
import { PageTitle, Panel } from "@/components/admin/ui";
import { UploadForm } from "@/components/admin/upload-form";
import { db } from "@/lib/db";
import { productFileExists } from "@/lib/storage";

export const dynamic = "force-dynamic";

const zl = (c: number | null) => (c === null ? "" : (c / 100).toFixed(2));

export default async function Products() {
  const products = await db.product.findMany({ orderBy: { createdAt: "asc" } });
  return (
    <>
      <PageTitle title="Produkt" />
      <div className="space-y-6">
        {products.map((p) => {
          const hasFile = productFileExists(p.filePath);
          return (
            <Panel key={p.id} title={p.name}>
              {!hasFile && (
                <p className="mb-4 rounded-lg border border-coral/40 bg-coral/10 p-3 text-sm text-coral">
                  Brak pliku PDF — wgraj go poniżej, inaczej kupujący nie pobiorą e-booka.
                </p>
              )}
              <ActionForm action={saveProduct} submit="Zapisz produkt">
                <input type="hidden" name="id" value={p.id} />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Nazwa">
                    <input name="name" defaultValue={p.name} required className="field" />
                  </Field>
                  <Field label="Podtytuł">
                    <input name="subtitle" defaultValue={p.subtitle} className="field" />
                  </Field>
                  <Field label="Cena brutto (zł)">
                    <input name="price" type="number" step="0.01" min="2" defaultValue={zl(p.priceCents)} required className="field" />
                  </Field>
                  <Field label="Cena przekreślona (zł)" hint="Opcjonalnie. Zgodnie z dyrektywą Omnibus pokazuj ją tylko, jeśli to najniższa cena z 30 dni przed obniżką.">
                    <input name="compareAt" type="number" step="0.01" min="0" defaultValue={zl(p.compareAtCents)} className="field" />
                  </Field>
                  <Field label="Stawka VAT (%)" hint="Informacyjnie, do eksportu. Przy zwolnieniu z VAT ustaw 0.">
                    <input name="vatRate" type="number" min="0" max="23" defaultValue={p.vatRate} className="field" />
                  </Field>
                  <Field label="Nazwa pliku u kupującego">
                    <input name="fileName" defaultValue={p.fileName} required className="field" />
                  </Field>
                  <Field label="Strony darmowego fragmentu" hint="Np. 1-22 (wstęp + rozdział 1) albo 1-5,9-12">
                    <input name="samplePages" defaultValue={p.samplePages} className="field" />
                  </Field>
                  <Field label="Limit pobrań na link">
                    <input name="downloadLimit" type="number" min="1" defaultValue={p.downloadLimit} className="field" />
                  </Field>
                  <Field label="Ważność linku (dni)">
                    <input name="downloadDays" type="number" min="1" defaultValue={p.downloadDays} className="field" />
                  </Field>
                </div>
                <label className="flex items-center gap-2 text-sm text-ink-300">
                  <input type="checkbox" name="active" defaultChecked={p.active} className="size-4 accent-gold" />
                  Produkt aktywny (widoczny w sklepie)
                </label>
              </ActionForm>
              <div className="mt-6 border-t border-ink-700 pt-5">
                <p className="mb-2 text-sm font-medium text-ink-300">Plik PDF</p>
                <p className="mb-3 text-xs text-ink-400">
                  {hasFile ? `Aktualny: ${p.filePath}. Wgraj nowy, aby podmienić (np. nowe wydanie) — kolejni kupujący dostaną nową wersję.` : "Wgraj plik e-booka."}
                </p>
                <UploadForm productId={p.id} />
              </div>
            </Panel>
          );
        })}
      </div>
    </>
  );
}
