// MatchLab 0.5.6 — competitive, physically reachable loose-ball recovery.
// Every outfield player is eligible for the ball; the tactical plan assigns
// two challengers plus cover per side, recalculated as the ball moves.
const cap=(n,a,b)=>Math.max(a,Math.min(b,n));
const d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const eligible=p=>p&&!p.red&&p.i!==0;
const speed=p=>Math.min(6.7,5.15*(.75+p.skills.pace/300)*(.75+.25*p.energy));
export function recoveryTarget(g,lookahead=.42){
 const b=g.ball,loose=b.loose;
 if(!loose)return {x:b.x,y:b.y};
 // Rolling ball decelerates; never project it out of the pitch.
 const factor=(1-Math.exp(-1.25*lookahead))/1.25;
 return {x:cap(b.x+loose.vx*factor,2,103),y:cap(b.y+loose.vy*factor,2,66)};
}
export function recoveryAssignments(g){
 const result=new Map();
 if(g.ball.owner||g.ball.flight||g.restart)return result;
 const predicted=recoveryTarget(g),ball=g.ball;
 for(const side of [0,1]){
  const sorted=g.teams[side].filter(eligible).map(p=>{
   // Predictive ETA: fast players further away can overtake a slow nearby one.
   const reach=d(p,predicted),eta=reach/Math.max(2.5,speed(p));
   return {p,eta,reach};
  }).sort((a,b)=>a.eta-b.eta||a.reach-b.reach||a.p.i-b.p.i);
  if(!sorted.length)continue;
  // Primary + secondary challenge; other players keep their team shape.
  sorted.slice(0,2).forEach(({p},i)=>{
   const target=i===0?predicted:{x:cap(ball.x,2,103),y:cap(ball.y,2,66)};
   result.set(p,{x:target.x,y:target.y,intent:i===0?'Disputar balón dividido':'Apoyar la disputa y competir por el segundo balón',kind:i===0?'challenge':'second'});
  });
  // Cover the goal-side second ball without dragging the full defensive line.
  const third=sorted[2]?.p;
  if(third){
   const dir=g.direction(side);
   const x=cap(predicted.x-dir*5.2,2,103);
   const y=cap(predicted.y+(third.anchor.y<34?-1:1)*5.5,2,66);
   result.set(third,{x,y,intent:'Proteger zona de rechace y recuperar segunda jugada',kind:'cover'});
  }
 }
 return result;
}
export function contestedRecovery(g){
 if(g.ball.owner||g.ball.flight||g.restart)return null;
 const ball=g.ball;
 // Physically eligible players only. Being assigned is never a prerequisite.
 const candidates=g.teams.flat().filter(p=>eligible(p)&&
  (!ball.loose||ball.loose.age>.24||p.id!==ball.loose.failedId)&&
  d(p,ball)<1.40);
 if(!candidates.length)return null;
 const sides=new Set(candidates.map(p=>p.side));
 const winner=candidates.map(p=>{
  const close=d(p,ball);
  const skill=(p.skills.tackle*.36+p.skills.pass*.32+p.skills.pace*.32);
  // Proximity dominates; skill resolves nearby 50/50s rather than instant magnetism.
  return {p,score:-close*6+skill*.025+p.energy*.4+g.rng()*.22};
 }).sort((a,b)=>b.score-a.score)[0].p;
 return {winner,candidates:candidates.length,contested:sides.size>1,travel:d(winner,ball)};
}
