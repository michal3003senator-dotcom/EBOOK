#!/usr/bin/env bash
# Automatyczny setup podglądu w GitHub Codespaces (tryb testowy płatności).
set -euo pipefail

[ -f .env ] || cp .env.example .env
set_env() { grep -q "^$1=" .env && sed -i "s|^$1=.*|$1=\"$2\"|" .env || echo "$1=\"$2\"" >> .env; }

if [ -n "${CODESPACE_NAME:-}" ]; then
  set_env APP_URL "https://${CODESPACE_NAME}-3000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
fi
grep -q '^SESSION_SECRET="zmien' .env && set_env SESSION_SECRET "$(openssl rand -hex 32)"
set_env ADMIN_EMAIL "admin@example.com"
set_env ADMIN_PASSWORD "demo-haslo-2026"
set_env PAYMENT_PROVIDER "mock"

# PDF nie jest już w repozytorium — odtwarzamy go z historii, jeśli jest dostępna.
if [ ! -f Faceless-Cash-Cow-2026.pdf ]; then
  c=$(git rev-list -n 1 --all -- Faceless-Cash-Cow-2026.pdf 2>/dev/null || true)
  [ -n "$c" ] && git show "$c^:Faceless-Cash-Cow-2026.pdf" > Faceless-Cash-Cow-2026.pdf 2>/dev/null || rm -f Faceless-Cash-Cow-2026.pdf
fi

npm install
npm run setup

echo
echo "=========================================================="
echo " Sklep startuje w terminalu (npm run dev)."
echo " Panel: /admin   login: admin@example.com   hasło: demo-haslo-2026"
echo "=========================================================="
