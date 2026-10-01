#!/usr/bin/env bash
# Pobiera najnowszą wersję sklepu do Codespaces i uruchamia go ponownie.
# Dane (.env, baza, PDF) są poza Gitem i zostają nietknięte.
set -euo pipefail
cd "$(dirname "$0")/.."
branch=$(git rev-parse --abbrev-ref HEAD)
echo "Pobieram najnowszą wersję ($branch)…"
if git fetch origin "$branch"; then git reset --hard "origin/$branch"; else echo "Brak połączenia z GitHubem — uruchamiam bieżącą wersję."; fi
git log -1 --format="Wersja: %h %s"
npm install
npx prisma db push
npm run admin:reset
bash .devcontainer/env.sh
exec npm run dev
