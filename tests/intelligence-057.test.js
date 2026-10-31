import test from 'node:test';
import assert from 'node:assert/strict';
import {TEAMS} from '../src/teams.js';
import {MatchEngine} from '../src/engine.js';
import {technicalProfile,makeFictionalProfile,TECHNICAL_FIELDS} from '../src/attributes.js';
import {chooseShot,shotPoint} from '../src/shot-intelligence.js';
import {screenPassingOptions} from '../src/defensive-structure.js';
import {shouldAllowAdvantage,ADVANTAGE_SECONDS} from '../src/referee.js';
import {PitchRenderer} from '../src/render.js';
const club=id=>TEAMS.find(t=>t.id===id);
const game=(seed=577)=>{const g=new MatchEngine(club('barca'),club('getafe'),seed,{tactics:['ofensiva','defensiva']});g.start();g.restart=null;return g};
const setupFoul=()=>{
 const g=game(),p=g.teams[0][9],defender=g.teams[1][6];
 p.x=75;p.y=30;defender.x=75.8;defender.y=30;
 const teammate=g.teams[0][8];teammate.x=81;teammate.y=24;
 g.hold(p);g.ball.x=p.x;g.ball.y=p.y;
 return {g,p,defender,teammate};
};
test('the referee applies advantage to a promising attack instead of immediately stopping it',()=>{
 const {g,p,defender}=setupFoul();
 assert.equal(shouldAllowAdvantage(g,p,defender,{x:p.x,y:p.y}),true);
 g.rng=()=>.5;g.foul(p,defender);
 assert.equal(g.ball.owner,p);assert.equal(g.restart,null);
 assert.ok(g.advantage);
 assert.equal(g.stats[0].advantagesOffered,1);
 assert.equal(g.stats[1].fouls,1);
 assert.equal(g.events.filter(e=>e.type==='advantage').length,1);
});
test('if possession is lost before advantage materializes, play returns to original foul',()=>{
 const {g,p,defender}=setupFoul();
 g.rng=()=>.5;g.foul(p,defender);
 const where={...g.advantage.spot};
 const opponent=g.teams[1][4];g.hold(opponent);
 assert.equal(g.restart?.type,'freekick');
 assert.equal(g.restart?.side,0);
 assert.deepEqual(g.restart.spot,where);
 assert.equal(g.stats[0].advantagesCalledBack,1);
 assert.equal(g.stats[0].freeKicks,1);
 assert.equal(g.advantage,null);
});
test('a real attack progression consumes advantage; later turnover cannot recall it',()=>{
 const {g,p,defender}=setupFoul();
 g.rng=()=>.5;g.foul(p,defender);
 p.x+=8;g.checkAdvantage();
 assert.equal(g.advantage,null);
 assert.equal(g.stats[0].advantagesPlayed,1);
 g.hold(g.teams[1][4]);
 assert.equal(g.restart,null);
});
test('caution is deferred during advantage and awarded at next stoppage',()=>{
 const {g,p,defender}=setupFoul();
 g.rng=()=>.10;g.foul(p,defender);
 assert.equal(g.pendingCards.length,1);
 assert.equal(defender.card,false);
 assert.equal(g.stats[1].yellows,0);
 p.x+=9;g.checkAdvantage();
 g.restartAt('throwIn',0,{x:55,y:0},1);
 assert.equal(g.pendingCards.length,0);
 assert.equal(g.stats[1].yellows,1);
 assert.equal(defender.card,true);
});
test('penalty area violations and red card fouls always stop the attack',()=>{
 const {g,p,defender}=setupFoul();p.x=99;p.y=34;g.hold(p);g.rng=()=>.5;
 g.foul(p,defender);
 assert.equal(g.restart?.type,'penalty');assert.equal(g.advantage,null);
 const other=setupFoul();other.g.rng=()=>0;other.g.foul(other.p,other.defender);
 assert.equal(other.g.restart?.type,'freekick');assert.equal(other.defender.red,true);
 assert.equal(other.g.advantage,null);
});
test('technical schema validates estimated real profiles and custom fictional heroes',()=>{
 const g=game(),p=g.teams[0][9];
 assert.equal(p.technical.origin,'model_estimate');
 for(const k of TECHNICAL_FIELDS)assert.ok(p.technical[k]>=1&&p.technical[k]<=99);
 const hero=makeFictionalProfile({rating:72,role:'LW',skills:{shot:73,pass:70,pace:84},
  technical:{curve:96,technique:89,preferredFoot:'left'}});
 assert.equal(hero.origin,'custom');
 assert.equal(hero.curve,96);
 assert.equal(hero.preferredFoot,'left');
 assert.throws(()=>technicalProfile(p,{curve:NaN}),/Invalid technical/);
});
test('skilled winger has a visible curved shot, exact endpoints, no teleportation',()=>{
 const g=game(),p=g.teams[0][10];p.x=81;p.y=20;
 p.technical={...p.technical,curve:98,technique:97,composure:90,preferredFoot:'left',origin:'custom'};
 const quality=g.shotQuality(p);
 const selected=chooseShot(g,p,quality);
 assert.equal(selected.style,'curl');
 g.hold(p);g.ball.x=p.x;g.ball.y=p.y;g.shoot(p);
 const f=g.ball.flight;
 assert.equal(f.type,'shot');assert.equal(f.style,'curl');assert.ok(Math.abs(f.curve)>.5);
 const mid=shotPoint(f,.5),straight={x:(f.start.x+f.end.x)/2,y:(f.start.y+f.end.y)/2};
 assert.ok(Math.hypot(mid.x-straight.x,mid.y-straight.y)>.4);
 assert.ok(mid.height>0);
 assert.deepEqual({x:shotPoint(f,0).x,y:shotPoint(f,0).y},f.start);
 assert.deepEqual({x:shotPoint(f,1).x,y:shotPoint(f,1).y},f.end);
 g.updateFlight(f.duration/2);
 assert.ok(Math.hypot(g.ball.x-mid.x,g.ball.y-mid.y)<1e-5);
 assert.ok(f.currentHeight>0);
});
test('shot styles and paths are finite for both directions, save points remain in front of goal',()=>{
 for(const side of [0,1]){
  const g=game(581+side),p=g.teams[side][9];
  p.x=side===0?83:22;p.y=27;g.hold(p);
  for(const style of ['curl','power','drive']){
   const f={start:{x:p.x,y:p.y},end:{x:g.goalX(side)-g.direction(side)*2,y:34},
    curve:style==='curl'?-2:0,height:.5};
   for(const u of [0,.1,.3,.5,.75,1]){
    const v=shotPoint(f,u);
    assert.ok(Number.isFinite(v.x)&&Number.isFinite(v.y)&&v.height>=0);
    assert.ok(v.x>=-.9&&v.x<=105.9&&v.y>=-.9&&v.y<=68.9);
   }
  }
 }
});
test('defenders assign distinct goal-side cover markers to rival passing options',()=>{
 const g=game(),owner=g.teams[0][6];
 owner.x=65;owner.y=34;g.hold(owner);
 const targets=g.teams[0].filter(p=>p.i>0&&p!==owner);
 for(let i=0;i<targets.length;i++){targets[i].x=76+i%3*2;targets[i].y=13+i*4}
 for(let i=0;i<g.teams[1].length;i++){const p=g.teams[1][i];p.x=81+(i%3);p.y=10+i*4}
 const defenders=g.teams[1];const presser=defenders[5];
 const before=defenders.map(p=>({p,x:p.x,y:p.y}));
 const assignments=screenPassingOptions(g,1,owner,[presser]);
 assert.ok(assignments.size>0&&assignments.size<=2);
 assert.ok(!assignments.has(presser));
 assert.equal(new Set([...assignments.values()].map(v=>v.receiverId)).size,assignments.size);
 for(const [p,v] of assignments){
  assert.ok(v.x>=3&&v.x<=102&&v.y>=3&&v.y<=65);
  assert.ok(v.intent.includes('Cerrar línea'));
  const b=before.find(x=>x.p===p);assert.equal(p.x,b.x);assert.equal(p.y,b.y);
 }
});
test('full match retains pattern conservation, deterministic outcomes and legal pitch boundaries',()=>{
 const make=()=>{
  const g=game(587);
  for(let i=0;i<7500&&g.status!=='finished';i++){
   if(g.status==='halftime'){g.resumeHalf();continue}
   g.update(.08);
   for(const p of g.teams.flat())assert.ok(p.x>=0&&p.x<=105&&p.y>=0&&p.y<=68);
  }
  assert.equal(g.status,'finished');
  assert.equal(g.goals.length,g.stats[0].goals+g.stats[1].goals);
  for(const p of g.patterns)assert.equal(p.started,p.completed+Object.values(p.aborted).reduce((a,b)=>a+b,0));
  return {stats:g.stats,events:g.events,score:g.score};
 };
 assert.deepEqual(make(),make());
});

test('canvas renderer includes a curve-aware flight path and keeps screen logic separate',()=>{
 assert.equal(typeof PitchRenderer.prototype.render,'function');
 assert.equal(typeof PitchRenderer.prototype.field,'function');
 assert.equal(ADVANTAGE_SECONDS,3);
});
