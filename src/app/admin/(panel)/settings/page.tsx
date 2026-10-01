import { changePassword, updateSettings } from "@/app/admin/actions";
import { ActionForm, Field } from "@/components/admin/action-form";
import { PageTitle, Panel } from "@/components/admin/ui";
import { env } from "@/lib/env";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const s = await getSettings();
  const integrations: [string, boolean, string][] = [
    ["Bramka płatności", env.PAYMENT_PROVIDER !== "mock", env.PAYMENT_PROVIDER === "mock" ? "tryb testowy" : env.PAYMENT_PROVIDER],
    ["Webhook Stripe", Boolean(env.STRIPE_WEBHOOK_SECRET), `${env.APP_URL}/api/webhooks/stripe`],
    ["Wysyłka e-maili (SMTP)", Boolean(env.SMTP_URL), env.MAIL_FROM],
  ];
  return (
    <>
      <PageTitle title="Ustawienia" />
      <div className="space-y-6">
        <Panel title="Integracje (plik .env)">
          <ul className="space-y-2 text-sm">
            {integrations.map(([name, ok, detail]) => (
              <li key={name} className="flex flex-wrap items-center gap-2">
                <span className={ok ? "text-emerald-400" : "text-coral"}>{ok ? "✓" : "✕"}</span>
                <span className="text-white">{name}</span>
                <span className="text-ink-400">· {detail}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Sprzedawca i strona">
          <ActionForm action={updateSettings} submit="Zapisz ustawienia">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Sprzedawca (imię i nazwisko / firma)">
                <input name="sellerName" defaultValue={s.sellerName} className="field" />
              </Field>
              <Field label="Adres do doręczeń">
                <input name="sellerAddress" defaultValue={s.sellerAddress} className="field" />
              </Field>
              <Field label="NIP" hint="Puste przy działalności nierejestrowanej">
                <input name="sellerTaxId" defaultValue={s.sellerTaxId} className="field" />
              </Field>
              <Field label="Forma działalności (do regulaminu)">
                <input name="sellerRegistry" defaultValue={s.sellerRegistry} className="field" />
              </Field>
              <Field label="E-mail kontaktowy">
                <input name="sellerEmail" type="email" defaultValue={s.sellerEmail} className="field" />
              </Field>
              <Field label="Pasek ogłoszeń na górze strony" hint="Np. „Promocja premierowa do niedzieli”. Puste = ukryty.">
                <input name="announcement" defaultValue={s.announcement} className="field" />
              </Field>
              <Field label="Tytuł strony (SEO)">
                <input name="metaTitle" defaultValue={s.metaTitle} className="field" />
              </Field>
              <Field label="Opis strony (SEO)">
                <textarea name="metaDescription" defaultValue={s.metaDescription} rows={3} className="field" />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink-300">
              <input type="checkbox" name="leadMagnetEnabled" defaultChecked={s.leadMagnetEnabled} className="size-4 accent-gold" />
              Pokazuj formularz bezpłatnego fragmentu (zbieranie leadów)
            </label>
          </ActionForm>
        </Panel>
        <Panel title="Zmiana hasła">
          <ActionForm action={changePassword} submit="Zmień hasło">
            <div className="grid max-w-xl gap-4 md:grid-cols-2">
              <Field label="Obecne hasło">
                <input name="current" type="password" required autoComplete="current-password" className="field" />
              </Field>
              <Field label="Nowe hasło (min. 12 znaków)">
                <input name="next" type="password" required minLength={12} autoComplete="new-password" className="field" />
              </Field>
            </div>
          </ActionForm>
        </Panel>
      </div>
    </>
  );
}
