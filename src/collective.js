// MatchLab 0.5.1: shared team phases for the 2D match engine.
const cap=(v,a,b)=>Math.max(a,Math.min(b,v));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const LABELS={ataque_organizado:'Ataque organizado',transicion_ofensiva:'Transición ofensiva',
 defensa_organizada:'Defensa organizada',transicion_defensiva:'Transición defensiva'};
export function resetCollective(g,side=0){
 g.collective=[0,1].map(s=>({mode:s===side?'ataque_organizado':'defensa_organizada',since:g.realTime,spot:null}));
}
export function onPossessionChange(g,side){
 if(!g.collective)resetCollective(g,side);
 if(g.possession===side)return;
 const old=g.collective[side],spot={x:g.ball.x,y:g.ball.y};
 if(old?.mode==='transicion_defensiva'&&g.realTime-old.since<=2.8&&
  g.tactic(side).counterPress>=.55&&old.spot&&distance(old.spot,spot)<22)
  g.collectiveStats[side].counterpressRecoveries++;
 g.collectiveStats[side].regains++;
 g.collective[side]={mode:'transicion_ofensiva',since:g.realTime,spot};
 g.collective[1-side]={mode:'transicion_defensiva',since:g.realTime,spot};
}
export function getCollectivePhase(g,side){
 const onBall=g.ball.owner?.side??g.ball.flight?.side??g.restart?.side??g.possession;
 const attacking=side===onBall,previous=g.collective?.[side];
 const age=Math.max(0,g.realTime-(previous?.since??g.realTime));
 const duration=attacking?2.8:1.3+1.25*g.tactic(side).counterPress;
 const transition=!g.restart&&previous&&age<duration&&
  previous.mode===(attacking?'transicion_ofensiva':'transicion_defensiva');
 const mode=transition?previous.mode:attacking?'ataque_organizado':'defensa_organizada';
 const progress=(g.ball.x-g.ownGoalX(side))*g.direction(side);
 const zone=progress<34?'salida':progress<71?'progresión':'último tercio';
 return {mode,label:LABELS[mode],attacking,age,zone,spot:previous?.spot||null};
}
export function pressingAssignments(g,side,ball){
 const tactic=g.tactic(side),phase=getCollectivePhase(g,side);
 const sorted=g.teams[side].filter(p=>!p.red&&p.i!==0)
  .map(p=>({p,d:distance(p,ball)})).sort((a,b)=>a.d-b.d);
 const highLoss=phase.mode==='transicion_defensiva'&&tactic.counterPress>=.55&&
  phase.spot&&(phase.spot.x-g.ownGoalX(side))*g.direction(side)>36;
 if(highLoss){
  // Keep centre-backs as the last protective line.
  const close=sorted.filter(z=>z.d<21&&z.p.role!=='CB');
  if(close.length)return close.slice(0,tactic.counterPress>=.8?3:2).map(z=>z.p);
 }
 const n=phase.mode==='transicion_defensiva'&&tactic.counterPress<.55?1:
  tactic.press>=1.02?2:1;
 return sorted.slice(0,n).map(z=>z.p);
}
export function collectiveTarget(g,p,base,phase,pressers){
 const tactic=g.tactic(p.side),dir=g.direction(p.side),ball=g.ball;
 let x=base.x,y=base.y,intent=null;
 const index=pressers.indexOf(p);
 const back=['CB','LB','RB','LWB','RWB'].includes(p.role),middle=['DM','CM'].includes(p.role);
 if(phase.mode==='transicion_defensiva'){
  if(index>=0&&tactic.counterPress>=.55){
   const offsets=[{x:1.5,y:0},{x:4.2,y:-5.2},{x:7.2,y:5.2}][Math.min(index,2)];
   x=ball.x-dir*offsets.x;y=ball.y+offsets.y*(p.anchor.y<34?-1:1);
   intent=index===0?'Contrapresión: acosar al poseedor':'Contrapresión: cerrar salida y línea de pase';
  }else if(index===0){
   x=ball.x-dir*2.5;y=ball.y+(p.anchor.y<34?-1:1)*1.8;
   intent='Temporizar al rival mientras el bloque repliega';
  }else{
   x-=dir*(back?5.5:middle?6:3.2);
   if(back||middle)y=34+(y-34)*(1-.25*tactic.compactness);
   intent=back?'Replegar: proteger la espalda de la defensa':
    middle?'Replegar: cerrar pasillo central':'Replegar a posición defensiva';
  }
 }else if(phase.mode==='transicion_ofensiva'){
  if(['ST','LW','RW','AM'].includes(p.role)){
   x+=dir*(2.4+3.5*tactic.breakSpeed);
   intent='Transición: atacar el espacio libre';
  }else if(p.role==='CM'){
   x+=dir*2.6*tactic.breakSpeed;
   intent='Transición: acompañar el contraataque';
  }else if(p.role==='DM'){
   x-=dir*2.5;intent='Transición: proteger ante una nueva pérdida';
  }
  if(intent&&['ST','LW','RW','AM'].includes(p.role)){
   const line=g.teams[1-p.side].filter(q=>!q.red).map(q=>q.x*dir).sort((a,b)=>b-a)[1];
   if(line!==undefined&&x*dir>52.5)x=dir*Math.min(x*dir,line-.8);
  }
 }else if(phase.mode==='defensa_organizada'){
  if((back||middle)&&index<0){
   y=34+(y-34)*(1-.17*tactic.compactness);
   x-=dir*(middle?2.2:1.4)*tactic.compactness;
   if(tactic.compactness>.7)intent='Bloque compacto: proteger carril y distancias';
  }
 }else if(phase.mode==='ataque_organizado'&&phase.zone==='salida'){
  if(p.role==='DM'){x=x*.7+(ball.x+dir*8)*.3;intent='Salida organizada: ofrecer apoyo por dentro'}
  else if(p.role==='CB'){x=x*.78+(ball.x-dir*11)*.22;intent='Salida organizada: sostener primera línea'}
 }
 return {x:cap(x,2,103),y:cap(y,2,66),intent};
}
