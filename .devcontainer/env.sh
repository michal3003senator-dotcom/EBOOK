#!/usr/bin/env bash
# Ustawia publiczny adres sklepu w Codespaces (uruchamiane przy każdym starcie).
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f .env ] || cp .env.example .env
set_env() { if grep -q "^$1=" .env; then sed -i "s|^$1=.*|$1=\"$2\"|" .env; else echo "$1=\"$2\"" >> .env; fi; }

if [ -n "${CODESPACE_NAME:-}" ]; then
  set_env APP_URL "https://${CODESPACE_NAME}-3000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"
fi
if grep -q '^SESSION_SECRET="zmien' .env; then set_env SESSION_SECRET "$(openssl rand -hex 32)"; fi
grep "^APP_URL=" .env
