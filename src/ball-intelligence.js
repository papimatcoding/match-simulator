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
 const dx=wanted.x-start.x,dy=wanted.y-start.y,edges=[];
 if(dx>0&&wanted.x>105)edges.push({t:(105-start.x)/dx,type:'goalLine'});
 if(dx<0&&wanted.x<0)edges.push({t:(0-start.x)/dx,type:'goalLine'});
 if(dy>0&&wanted.y>68)edges.push({t:(68-start.y)/dy,type:'throwIn'});
 if(dy<0&&wanted.y<0)edges.push({t:(0-start.y)/dy,type:'throwIn'});
 const first=edges.filter(e=>e.t>=0&&e.t<=1).sort((a,b)=>a.t-b.t)[0];
 if(first)return {end:{x:cap(start.x+dx*first.t,0,105),y:cap(start.y+dy*first.t,0,68)},outOfPlay:first.type};
 return {end:{x:cap(wanted.x,0,105),y:cap(wanted.y,0,68)},outOfPlay:null};
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
