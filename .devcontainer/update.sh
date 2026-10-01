#!/usr/bin/env bash
# Pobiera najnowszą wersję sklepu do Codespaces i uruchamia go ponownie.
# Dane (.env, baza, PDF) są poza Gitem i zostają nietknięte.
# Całość w funkcji: bash wczytuje ją przed wykonaniem, więc podmiana tego pliku przez git jest bezpieczna.
main() {
  set -euo pipefail
  cd "$(dirname "$0")/.."
  local branch
  branch=$(git rev-parse --abbrev-ref HEAD)
  echo "Pobieram najnowszą wersję ($branch)…"
  if git fetch origin "$branch"; then git reset --hard "origin/$branch"; else echo "Brak połączenia z GitHubem — uruchamiam bieżącą wersję."; fi
  git log -1 --format="Wersja: %h %s"
  npm install
  npx prisma db push
  npm run admin:reset
  bash .devcontainer/env.sh
  echo "Panel: /admin   login: admin@example.com   hasło: demo-haslo-2026"
  exec npm run dev
}
main "$@"
