import {readFileSync} from 'node:fs'; import {parseMoveTree, MOVE_TREE_START_FEN} from '@/core/chess/move-tree';
for (const f of process.argv.slice(2)) { const t=readFileSync(f,'utf8'); const fen=t.match(/\[FEN "([^"]*)"\]/)?.[1]??MOVE_TREE_START_FEN; const b=t.replace(/^\[.*\]\s*$/gm,'');
let n=0; const w=(x:any)=>{for(const c of x.children){n++;w(c)}}; try { w(parseMoveTree(b,fen)); console.log(f.slice(-7), n); } catch(e) { console.log(f.slice(-7), 'ERR', String(e)); } }
