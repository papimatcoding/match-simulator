// MatchLab 0.5.7 — one technical attribute schema for real and fictional footballers.
// Values for existing real players are explicitly MODEL ESTIMATES, not licensed game stats.
const cap=(v,a=1,b=99)=>Math.max(a,Math.min(b,Math.round(v)));
export const TECHNICAL_FIELDS=['finishing','shotPower','curve','technique','composure'];
export function technicalProfile(player,overrides=null){
 const skills=player.skills||{},base=player.rating??70;
 const shot=skills.shot??base,pass=skills.pass??base,pace=skills.pace??base;
 const role=player.role||'CM';
 const attacking=['ST','LW','RW','AM'].includes(role);
 const estimate={
  finishing:cap(shot+(attacking?2:-3)),
  shotPower:cap(shot*.76+pace*.14+base*.1),
  curve:cap(pass*.47+shot*.38+base*.15+(role==='LW'||role==='RW'?4:0)),
  technique:cap(pass*.52+shot*.32+base*.16),
  composure:cap(base*.57+shot*.26+pass*.17)
 };
 const attrs={...estimate,...(player.technical||{}),...(overrides||{})};
 for(const k of TECHNICAL_FIELDS){
  if(!Number.isFinite(attrs[k]))throw Error('Invalid technical attribute: '+k);
  attrs[k]=cap(attrs[k]);
 }
 const foot=attrs.preferredFoot||'right';
 if(!['right','left','both'].includes(foot))throw Error('Invalid preferredFoot');
 return {...attrs,preferredFoot:foot,origin:(overrides||player.technical?.origin==='custom')?'custom':'model_estimate'};
}
export function makeFictionalProfile({rating=70,role='CM',skills={},technical={}}={}){
 const player={rating,role,skills};
 return technicalProfile(player,technical);
}
