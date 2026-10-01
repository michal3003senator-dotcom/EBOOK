#!/usr/bin/env bash
# Pobiera najnowszą wersję sklepu do Codespaces i uruchamia go ponownie.
# Dane (.env, baza, PDF) są poza Gitem i zostają nietknięte.
set -euo pipefail
cd "$(dirname "$0")/.."
branch=$(git rev-parse --abbrev-ref HEAD)
git fetch origin "$branch"
git reset --hard "origin/$branch"
npm install
npx prisma db push
npm run admin:reset
bash .devcontainer/env.sh
exec npm run dev
