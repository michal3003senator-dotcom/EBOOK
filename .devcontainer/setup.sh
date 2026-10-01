#!/usr/bin/env bash
# Automatyczny setup podglądu w GitHub Codespaces (tryb testowy płatności).
set -euo pipefail
cd "$(dirname "$0")/.."

bash .devcontainer/env.sh
set_env() { if grep -q "^$1=" .env; then sed -i "s|^$1=.*|$1=\"$2\"|" .env; else echo "$1=\"$2\"" >> .env; fi; }
set_env ADMIN_EMAIL "admin@example.com"
set_env ADMIN_PASSWORD "demo-haslo-2026"
set_env PAYMENT_PROVIDER "mock"

# PDF nie jest już w repozytorium — odtwarzamy go z historii, jeśli jest dostępna.
if [ ! -f Faceless-Cash-Cow-2026.pdf ]; then
  c=$(git rev-list -n 1 --all -- Faceless-Cash-Cow-2026.pdf 2>/dev/null || true)
  if [ -n "$c" ]; then git show "$c^:Faceless-Cash-Cow-2026.pdf" > Faceless-Cash-Cow-2026.pdf 2>/dev/null || rm -f Faceless-Cash-Cow-2026.pdf; fi
fi

npm install
npm run setup

echo
echo "=========================================================="
echo " Panel: /admin   login: admin@example.com   hasło: demo-haslo-2026"
echo "=========================================================="
