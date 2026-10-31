// MatchLab 0.5.7 — referee's advantage under Law 5, 2026/27.
// A promising attack may proceed; failure within a few seconds returns
// to the original offence. Not a complete implementation of every IFAB law.
export const ADVANTAGE_SECONDS=3.0;
export function isPenaltyArea(g,side,point){
 return Math.abs(point.x-g.goalX(side))<16.5&&Math.abs(point.y-34)<20.15;
}
export function shouldAllowAdvantage(g,attacker,defender,point){
 if(!attacker||!defender||g.ball.owner!==attacker||g.restart||
  g.ball.flight||g.advantage||attacker.red||defender.red)return false;
 if(isPenaltyArea(g,attacker.side,point))return false; // award penalties
 const dir=g.direction(attacker.side);
 const advanced=(attacker.x-g.ownGoalX(attacker.side))*dir;
 if(advanced<52||advanced>102)return false;
 const options=g.teams[attacker.side].filter(p=>p!==attacker&&!p.red&&p.i>0&&
  Math.hypot(p.x-attacker.x,p.y-attacker.y)<27&&(p.x-attacker.x)*dir>-5);
 const centralChance=g.shotQuality(attacker);
 return options.length>0||centralChance.distance<27;
}
export function beginAdvantage(g,attacker,defender,point){
 const a={side:attacker.side,spot:{x:point.x,y:point.y},defenderId:defender.id,
  started:g.realTime,expires:g.realTime+ADVANTAGE_SECONDS,
  firstX:attacker.x,completed:g.stats[attacker.side].completed};
 g.advantage=a;
 g.stats[attacker.side].advantagesOffered++;
 g.add('advantage',attacker.side,`El árbitro deja seguir: ventaja para ${g.clubs[attacker.side].name}.`,
  attacker,{foulBy:defender.name});
 return a;
}
export function advantageRealized(g,a){
 if(!a)return false;
 const dir=g.direction(a.side),owner=g.ball.owner;
 if(g.stats[a.side].completed>a.completed)return true;
 if(owner?.side===a.side&&(owner.x-a.firstX)*dir>7)return true;
 if(g.ball.flight?.type==='shot'&&g.ball.flight.side===a.side)return true;
 return false;
}
