// MatchLab 0.5.7 — shot-type selection and actual curved 2D trajectories.
import {technicalProfile} from './attributes.js?v=0.5.7';
const cap=(v,a,b)=>Math.max(a,Math.min(b,v));
export function chooseShot(g,player,quality,{penalty=false,freeKick=false,header=false}={}){
 const stats=technicalProfile(player);
 if(header)return {style:'header',curve:0,height:.55,power:stats.shotPower};
 if(penalty)return {style:'placed',curve:0,height:.55,power:stats.shotPower};
 const d=quality.distance,pressure=quality.nearby,angle=quality.angleFactor;
 const finesseScore=(stats.curve-68)*.020+(stats.technique-72)*.010+
  (stats.composure-75)*.008+(angle>.55?.18:0)+(d>=13&&d<=28?.20:0)-
  (pressure<2.8?.22:0);
 const powerful=stats.shotPower>=79&&d>=21;
 const finesse=freeKick?(stats.curve>=70):finesseScore>.29&&d>=8&&d<=33;
 const style=finesse?'curl':powerful?'power':'drive';
 // Spin travels perpendicular to the shot: visible in the top-down pitch.
 const curviness=style==='curl'?cap(.6+(stats.curve-60)*.05,.55,2.65):0;
 const foot=stats.preferredFoot==='left'?-1:1;
 const cross=(g.goalX(player.side)-player.x)*g.direction(player.side);
 const side=Math.sign(player.y-34)||1;
 const spin=curviness*(side*foot*g.direction(player.side));
 const height=style==='curl'?.65:style==='power'?.45:.28;
 return {style,curve:spin,height,power:stats.shotPower,technique:stats.technique};
}
export function shotPoint(f,u){
 const t=cap(u,0,1),dx=f.end.x-f.start.x,dy=f.end.y-f.start.y,len=Math.hypot(dx,dy)||1;
 const spin=(f.curve??0)*Math.sin(Math.PI*t);
 // Exactly the same legal start and end points; the arc is physically visible.
 return {x:cap(f.start.x+dx*t-dy/len*spin,-.9,105.9),
  y:cap(f.start.y+dy*t+dx/len*spin,-.9,68.9),
  height:Math.max(0,(f.height??0)*Math.sin(Math.PI*t))};
}
