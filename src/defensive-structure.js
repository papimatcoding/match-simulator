// MatchLab 0.5.7 — assign distinct physical cover players to passing threats.
// Never changes ball state and never teleports defenders.
const cap=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function screenPassingOptions(g,defendingSide,carrier,pressers=[]){
 const screens=new Map();
 if(!carrier||carrier.red||carrier.side===defendingSide||g.restart||g.ball.flight||
  Math.abs(g.goalX(carrier.side)-carrier.x)>43)return screens;
 const attackDir=g.direction(carrier.side),dir=g.direction(defendingSide);
 const opponents=g.teams[carrier.side].filter(p=>!p.red&&p.i!==0&&p!==carrier&&
  dist(p,carrier)>5&&dist(p,carrier)<36&&(p.x-carrier.x)*attackDir>-7);
 const candidates=opponents.map(p=>{
  const front=(p.x-carrier.x)*attackDir;
  const danger=Math.max(0,105-Math.abs(g.goalX(carrier.side)-p.x));
  const score=front*.19+danger*.05+(['ST','AM','LW','RW'].includes(p.role)?5:0)-
   Math.max(0,dist(carrier,p)-24)*.25;
  return {p,score};
 }).sort((a,b)=>b.score-a.score);
 const defenders=g.teams[defendingSide].filter(p=>!p.red&&p.i!==0&&!pressers.includes(p));
 const used=new Set(),marked=new Set();
 for(const {p:receiver} of candidates.slice(0,6)){
  if(screens.size>=2)break;
  const from={x:carrier.x+(receiver.x-carrier.x)*.72,
    y:carrier.y+(receiver.y-carrier.y)*.72};
  // Keep the marker toward its own goal instead of trailing the runner.
  const target={x:cap(from.x-dir*2.5,3,102),y:cap(from.y,3,65)};
  const eligible=defenders.map(p=>({p,cost:dist(p,target)+(['CB','DM','CM'].includes(p.role)?-1.4:0)}))
   .filter(z=>!used.has(z.p)&&z.cost<17).sort((a,b)=>a.cost-b.cost);
  const pick=eligible[0];
  if(!pick||marked.has(receiver))continue;
  used.add(pick.p);marked.add(receiver);
  screens.set(pick.p,{...target,intent:'Cerrar línea de pase y cubrir a '+receiver.name,receiverId:receiver.id});
 }
 return screens;
}
