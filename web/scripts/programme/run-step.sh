#!/bin/bash
# Lanceur des étapes lourdes du Programme 1000 Heures sur un poste à 4 Go de RAM partagé.
#
# Usage (depuis n'importe où ; le script se place dans web/) :
#   scripts/programme/run-step.sh <phase> select           # sélection (une passe sur le dump, ≈ 16 min)
#   scripts/programme/run-step.sh <phase> verify [lot]     # vérification Stockfish par lots (75 par défaut) jusqu'au bout
#   scripts/programme/run-step.sh <phase> build            # construction de src/core/programme/content/phase-<n>.json
#   scripts/programme/run-step.sh <phase> auto [lot]       # règle du minimum (coverage.mjs) : build direct si les
#                                                          # candidats vérifiés suffisent avec 50 % de marge, sinon
#                                                          # verify jusqu'au bout puis build
#   scripts/programme/run-step.sh exec <libellé> -- <commande…>   # n'importe quelle commande lourde (tsc, next build…)
#
# Reprise après interruption (rien n'est refait, verify saute les candidats déjà dans verify-0.jsonl) :
#   cd web && setsid nohup scripts/programme/run-step.sh 4 auto > data/programme/phase-4/runner.out 2>&1 &
#
# Garanties :
# - Verrou /tmp/programme.lock (PID du lanceur) : un seul lanceur à la fois ; un second attend que le
#   premier ait fini. Le verrou est retiré à la sortie, y compris sur Ctrl-C, TERM ou HUP.
# - Charge externe : si un Stockfish, un `next dev` / `next-server`, un vitest ou un autre vérificateur
#   tourne et n'appartient pas à ce lanceur, il ATTEND (contrôle toutes les 5 min, sans limite de temps
#   ni de tentatives). L'attente ne compte jamais comme un essai raté. Le `next-server` permanent de
#   l'application absentéisme (~/Desktop/absenteisme-app, port 3000) est ignoré.
# - Un seul moteur à la fois (SHARDS=1, Threads 1, Hash 64). Chaque lot tourne dans son propre groupe
#   de processus (setsid) ; à l'arrêt, le lanceur tue tout le groupe (verify-worker compris).
# - Mémoire : chaque lot sous /usr/bin/time -v, une ligne par lot dans data/programme/measures.log
#   (pic RSS, durée, swap avant/max/après). Si le swap monte de plus de 32 Mo pendant notre lot sans
#   charge externe, ou si le pic dépasse 1,2 Go, le lot est arrêté et le suivant est réduit de moitié
#   (minimum 10). Le lanceur n'abandonne jamais pour cette raison.
set -u
WEB="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$WEB" || exit 1
LOCK=/tmp/programme.lock
LOG=data/programme/measures.log
POLL=${POLL:-300}
OURPID=""

say(){ echo "$(date -Is) $*" | tee -a "$LOG"; }
swapm(){ free -m | awk '/^(Swap|Échange)/{print $3}'; }
availm(){ free -m | awk 'NR==2{print $7}'; }
mypgid=$(ps -o pgid= -p $$ | tr -d ' ')

cleanup(){
  if [ -n "$OURPID" ] && kill -0 "$OURPID" 2>/dev/null; then
    kill -TERM -- -"$OURPID" 2>/dev/null; sleep 2; kill -KILL -- -"$OURPID" 2>/dev/null
  fi
  [ -f "$LOCK" ] && [ "$(cat "$LOCK" 2>/dev/null)" = "$$" ] && rm -f "$LOCK"
}
trap cleanup EXIT
trap 'say "lanceur $$ : arrêt demandé, lot tué"; exit 130' INT TERM HUP

# Processus lourds qui ne sont pas à nous (ni au groupe du lot en cours, ni au groupe du lanceur).
external(){
  ps -eo pid=,pgid=,args= | grep -E 'stockfish|next dev|next-server|vitest|verify-worker|generate-phase' | grep -v -E 'grep|run-step\.sh' \
  | while read -r pid pgid args; do
      [ "$pgid" = "$mypgid" ] && continue
      [ -n "$OURPID" ] && [ "$pgid" = "$OURPID" ] && continue
      case "$(readlink /proc/"$pid"/cwd 2>/dev/null)" in */absenteisme-app*) continue;; esac
      echo "$pid ${args:0:150}"
    done
}

# Attente sans limite : verrou tenu par un autre lanceur vivant, ou charge externe.
acquire(){
  local n=0
  while :; do
    if [ -f "$LOCK" ]; then
      local holder; holder=$(cat "$LOCK" 2>/dev/null)
      if [ "$holder" != "$$" ] && kill -0 "$holder" 2>/dev/null; then
        n=$((n+1)); say "lanceur $$ : verrou tenu par $holder, attente $n (${POLL}s)"; sleep "$POLL"; continue
      fi
      rm -f "$LOCK"   # verrou orphelin
    fi
    ( set -o noclobber; echo $$ > "$LOCK" ) 2>/dev/null && return 0
  done
}
wait_quiet(){
  local n=0 ext
  while :; do
    ext=$(external)
    [ -z "$ext" ] && return 0
    n=$((n+1)); say "$TAG attente $n (charge externe, nouvel essai dans ${POLL}s) : $(echo "$ext" | tr '\n' ';' | cut -c1-400)"
    sleep "$POLL"
  done
}

