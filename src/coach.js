// MatchLab 0.5.6 — independent team decisions, five substitutions,
// up to three in-play windows per team; half-time is a free window.
const GROUP=p=>p.role==='GK'?'GK':['CB','LB','RB','LWB','RWB'].includes(p.role)?'DEF':
 ['DM','CM','AM'].includes(p.role)?'MID':'ATT';
const ATT=new Set(['ST','LW','RW','AM']);
export function substitutionPlan(g,side,{halftime=false}={}){
 const minute=g.time/60;
 if(minute<45||minute>=90||g.subsUsed[side]>=5)return [];
 if(!halftime&&g.subWindowsUsed[side]>=3)return [];
 if(!halftime&&minute<56)return [];
 if(!halftime&&minute-g.lastSubMinute[side]<8)return [];
 const diff=g.stats[side].goals-g.stats[1-side].goals;
 const losing=diff<0,leading=diff>0,late=minute>75;
 const team=g.teams[side],bench=g.benches[side];
 const candidates=team.filter(p=>p.i>0&&!p.red&&!p.subOn).map(p=>{
  const group=GROUP(p);
  const options=bench.filter(q=>GROUP(q)===group);
  if(!options.length)return null;
  // A player tiring, on a caution, or needed for a tactical reaction
  // becomes a candidate. Changing simply because a break exists is forbidden.
  const fatigue=(1-p.energy)*66;
  const yellow=p.card?12:0;
  const tactical=losing&&ATT.has(p.role)?(late?11:6):
   leading&&group==='MID'?(late?7:3):0;
  const ratingAdvantage=Math.max(-9,Math.min(9,options[0].rating-p.rating))*1.1;
  return {p,group,score:fatigue+yellow+tactical+ratingAdvantage};
 }).filter(Boolean).sort((a,b)=>b.score-a.score);
 const threshold=halftime?32:minute<67?24:minute<78?19:15;
 const limit=(late&&(losing||leading))?2:1;
 const changes=[],used=new Set();
 for(const c of candidates){
  if(changes.length>=limit||g.subsUsed[side]+changes.length>=5)break;
  if(c.score<threshold)continue;
  const selected=bench.map((p,i)=>({p,i})).filter(o=>!used.has(o.i)&&GROUP(o.p)===c.group)
   .sort((a,b)=>Number(b.p.role===c.p.role)-Number(a.p.role===c.p.role)||
    b.p.rating-a.p.rating)[0];
  if(!selected)continue;
  used.add(selected.i);
  changes.push({out:c.p,incoming:selected.p,reason:c.p.card?'gestionar tarjeta':
   losing&&ATT.has(c.p.role)?'buscar la remontada':leading?'proteger la ventaja':'carga física'});
 }
 return changes;
}
