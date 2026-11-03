// MatchLab 0.5.8 — players should carry into space when nobody offers a
// useful forward pass. Movement is executed by the normal capped-speed engine.
const cap=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function progressiveCarry(g,p,pressure=20){
 if(!p||p.i===0||p.red||g.restart||g.ball.owner!==p||g.ball.flight)return null;
 const dir=g.direction(p.side),goalDist=(g.goalX(p.side)-p.x)*dir;
 if(goalDist<11||goalDist>95||pressure<3.4)return null;
 const tactic=g.tactic(p.side);
 const steps=(['ST','LW','RW','AM'].includes(p.role)?[9,7,5]:[7,5,4]);
 const side=Math.sign(34-p.y),shifts=[0,side*2.6,-side*2.2];
 const opponents=g.teams[1-p.side].filter(q=>!q.red&&q.i!==0);
 let best=null;
 for(const run of steps)for(const drift of shifts){
  const target={x:cap(p.x+dir*run,3,102),y:cap(p.y+drift,3,65)};
  const advance=(target.x-p.x)*dir;if(advance<3.5)continue;
  // Consider the full corridor, not just the destination.
  let free=20;for(const q of opponents)for(const t of [.35,.7,1]){
   const pt={x:p.x+(target.x-p.x)*t,y:p.y+(target.y-p.y)*t};
   free=Math.min(free,dist(pt,q));
  }
  const currentSpace=opponents.reduce((n,q)=>Math.min(n,dist(q,p)),20);
  const allowed=free>=3.1&&currentSpace>=3.4;
  if(!allowed)continue;
  const score=advance*.75+Math.min(free,9)*1.1-
   Math.abs(target.y-34)*.025+(tactic.key==='ofensiva'?3:0);
  if(!best||score>best.score)best={...target,advance,clearance:free,score};
 }
 return best;
}
export function carryIsPreferred(g,p,receiver,plan){
 if(!plan)return false;
 const dir=g.direction(p.side);
 const gain=receiver?(receiver.x-p.x)*dir:0;
 const rival=g.nearest(1-p.side,p.x,p.y,q=>!q.red&&q.i!==0);
 const pressure=rival?dist(rival,p):20;
 if(pressure<3.4)return false;
 const elapsed=g.realTime-(p.lastCarryTime??-100);
 if(elapsed<1.35)return false;
 // If all pass options are level/behind, take the metres offered.
 if(!receiver||gain<5)return true;
 // Under a good progressive pass, carrying is a smaller contextual option.
 return gain<13&&plan.clearance>6.3&&g.rng()<.17;
}
