// MatchLab 0.5 — shared attacking intentions, never teleporting the ball or players.
// A combination is a short-lived agreement: initiator -> wall -> running teammate.
const d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const cap=(v,a,b)=>Math.max(a,Math.min(b,v));
export function combinationRate(key){
 return ({tiki_taka:.37,ofensiva:.23,presion:.15,equilibrada:.16,defensiva:.055})[key]??.14;
}
export function chooseCombination(g,owner){
 if(!owner||owner.red||owner.i===0||g.restart||g.ball.flight||g.combo)return null;
 const side=owner.side,dir=g.direction(side);
 const field=(owner.x-g.ownGoalX(side))*dir;
 if(field<30||field>84)return null; // no back-line trickery or missed tap-ins
 const friends=g.teams[side].filter(p=>!p.red&&p!==owner&&p.i>0);
 const wallCandidates=friends.filter(p=>d(p,owner)>5&&d(p,owner)<19&&
  ['CM','DM','AM','ST','LW','RW'].includes(p.role)&&
  g.passingLane(owner,p)>4&&
  !g.isOffside(owner,p));
 const sorted=wallCandidates.map(p=>{
  const free=g.nearest(1-side,p.x,p.y,q=>q.i>0);
  const pressure=free?d(free,p):14;
  const progress=(p.x-owner.x)*dir;
  return {p,score:pressure*2-d(p,owner)*.4-Math.abs(progress-1)*.5+
   (['CM','AM'].includes(p.role)?4:0)};
 }).filter(o=>o.score>4).sort((a,b)=>b.score-a.score);
 for(const {p:wall} of sorted.slice(0,3)){
  const runners=friends.filter(p=>p!==wall&&
   ['LW','RW','ST','AM','CM'].includes(p.role)&&
   d(p,wall)<32&&d(p,owner)<38&&
   (p.x-owner.x)*dir>3&&
   !g.isOffside(wall,p));
  const ordered=runners.map(p=>{
   const lane=g.passingLane(wall,p);
   const nearest=g.nearest(1-side,p.x,p.y,q=>q.i>0);
   const free=nearest?d(nearest,p):15;
   return {p,score:Math.min(12,free)*2+Math.min(12,lane)*.5+
    (p.x-owner.x)*dir*.18+(p.role==='ST'?3:0)};
  }).filter(x=>x.score>13).sort((a,b)=>b.score-a.score);
  if(!ordered.length)continue;
  const runner=ordered[0].p;
  const target={x:cap(runner.x+dir*4.3,3,102),
    y:cap(runner.y+(runner.y<34?-1.8:1.8),5,63)};
  const defenders=g.teams[1-side].filter(p=>!p.red).map(p=>p.x*dir).sort((a,b)=>b-a);
  // An intended break must stay level with the second-to-last opponent at kick time.
  if(defenders.length>=2&&target.x*dir>52.5)
   target.x=dir*Math.min(target.x*dir,defenders[1]-.9);
  if((target.x-wall.x)*dir<1||d(target,wall)>33)continue;
  return {side,initiator:owner,wall,runner,target,created:g.realTime,
   expiry:g.realTime+3.4,stage:'wall',passes:0};
 }
 return null;
}
export function combinationValid(g,combo){
 if(!combo||g.restart||g.realTime>combo.expiry)return false;
 if([combo.initiator,combo.wall,combo.runner].some(p=>p.red||!g.teams[p.side].includes(p)))return false;
 if(combo.initiator.side!==combo.wall.side||combo.wall.side!==combo.runner.side)return false;
 if(g.ball.owner&&g.ball.owner.side!==combo.side)return false;
 if(g.ball.flight&&g.ball.flight.side!==combo.side)return false;
 return true;
}
export function returnPassViable(g,combo){
 if(!combinationValid(g,combo)||g.ball.owner!==combo.wall||combo.stage!=='return')return false;
 const {wall,runner,target}=combo,dir=g.direction(combo.side);
 if(d(wall,runner)>34||d(wall,runner)<3.5)return false;
 if((target.x-wall.x)*dir<1||g.isOffside(wall,runner))return false;
 const enemy=g.nearest(1-combo.side,target.x,target.y,p=>p.i>0);
 if(enemy&&d(enemy,target)<2.2)return false;
 if(g.passingLane(wall,target)<2.6)return false;
 return true;
}
export function combinationTarget(g,p){
 const c=g.combo;
 if(!c||!combinationValid(g,c)||p!==c.runner||
  !['wall','return','flight'].includes(c.stage))return null;
 return {x:c.target.x,y:c.target.y,intent:'Ruptura coordinada hacia el espacio'};
}

export function coverPassingLane(g,marker,carrier){
 if(!carrier||marker.red||carrier.side===marker.side||marker.i===0)return null;
 const tactic=g.tactic(marker.side);
 if(tactic.press<1.08)return null;
 const dir=g.direction(carrier.side);
 const options=g.teams[carrier.side].filter(p=>!p.red&&p!==carrier&&p.i>0&&
   d(p,carrier)>6&&d(p,carrier)<29&&
   (p.x-carrier.x)*dir>-8);
 if(!options.length)return null;
 const target=options.map(p=>({
  p,score:(p.x-carrier.x)*dir*.48-d(p,carrier)*.28+
   (p.aiRole==='organizador'||p.aiRole==='delantero_avanzado'?4:0)
 })).sort((a,b)=>b.score-a.score)[0].p;
 const intended={x:carrier.x+(target.x-carrier.x)*.65,
   y:carrier.y+(target.y-carrier.y)*.65};
 if(d(intended,marker)>21)return null;
 return {x:cap(intended.x,3,102),y:cap(intended.y,3,65),
   intent:'Cerrar pase hacia '+target.name};
}