# Lance une commande dans son groupe, sous time -v, surveille le swap. Retour : 0 ok, 1 erreur, 2 arrêt mémoire, 3 arrêt externe.
run_one(){ # $1 = fichier time, $2 = sortie, reste = commande
  local T=$1 OUTF=$2; shift 2
  local s0 a0 smax s t0 rc reason="" ext=""
  s0=$(swapm); a0=$(availm); smax=$s0
  { date -Is; free -m; ps aux --sort=-rss | head -15 | cut -c1-200; } >> "${OUTF%.*}.snap"
  setsid /usr/bin/time -v -o "$T" "$@" >> "$OUTF" 2>&1 &
  OURPID=$!; t0=$(date +%s)
  while kill -0 "$OURPID" 2>/dev/null; do
    sleep 5; s=$(swapm); [ "$s" -gt "$smax" ] && smax=$s
    if [ $((s - s0)) -gt 32 ] && [ "${NOSWAPSTOP:-0}" != 1 ]; then
      ext=$(external); reason="swap +$((s-s0))M"
      kill -TERM -- -"$OURPID" 2>/dev/null; sleep 3; kill -KILL -- -"$OURPID" 2>/dev/null; break
    fi
  done
  wait "$OURPID"; rc=$?; kill -KILL -- -"$OURPID" 2>/dev/null; OURPID=""
  RSS=$(awk -F': ' '/Maximum resident/{print $2}' "$T" 2>/dev/null); RSS=${RSS:-0}
  say "$TAG ${EXTRA:-}rc=$rc maxrss_kb=$RSS wall=$(( $(date +%s) - t0 ))s swap_before=${s0}M swap_max=${smax}M swap_after=$(swapm)M avail_before=${a0}M ${reason:+STOP:$reason}${ext:+ (externe: $(echo "$ext" | head -3 | tr '\n' ';' | cut -c1-200))}"
  [ -n "$reason" ] && [ -n "$ext" ] && return 3
  [ -n "$reason" ] || [ "$RSS" -gt 1228800 ] && return 2
  [ "$rc" -ne 0 ] && return 1
  return 0
}

acquire

if [ "${1:-}" = exec ]; then
  TAG="exec=$2"; shift 2; [ "${1:-}" = "--" ] && shift
  mkdir -p data/programme/exec
  wait_quiet
  NOSWAPSTOP=1 run_one "data/programme/exec/time-${TAG#exec=}.txt" "data/programme/exec/${TAG#exec=}.log" "$@"; exit $?
fi

PH=$1; STEP=$2; BATCH=${3:-75}
OUT=data/programme/phase-$PH; mkdir -p "$OUT"
GEN=(node --import tsx scripts/programme/generate-phase.mts "$PH")
done_count(){ cat "$OUT"/verify-*.jsonl 2>/dev/null | node -e 'const s=new Set();require("readline").createInterface({input:process.stdin}).on("line",l=>{try{s.add(JSON.parse(l).key)}catch{}}).on("close",()=>console.log(s.size))'; }

single(){ # select ou build : relancé tant qu'il est arrêté par la mémoire ou une charge externe
  TAG="phase=$PH step=$1"
  while :; do
    wait_quiet; EXTRA=""
    run_one "$OUT/time-$1.txt" "$OUT/$1.log" "${GEN[@]}" "$1"; rc=$?
    case $rc in 0) return 0;; 1) say "$TAG erreur, arrêt"; exit 1;; *) sleep 60;; esac
  done
}
verify_all(){
  TAG="phase=$PH step=verify"
  local total; total=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$OUT/verify-in.json')).length)")
  while :; do
    wait_quiet
    local d; d=$(done_count)
    [ "$d" -ge "$total" ] && { say "$TAG terminé : $d/$total vérifiés"; return 0; }
    EXTRA="batch=$BATCH done_before=$d/$total "
    LIMIT=$BATCH SHARDS=1 run_one "$OUT/time-verify.txt" "$OUT/verify.log" "${GEN[@]}" verify; rc=$?
    case $rc in
      0) ;;
      1) say "$TAG erreur du vérificateur, arrêt"; exit 1;;
      2) BATCH=$((BATCH/2)); [ "$BATCH" -lt 10 ] && BATCH=10; say "$TAG swap monté pendant notre lot : lot réduit à $BATCH"; sleep 60;;
      3) say "$TAG lot arrêté sur charge externe : attente, lot inchangé ($BATCH)";;
    esac
  done
}

case $STEP in
  select) single select;;
  build) single build;;
  verify) verify_all;;
  auto)
    if node scripts/programme/coverage.mjs "$PH" | tee -a "$LOG" | tail -1 | grep -q BUILD; then
      say "phase=$PH règle du minimum : candidats vérifiés suffisants (marge 50 %), build direct"
    else
      say "phase=$PH règle du minimum : insuffisant, vérification jusqu'au bout"; verify_all
    fi
    single build;;
  *) echo "étape inconnue : $STEP" >&2; exit 1;;
esac
