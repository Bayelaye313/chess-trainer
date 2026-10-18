#!/bin/bash
# usage: _tmp-batch-autoplay.sh <listfile> <outdir>   (lignes "id|SAN...|plies[|soft|min|max]") ; 6 en parallèle
mkdir -p "$2"
while IFS='|' read -r id l n soft mn mx; do
  [ -z "$id" ] && continue
  ( r=$(node --import tsx scripts/_tmp-autoplay.mts "$l" "$n" 16 ${soft:-none} ${mn:-0.2} ${mx:-0.8}); printf '### %s :: %s\n%s\n' "$id" "$l" "$r" > "$2/$id.txt" ) &
  while [ $(jobs -r | wc -l) -ge 6 ]; do sleep 1; done
done < "$1"
wait
cat "$2"/*.txt
