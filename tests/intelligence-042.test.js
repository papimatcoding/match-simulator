import test from 'node:test';
import assert from 'node:assert/strict';
import {TEAMS} from '../src/teams.js';
import {MatchEngine} from '../src/engine.js';
import {isClearChance,passingLane,supportTarget} from '../src/decisions.js';

const club=id=>TEAMS.find(t=>t.id===id);
const build=(seed=41)=>new MatchEngine(club('barca'),club('malaga'),seed);

test('clear 1-on-1 forces a shot, even when random decisions would reject it',()=>{
 const g=build(24);g.start();g.restart=null;
 const st=g.teams[0].find(p=>p.role==='ST');
 st.x=93;st.y=34;g.hold(st);
 for(const p of g.teams[1].slice(1)){p.x=45;p.y=15+p.i*3;}
 g.teams[1][0].x=102;g.teams[1][0].y=34;
 assert.equal(isClearChance(g,st),true);
 g.rng=()=>.999;g.decide(st);
 assert.equal(g.ball.flight?.type,'shot');
 assert.equal(g.ball.flight?.from,st);
});

test('keeper and deep defensive players never shoot goal-to-goal',()=>{
 const g=build(27);g.start();g.restart=null;
 for(const role of ['GK','CB','LB','DM']){
  const p=g.teams[0].find(x=>x.role===role);
  assert.ok(p,role);
  p.x=14;p.y=33;
  for(let k=0;k<8;k++)assert.equal(g.shouldShoot(p),false,role);
 }
});

test('trapped defender clears instead of forcing unsafe pass in own penalty area',()=>{
 const g=build(29);g.start();g.restart=null;
 const p=g.teams[0].find(x=>x.role==='CB');
 p.x=12;p.y=34;g.hold(p);
 for(const q of g.teams[1].slice(1)){q.x=13;q.y=35}
 g.findReceiver=()=>null;g.passingLane=()=>0;g.rng=()=>.8;
 g.decide(p);
 assert.equal(g.ball.flight?.type,'clearance');
 assert.equal(g.ball.flight?.from,p);
});

test('blocked corridor is unsafe even when the receiving teammate is open',()=>{
 const g=build();g.start();g.restart=null;
 const p=g.teams[0][6],q=g.teams[0][7],z=g.teams[1][3];
 p.x=45;p.y=34;q.x=65;q.y=34;z.x=55;z.y=34;
 const blocked=passingLane(g,p,q);
 z.y=54;
 const open=passingLane(g,p,q);
 assert.ok(blocked<2);assert.ok(open>blocked+5);
});

test('off-ball support changes position and intent while preserving width',()=>{
 const g=build();g.start();g.restart=null;
 const owner=g.teams[0].find(p=>p.role==='ST');
 owner.x=65;owner.y=34;g.hold(owner);
 const midfielder=g.teams[0].find(p=>p.role==='CM');
 midfielder.x=62;midfielder.y=22;
 const plan=supportTarget(g,midfielder,owner,{x:55,y:20});
 assert.ok(plan&&Number.isFinite(plan.x)&&Number.isFinite(plan.y));
 assert.ok(plan.intent.includes('línea de pase'));
 assert.ok(plan.y>5&&plan.y<63);
});

test('full matches preserve match statistics and avoid prolonged static possessions',()=>{
 let sumShots=0,goals=0,stalls=0;
 for(let seed=1;seed<=16;seed++){
  const g=new MatchEngine(club(seed%2?'barca':'betis'),club(seed%2?'malaga':'villarreal'),seed*83);
  g.start();let stationary=0,maxStationary=0,previous={x:g.ball.x,y:g.ball.y};
  for(let i=0;i<7100&&g.status!=='finished';i++){
   if(g.status==='halftime'){g.resumeHalf();stationary=0;continue}
   g.update(.08);
   if(g.ball.owner&&Math.hypot(g.ball.x-previous.x,g.ball.y-previous.y)<.02)stationary+=.08;
   else stationary=0;
   maxStationary=Math.max(maxStationary,stationary);
   previous={x:g.ball.x,y:g.ball.y};
  }
  assert.equal(g.status,'finished');
  assert.equal(g.goals.length,g.stats[0].goals+g.stats[1].goals);
  assert.ok(maxStationary<2,'static ball with owner for '+maxStationary.toFixed(2)+' s');
  sumShots+=g.stats[0].shots+g.stats[1].shots;
  goals+=g.goals.length;stalls=Math.max(stalls,maxStationary);
 }
 assert.ok(sumShots>90&&goals>=10);
});
