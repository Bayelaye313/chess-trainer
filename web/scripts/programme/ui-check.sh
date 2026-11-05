#!/bin/bash
# Contrôle dans l'application : chaque jour demandé est joué de bout en bout sur une COPIE de la base.
#
#   scripts/programme/ui-check.sh 23:1 30:1        # semaine:jour, autant que voulu
#
# Prérequis : `npx next build` à jour (le serveur est lancé avec `next start`, plus léger que `next dev`).
# Pour passer par le verrou et la mesure mémoire du lanceur :
#   scripts/programme/run-step.sh exec ui-check -- scripts/programme/ui-check.sh 23:1 30:1
#
# - Copie de data/chess-trainer.db dans un dossier temporaire (mktemp), servie via DATABASE_PATH :
#   la vraie base n'est jamais modifiée.
# - Port libre choisi à partir de 3131 (3000 est une autre application du poste).
# - Pour chaque jour : curseur programme_state (utilisateur « local ») placé sur ce jour, séance jouée par
#   play-day.mjs (POST /api/sync intercepté), puis lecture de la base : séance « completed » et curseur
#   avancé au jour suivant = progression sauvegardée.
# - Le serveur et le dossier temporaire sont supprimés à la sortie.
set -u
WEB="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$WEB" || exit 1
TMP=$(mktemp -d -t programme-ui.XXXXXX)
for f in data/chess-trainer.db data/chess-trainer.db-wal; do [ -f "$f" ] && cp "$f" "$TMP/"; done
DB="$TMP/chess-trainer.db"
PORT=3131; while fuser "$PORT/tcp" >/dev/null 2>&1; do PORT=$((PORT+1)); done
SRV=""
cleanup(){ [ -n "$SRV" ] && kill -- -"$SRV" 2>/dev/null; fuser -k "$PORT/tcp" >/dev/null 2>&1; rm -rf "$TMP"; }
trap cleanup EXIT INT TERM HUP

sql(){ node -e 'const D=require("better-sqlite3");const db=new D(process.argv[1]);const r=db.prepare(process.argv[2]);console.log(JSON.stringify(r.reader?r.all():r.run()))' "$DB" "$1"; }

DATABASE_PATH="$DB" NODE_OPTIONS=--max-old-space-size=1024 setsid npx next start -p "$PORT" > "$TMP/server.log" 2>&1 &
SRV=$!
for _ in $(seq 60); do curl -s -o /dev/null "http://localhost:$PORT/programme" && break; sleep 2; done
echo "serveur sur $PORT, base $DB"
rc=0
for day in "$@"; do
  S=${day%:*}; J=${day#*:}
  sql "update programme_state set semaine=$S, jour=$J, repetition=0, rating_offset=0 where user_id='local'" >/dev/null
  sql "delete from programme_sessions where status='in_progress'" >/dev/null
  echo "=== S${S}J${J}"
  node scripts/programme/play-day.mjs "http://localhost:$PORT" "$TMP/S${S}J${J}" || rc=1
  echo "base : $(sql "select semaine, jour from programme_state where user_id='local'") | séance : $(sql "select day_key, status, attempted, succeeded from programme_sessions where semaine=$S and jour=$J order by started_at desc limit 1")"
  st=$(sql "select semaine, jour from programme_state where user_id='local'")
  echo "$st" | grep -q "\"jour\":$((J % 7 + 1))" || { echo "ÉCHEC : curseur non avancé"; rc=1; }
done
grep -iE "error|⨯" "$TMP/server.log" | head -5
exit $rc
