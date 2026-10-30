// MatchLab 0.4.2 — contextual football decisions, separate from team/role datasets.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function isClearChance(g,p,q=g.shotQuality(p)){
 const dir=g.direction(p.side);
 if(p.i===0||(p.x-52.5)*dir<=0)return false;
 const keeper=g.keeper(1-p.side);
 return q.distance<14&&q.angleFactor>.47&&q.blockers===0&&q.nearby>2.0&&
  (!keeper||distance(keeper,p)>2.4);
}
export function passingLane(g,from,to){
 const dx=to.x-from.x,dy=to.y-from.y,d2=dx*dx+dy*dy;
 if(d2<.5)return 0;
 let free=22;
 for(const opponent of g.teams[1-from.side]){
  if(opponent.red||opponent.i===0)continue;
  const t=clamp(((opponent.x-from.x)*dx+(opponent.y-from.y)*dy)/d2,0,1);
  if(t<.08||t>.97)continue;
  free=Math.min(free,Math.hypot(opponent.x-from.x-dx*t,opponent.y-from.y-dy*t));
 }
 return free;
}
export function supportTarget(g,p,owner,current){
 if(!owner||owner.side!==p.side||owner===p||p.i===0||p.red)return null;
 const anchorSide=p.anchor.y<34?-1:1, dir=g.direction(p.side);
 const near=distance(p,owner),goalDistance=Math.abs(g.goalX(p.side)-owner.x);
 if(near>35||near<4.5)return null;
 const midfield=['CM','DM','AM'].includes(p.role);
 const winger=['LW','RW'].includes(p.role);
 if(!midfield&&!winger)return null;
 // Each flank has a different supporting lane. A winger stays wider.
 const lateral=winger?15:11;
 const x=clamp(owner.x-dir*(midfield?(p.role==='DM'?9:4):1),3,102);
 const y=clamp(owner.y+anchorSide*lateral,5,63);
 const enemy=g.nearest(1-p.side,x,y,q=>q.i!==0);
 const safeX=enemy&&Math.hypot(enemy.x-x,enemy.y-y)<4?clamp(x-dir*4,3,102):x;
 // Support only one midfielder per channel, otherwise form another crowded knot.
 if(midfield){
  const colleagues=g.teams[p.side].filter(q=>q!==owner&&q!==p&&!q.red&&['CM','DM','AM'].includes(q.role)&&((q.anchor.y<34?-1:1)===anchorSide));
  if(colleagues.some(q=>distance(q,owner)+1.5<near))return null;
 }
 const weight=winger?.25:.64;
 const result={x:current.x*(1-weight)+safeX*weight,y:current.y*(1-weight)+y*weight,
  intent:'Abrir línea de pase en '+(anchorSide<0?'carril izquierdo':'carril derecho')};
 // Once near the box, avoid dragging everyone away from the goal.
 if(goalDistance<20&&midfield){result.x=current.x*.65+result.x*.35}
 return result;
}
