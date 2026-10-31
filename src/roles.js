// MatchLab 0.4 — actionable individual roles. Original implementation, not EA game data.
const cap=(x,a,b)=>Math.max(a,Math.min(b,x));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const ROLES={
 portero:{label:'Portero',positions:['GK'],family:'keeper'},
 portero_libero:{label:'Portero líbero',positions:['GK'],family:'keeper'},
 central_cobertura:{label:'Central cobertura',positions:['CB'],family:'back'},
 central_anticipador:{label:'Central anticipador',positions:['CB'],family:'back'},
 lateral_defensivo:{label:'Lateral defensivo',positions:['LB','RB','LWB','RWB'],family:'wideback'},
 lateral_ofensivo:{label:'Lateral ofensivo',positions:['LB','RB','LWB','RWB'],family:'wideback'},
 lateral_invertido:{label:'Lateral invertido',positions:['LB','RB','LWB','RWB'],family:'wideback'},
 pivote:{label:'Pivote de cierre',positions:['DM','CM'],family:'midfield'},
 organizador:{label:'Organizador',positions:['DM','CM','AM'],family:'midfield'},
 box_to_box:{label:'Todoterreno',positions:['CM','DM'],family:'midfield'},
 mediapunta:{label:'Mediapunta',positions:['AM','CM'],family:'midfield'},
 extremo:{label:'Extremo abierto',positions:['LW','RW'],family:'wing'},
 extremo_interior:{label:'Extremo interior',positions:['LW','RW'],family:'wing'},
 delantero_avanzado:{label:'Delantero avanzado',positions:['ST'],family:'striker'},
 falso_nueve:{label:'Falso 9',positions:['ST'],family:'striker'},
 delantero_presion:{label:'Delantero presionante',positions:['ST'],family:'striker'}
};
export const ROLE_FOCUS=['equilibrado','ofensivo','defensivo'];
export const eligibleRoles=role=>Object.entries(ROLES).filter(([,cfg])=>cfg.positions.includes(role)).map(([key])=>key);
export function defaultRole(p,club){
 const c=club?.style||'';
 if(p.role==='GK')return c==='presion'?'portero_libero':'portero';
 if(p.role==='CB')return p.i%2?'central_anticipador':'central_cobertura';
 if(['LB','RB','LWB','RWB'].includes(p.role))return c==='posesion'?'lateral_invertido':c==='bloque'?'lateral_defensivo':'lateral_ofensivo';
 if(p.role==='DM')return 'pivote';
 if(p.role==='CM')return p.i%2?'box_to_box':'organizador';
 if(p.role==='AM')return 'mediapunta';
 if(p.role==='LW'||p.role==='RW')return c==='posesion'?'extremo_interior':'extremo';
 return c==='posesion'?'falso_nueve':c==='presion'?'delantero_presion':'delantero_avanzado';
}
export function familiarity(p,key){
 const role=ROLES[key];if(!role)return 0;
 const native=role.positions.includes(p.role);
 const fit=role.family==='striker'?p.skills.shot:role.family==='wing'?p.skills.pace:
  role.family==='midfield'?p.skills.pass:role.family==='keeper'||role.family==='back'?p.skills.tackle:
  (p.skills.pace+p.skills.tackle)/2;
 const rating=p.rating||75;
 return native&&rating>=85&&fit>=82?2:native&&rating>=74&&fit>=67?1:0;
}
export function assignRole(p,key,focus='equilibrado'){
 const valid=eligibleRoles(p.role);
 if(!valid.includes(key))key=defaultRole(p,{style:'equilibrada'});
 p.aiRole=key;p.aiFocus=ROLE_FOCUS.includes(focus)?focus:'equilibrado';p.aiFamiliarity=familiarity(p,key);
 p.aiIntent='Mantener posición';p.aiReason='Inicio de la jugada';p.aiLastChoice='—';
 p.aiStalled=0;p.aiIntentAt=-1;p.aiTarget=null;
 return p;
}
const point=(x,y)=>({x:cap(x,3,102),y:cap(y,3,65)});
const minOpponent=(g,p,pos)=>g.teams[1-p.side].filter(q=>!q.red&&q.i!==0).reduce((best,q)=>Math.min(best,distance(q,pos)),30);
const goalSide=(g,p,q)=>g.direction(p.side)>0?q.x>=p.x:q.x<=p.x;
export function roleTarget(g,p,base,ball,attacking,owner){
 if(p.red)return base;
 const key=p.aiRole||defaultRole(p,g.clubs[p.side]);
 const tactic=g.tactic(p.side),dir=g.direction(p.side),dx=ball.x-p.x;
 const gain=1+(.16*(p.aiFamiliarity||0));
 const focus=p.aiFocus||'equilibrado';
 const attack=focus==='ofensivo'?1.22:focus==='defensivo'?.75:1;
 const gx=g.goalX(p.side),own=g.ownGoalX(p.side);
 let x=base.x,y=base.y,intent=attacking?'Ofrecer línea de pase':'Cerrar espacios';
 const bx=ball.x,by=ball.y;
 if(p.i===0){
  if(key==='portero_libero'&&attacking){x+=dir*4*gain;intent='Portero líbero: ofrecer salida'}
  return {...point(x,y),intent};
 }
 if(attacking){
  if(key==='lateral_invertido'){
   x+=dir*5*gain;y+=(34-y)*.68*gain;intent='Lateral invertido: crear superioridad interior';
  }else if(key==='lateral_ofensivo'){
   const winger=g.teams[p.side].find(q=>q.role===(p.role.includes('L')?'LW':'RW')&&!q.red);
   if(winger&&distance(winger,ball)<30){x=winger.x+dir*5*gain*attack;y=cap(winger.y+(winger.y<34?-8:8),3,65);intent='Doblar por fuera del extremo'}
  }else if(key==='lateral_defensivo'){
   x-=dir*10;y+=(34-y)*.12;intent='Guardar la espalda del extremo';
  }else if(key==='pivote'){
   x=bx-dir*15;y=cap(34+(by-34)*.3,10,58);intent='Proteger zona de rechace y ofrecer apoyo';
  }else if(key==='organizador'){
   x=bx-dir*(8+2*(p.i%2));y=cap(by+(p.i%2?-11:11),7,61);intent='Formar triángulo de pase';
  }else if(key==='box_to_box'){
   if(Math.abs(gx-bx)<34){x=bx+dir*8*gain*attack;y=34+(p.i%2?-9:9);intent='Llegar desde segunda línea'}
   else{x=bx-dir*10;y=by+(p.i%2?-9:9);intent='Dar apoyo por detrás'}
  }else if(key==='mediapunta'){
   x=bx+dir*(8+2*gain)*attack;y=cap(34+(by-34)*.5,8,60);intent='Recibir entre líneas';
  }else if(key==='extremo'){
   y=cap(p.anchor.y+(p.anchor.y<34?-2:2),4,64);
   x=bx+dir*(8+3*gain)*attack;intent='Fijar abierto al lateral';
  }else if(key==='extremo_interior'){
   if(Math.abs(gx-bx)<46){y=cap(34+(p.anchor.y<34?-10:10),8,60);x=bx+dir*(10+4*gain)*attack;intent='Atacar intervalo lateral-central'}
   else{y=cap(34+(p.anchor.y<34?-23:23),6,62);intent='Mantener amplitud antes de diagonal'}
  }else if(key==='falso_nueve'){
   if(Math.abs(gx-bx)<34){x=bx+dir*(9+4*gain)*attack;y=cap(34+(by-34)*.30,12,56);intent='Atacar el área tras enlazar la jugada'}
   else{x=bx-dir*(4+4*gain);y=cap(34+(by-34)*.55,9,59);intent='Bajar a recibir y liberar espacio'}
  }else if(key==='delantero_avanzado'){
   x=bx+dir*(14+3*gain)*attack;y=cap(34+(p.i%2?-3:3),11,57);intent='Romper a la espalda de centrales';
  }else if(key==='delantero_presion'){
   x=bx+dir*10*attack;y=34+(p.i%2?-6:6);intent='Atacar área y preparar contrapresión';
  }
  if(p!==owner&&['extremo','extremo_interior','delantero_avanzado','delantero_presion','box_to_box','mediapunta'].includes(key)){
   const defenders=g.teams[1-p.side].filter(q=>!q.red).map(q=>q.x*dir).sort((a,b)=>b-a);
   const line=defenders[1];
   if(line!==undefined&&x*dir>52.5){
    const wave=Math.sin(g.realTime*1.1+p.i*1.7);
    const lead=Math.min(3.3,Math.max(0,wave-.15)*4.2*tactic.runs);
    if(x*dir>line-.8+lead)x=dir*(line-.8+lead);
   }
  }
  // Keep the ball carrier in full control: instructions do not teleport them.
  if(p===owner)return {...base,intent:'Elegir acción con balón'};
 }else{
  if(key==='central_anticipador'){
   const st=g.teams[1-p.side].find(q=>q.role==='ST'&&!q.red);
   if(st&&distance(st,ball)<42){x=st.x-dir*2.8;y=st.y+(p.i%2?2:-2);intent='Vigilar delantero desde lado de portería'}
  }else if(key==='central_cobertura'){
   x=bx-dir*15;y=34+(by-34)*.38;intent='Cubrir la espalda del marcador';
  }else if(key==='pivote'||key==='lateral_defensivo'){
   x=bx-dir*12;y=(key==='pivote'?34:base.y)+(by-34)*.12;intent='Cerrar línea hacia el área';
  }else if(key==='delantero_presion'){
   x=bx-dir*2;y=by+(p.i%2?2:-2);intent='Presionar primer pase';
  }else if(key==='lateral_invertido'){
   y+=(34-y)*.25;intent='Cerrar pasillo interior';
  }
 }
 // Do not choose an unreachable long-distance target in one movement cycle.
 const target=point(x,y);
 const max=attacking?26:21,delta=distance(p,target);
 if(delta>max){target.x=p.x+(target.x-p.x)*max/delta;target.y=p.y+(target.y-p.y)*max/delta}
 const weight=p.role==='ST'?.46:['LW','RW'].includes(p.role)?.27:.22;
 return {...point(base.x*(1-weight)+target.x*weight,base.y*(1-weight)+target.y*weight),intent};
}
export function roleBonus(g,p,type){
 const key=p.aiRole,level=p.aiFamiliarity||0;
 if(type==='pass')return (['organizador','falso_nueve','mediapunta','pivote'].includes(key)?4:0)+level*1.3;
 if(type==='shot')return (['delantero_avanzado','extremo_interior','box_to_box'].includes(key)?4:0)+level*1.0;
 if(type==='defense')return (['pivote','central_anticipador','lateral_defensivo','delantero_presion'].includes(key)?3:0)+level*.8;
 return 0;
}
export function safeOutlet(g,p){
 const candidates=g.teams[p.side].filter(q=>!q.red&&q!==p&&q.i!==0);
 const dir=g.direction(p.side);
 const best=candidates.map(q=>{
  const d=distance(p,q),near=minOpponent(g,p,q);
  const backward=(q.x-p.x)*dir<0?4:0;
  const danger=near<2?20:near<4?10:0;
  const score=25-d*.48+Math.min(8,near)-danger+backward;
  return {q,score};
 }).sort((a,b)=>b.score-a.score)[0];
 return best?.q||g.keeper(p.side);
}
export function escapeDirection(g,p){
 const defenders=g.teams[1-p.side].filter(q=>q.i!==0&&!q.red);
 const dir=g.direction(p.side),candidates=[
  {x:p.x-dir*3.6,y:p.y},{x:p.x,y:p.y-5.4},{x:p.x,y:p.y+5.4},
  {x:p.x+dir*4.5,y:p.y},{x:p.x-dir*3,y:34+(p.y-34)*.72}
 ].map(c=>point(c.x,c.y));
 return candidates.map(c=>({c,space:defenders.reduce((a,d)=>Math.min(a,distance(c,d)),30)-
   (Math.abs(c.y-34)>30?5:0)+(c.x-p.x)*dir*.16})).sort((a,b)=>b.space-a.space)[0].c;
}
