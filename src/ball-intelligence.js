// MatchLab 0.5.2 — geometric pass error and real interceptions, 2D.
const cap=(v,a,b)=>Math.max(a,Math.min(b,v));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function aimPass(g,from,start,nominal,setPiece=false){
 const length=Math.max(.1,distance(start,nominal)),ux=(nominal.x-start.x)/length,uy=(nominal.y-start.y)/length;
 const opponent=g.nearest(1-from.side,from.x,from.y,p=>p.i!==0);
 const near=opponent?distance(from,opponent):25;
 const scale=cap(1.1+(84-from.skills.pass)*.095+Math.max(0,length-12)*.095+
  (near<3?1.05:near<6?.38:0),.28,4.6)*(setPiece?.42:1)*1.3;
 const lateral=g.random(-scale,scale),longitudinal=g.random(-scale*.45,scale*.45);
 const wanted={x:nominal.x-uy*lateral+ux*longitudinal,y:nominal.y+ux*lateral+uy*longitudinal};
 const exit=fieldExit(start,wanted);
 return exit?{end:exit.point,outOfPlay:exit.type}:{end:{x:cap(wanted.x,0,105),y:cap(wanted.y,0,68)},outOfPlay:null};
}
export function interceptSegment(g,flight,previous,current){
 const dx=current.x-previous.x,dy=current.y-previous.y,d2=dx*dx+dy*dy;if(d2<.001)return null;
 const possible=g.teams[1-flight.side].filter(p=>!p.red&&p.i!==0).map(p=>{
  const t=cap(((p.x-previous.x)*dx+(p.y-previous.y)*dy)/d2,0,1);
  const point={x:previous.x+dx*t,y:previous.y+dy*t};
  return {p,point,d:distance(p,point)};
 }).filter(z=>z.d<2.05).sort((a,b)=>a.d-b.d);
 for(const z of possible){
  const chance=cap((2.25-z.d)/2.25*(.78+(z.p.skills.defense-75)*.009),.05,.82);
  if(g.rng()<chance)return {player:z.p,point:z.point};
 }
 return null;
}

export function defensiveLaneTargets(g,side,owner,pressers=[]){
 const assignments=new Map();
 if(!owner||owner.side===side)return assignments;
 const dir=g.direction(owner.side),candidates=[];
 for(const q of g.teams[owner.side]){
  if(q===owner||q.red||q.i===0)continue;
  const vx=q.x-owner.x,vy=q.y-owner.y,dd=vx*vx+vy*vy;
  if(dd<70||dd>1700||(q.x-owner.x)*dir< -3)continue;
  for(const p of g.teams[side]){
   if(p.red||p.i===0||pressers.includes(p)||['ST','LW','RW'].includes(p.role))continue;
   const t=((p.x-owner.x)*vx+(p.y-owner.y)*vy)/dd;
   if(t<.16||t>.87)continue;
   const target={x:owner.x+vx*t,y:owner.y+vy*t},gap=distance(p,target);
   if(gap>8.2||gap<.5)continue;
   const threat=(q.x-g.ownGoalX(side))*g.direction(side);
   const score=9-gap*1.3+Math.max(0,65-threat)*.015+(q.role==='ST'?1.5:0);
   candidates.push({p,q,target,score});
  }
 }
 candidates.sort((a,b)=>b.score-a.score);
 const receivers=new Set();
 for(const c of candidates){
  if(assignments.has(c.p)||receivers.has(c.q))continue;
  assignments.set(c.p,{x:c.target.x,y:c.target.y,intent:'Anticipar la línea de pase hacia '+c.q.name});
  receivers.add(c.q);
  if(assignments.size>=(g.tactic(side).press>1.2?3:2))break;
 }
 return assignments;
}
export function flightAnticipationTarget(g,p,flight){
 if(!flight||flight.type!=='pass'||flight.side===p.side||p.red||p.i===0)return null;
 const dx=flight.end.x-flight.start.x,dy=flight.end.y-flight.start.y,dd=dx*dx+dy*dy;
 if(dd<5)return null;
 const t=((p.x-flight.start.x)*dx+(p.y-flight.start.y)*dy)/dd;
 const progress=flight.t/flight.duration;
 if(t<progress+.045||t>.94)return null;
 const point={x:flight.start.x+dx*t,y:flight.start.y+dy*t};
 const gap=distance(p,point),remaining=(t-progress)*flight.duration;
 if(gap>Math.min(4.8,6.7*remaining+1.55))return null;
 return {x:point.x,y:point.y,intent:'Leer el vuelo y anticipar el pase'};
}

export function fieldExit(start,end){
 const dx=end.x-start.x,dy=end.y-start.y,hits=[];
 if(dx>0&&end.x>105)hits.push({t:(105-start.x)/dx,type:'goalLine'});
 if(dx<0&&end.x<0)hits.push({t:(0-start.x)/dx,type:'goalLine'});
 if(dy>0&&end.y>68)hits.push({t:(68-start.y)/dy,type:'throwIn'});
 if(dy<0&&end.y<0)hits.push({t:(0-start.y)/dy,type:'throwIn'});
 const hit=hits.filter(h=>h.t>=0&&h.t<=1).sort((a,b)=>a.t-b.t)[0];
 return hit?{type:hit.type,point:{x:cap(start.x+dx*hit.t,0,105),y:cap(start.y+dy*hit.t,0,68)}}:null;
}
