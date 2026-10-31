import test from 'node:test';
import assert from 'node:assert/strict';
import {TEAMS} from '../src/teams.js';
import {MatchEngine,MATCH_CLOCK_SCALE} from '../src/engine.js';
import {recoveryAssignments,recoveryTarget,contestedRecovery} from '../src/duels.js';
import {substitutionPlan} from '../src/coach.js';
const club=id=>TEAMS.find(t=>t.id===id);
const make=()=>{const g=new MatchEngine(club('barca'),club('getafe'),560);g.start();g.restart=null;return g};
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

test('1× runs each 45-minute half in 3–4 real minutes, with deterministic clock',()=>{
 assert.equal(MATCH_CLOCK_SCALE,13.5);
 assert.ok(2700/MATCH_CLOCK_SCALE>=180&&2700/MATCH_CLOCK_SCALE<=240);
 const g=make(),t=g.time;g.update(.08);
 assert.ok(Math.abs(g.time-t-.08*MATCH_CLOCK_SCALE)<1e-8);
});

test('two players per team pursue a rolling ball and one covers second-ball space',()=>{
 const g=make();g.ball.owner=null;g.ball.flight=null;g.ball.x=57;g.ball.y=31;
 g.ball.loose={vx:7,vy:2,lastSide:0,age:.35,failedId:null};
 const target=recoveryTarget(g);
 assert.ok(target.x>57&&target.x<64);
 const plan=recoveryAssignments(g);
 const counts=[0,1].map(side=>g.teams[side].filter(p=>plan.has(p)).length);
 assert.deepEqual(counts,[3,3]);
 for(const side of [0,1]){
  const active=g.teams[side].filter(p=>plan.get(p)?.kind==='challenge'||plan.get(p)?.kind==='second');
  assert.equal(active.length,2);
  const prev=active.map(p=>({p,x:p.x,y:p.y}));
  g.movePlayers(.08);
  for(const t of prev)assert.ok(dist(t.p,t)<=6.71*.08,'player moved without physical travel');
  break;
 }
 assert.equal(g.ball.owner,null);
});

test('the quickest reachable player can win a genuine simultaneous dispute',()=>{
 const g=make();g.ball.owner=null;g.ball.flight=null;g.ball.loose=null;g.ball.x=60;g.ball.y=34;
 for(const p of g.teams.flat()){p.x=p.side?95:10;p.y=20}
 const a=g.teams[0][4],b=g.teams[1][4];
 a.x=59.1;a.y=34;b.x=60.7;b.y=34;
 const r=contestedRecovery(g);
 assert.ok(r&&r.contested);
 assert.equal(r.candidates,2);
 assert.ok(r.travel<1.4);
 assert.ok([a,b].includes(r.winner));
 g.hold(r.winner);
 assert.equal(g.ball.owner,r.winner);
});

test('receiving a failed touch never grants the ball back instantaneously',()=>{
 const g=make(),p=g.teams[0][6];g.ball.owner=null;g.ball.flight=null;
 for(const q of g.teams.flat()){q.x=q.side?95:10;q.y=60}
 p.x=51;p.y=34;g.ball.x=51;g.ball.y=34;
 g.ball.loose={vx:0,vy:0,lastSide:0,age:.1,failedId:p.id};
 assert.equal(contestedRecovery(g),null);
 g.ball.loose.age=.25;
 assert.equal(contestedRecovery(g).winner,p);
});

test('team managers substitute independently, with no forced reciprocal change',()=>{
 const g=make();g.time=70*60;g.teams[0].find(p=>p.role==='CM').energy=.50;
 for(const q of g.teams[1])q.energy=1;
 g.restartAt('throwIn',0,{x:58,y:0},1);
 assert.equal(g.stats[0].substitutions,1);
 assert.equal(g.stats[1].substitutions,0);
 assert.equal(g.subWindowsUsed[0],1);
 assert.equal(g.subWindowsUsed[1],0);
 assert.equal(g.subMoment.changes.length,1);
});

test('five replacements and three in-play windows are hard limits; half time is free',()=>{
 const g=make();g.time=81*60;
 g.subWindowsUsed[0]=3;g.teams[0].find(p=>p.role==='CM').energy=.5;
 assert.equal(substitutionPlan(g,0).length,0);
 g.time=2700;g.half=2;g.teams[0].find(p=>p.role==='CM').card=true;
 assert.ok(substitutionPlan(g,0,{halftime:true}).length>0);
 assert.equal(g.subWindowsUsed[0],3);
 g.subsUsed[0]=5;
 assert.equal(substitutionPlan(g,0,{halftime:true}).length,0);
});

test('a dangerous attack is not cut off at exactly 45 minutes',()=>{
 const g=make(),p=g.teams[0][9];
 g.time=2699.5;p.x=89;p.y=33;g.hold(p);g.restart=null;
 g.update(.08);
 assert.equal(g.status,'live');
 assert.ok(g.time>=2700);
 assert.equal(g.pendingPeriod,1);
});

test('fatigue reduces gradually rather than everyone bottoming out before halftime',()=>{
 const g=make(),p=g.teams[0][4];const before=p.energy;
 g.movePlayers(.08);
 assert.ok(p.energy<before);
 assert.ok(before-p.energy<.0002);
});
