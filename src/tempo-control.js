// MatchLab 0.5.4 — decision rhythm, physically traversed first touches and purposeful runs.
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const distance = (a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const outfield = p=>p.i!==0&&!p.red;

// All delays are real-time seconds; the match clock remains independent.
export function decisionDelay(g,p){
 const rival=g.nearest(1-p.side,p.x,p.y,outfield);
 const gap=rival?distance(p,rival):20;
 let wait=g.random(.18,.40);
 if(gap<3.5)wait*=.72;
 else if(gap>8)wait*=1.12;
 if(Math.abs(g.goalX(p.side)-p.x)<20)wait*=.82;
 return clamp(wait/g.tactic(p.side).tempo,.10,.52);
}

// The preferred touch is a TARGET for the ball carrier, not a position update.
// Normal movePlayers must travel to it, retaining speed and sideline limits.
export function orientedFirstTouch(g,p){
 if(!outfield(p)||Math.abs(g.goalX(p.side)-p.x)<13)return null;
 const dir=g.direction(p.side),here={x:p.x,y:p.y};
 const nearest=point=>{
  const q=g.nearest(1-p.side,point.x,point.y,outfield);
  return q?distance(point,q):18;
 };
 const current=nearest(here);
 const moves=[
  {x:3.2*dir,y:0},{x:2.5*dir,y:-2.5},{x:2.5*dir,y:2.5},
  {x:0,y:-3.2},{x:0,y:3.2},{x:-2.2*dir,y:-1.6},{x:-2.2*dir,y:1.6}
 ];
 let best=null,bestScore=-Infinity;
 for(const move of moves){
  const target={x:here.x+move.x,y:here.y+move.y};
  if(target.x<3||target.x>102||target.y<3||target.y>65)continue;
  const free=nearest(target);
  const gain=move.x*dir;
  const sideline=Math.min(target.y,68-target.y);
  const score=Math.min(12,free)*1.35+gain*.42+
    (sideline<7?-4:0)-(free<2.4?6:0);
  if(score>bestScore){bestScore=score;best=target}
 }
 if(!best||bestScore<Math.min(12,current)*1.35-1)return null;
 return best;
}

// Run into a viable channel only if it is ahead, reachable and onside.
// The normal movement code handles acceleration, separation and ball physics.
export function findSpaceRun(g,p,owner,base){
 if(!owner||owner.side!==p.side||owner===p||!outfield(p))return null;
 if(!['AM','CM','LW','RW'].includes(p.role))return null;
 const dir=g.direction(p.side),progress=(owner.x-g.ownGoalX(p.side))*dir;
 if(progress<43||progress>89||distance(p,owner)>38)return null;
 const defenders=g.teams[1-p.side].filter(q=>!q.red);
 const line=defenders.map(q=>q.x*dir).sort((a,b)=>b-a)[1];
 const onside=worldX=>{
  let x=clamp(worldX,3,102);
  if(line!==undefined&&x*dir>52.5&&x*dir>line-.85)x=dir*(line-.85);
  return clamp(x,3,102);
 };
 const wide=['LW','RW'].includes(p.role);
 const lateral=p.anchor.y<34?-1:1;
 const candidateX=onside(owner.x+dir*(wide?15:10));
 const channels=wide?
  [p.anchor.y,clamp(owner.y+lateral*15,5,63)]:
  [clamp(owner.y+lateral*9,7,61),clamp(owner.y-lateral*11,7,61)];
 let best=null,bestScore=-Infinity;
 for(const y of channels){
  const point={x:candidateX,y};
  const travel=distance(p,point);
  if(travel>25||distance(owner,point)>33||(point.x-owner.x)*dir<2)continue;
  const defender=g.nearest(1-p.side,point.x,point.y,outfield);
  const space=defender?distance(defender,point):20;
  const friends=g.teams[p.side].filter(q=>q!==p&&q!==owner&&!q.red&&distance(q,point)<4).length;
  const score=Math.min(space,13)*1.5-travel*.2-friends*8;
  if(space<3.2||score<bestScore)continue;
  bestScore=score;best=point;
 }
 if(!best)return null;
 return {x:onside(base.x*.38+best.x*.62),
  y:clamp(base.y*.38+best.y*.62,3,65),
  intent:wide?'Atacar carril libre y ofrecer pase al espacio':'Aparecer entre líneas sin balón'};
}
