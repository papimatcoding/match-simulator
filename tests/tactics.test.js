import test from 'node:test';
import assert from 'node:assert/strict';
import {MatchEngine} from '../src/engine.js';
import {TEAMS} from '../src/teams.js';
const game=(seed=84)=>{const g=new MatchEngine(TEAMS[4],TEAMS[5],seed);g.start();g.restart=null;return g};
test('shooting from central close range is much better than wild angle / long range',()=>{
 const g=game();const p=g.teams[0][9];
 p.x=94;p.y=34;let close=g.shotQuality(p);
 p.x=62;p.y=34;let far=g.shotQuality(p);
 p.x=94;p.y=63;let angle=g.shotQuality(p);
 assert.ok(close.xg>far.xg*2,`close ${close.xg}, far ${far.xg}`);
 assert.ok(close.xg>angle.xg*2,`close ${close.xg}, angled ${angle.xg}`);
 p.x=35;p.y=34;assert.equal(g.shouldShoot(p),false,'shots from midfield are not realistic');
});
test('set piece near the box creates a 9.15m defensive wall and picks up forwards',()=>{
 const g=game();g.restartAt('freekick',0,{x:82,y:29},2.4);
 const r=g.restart,dir=g.direction(0),spot=r.spot,goal=g.goalX(0);
 const wall=g.teams[1].filter(p=>p.i>=1&&p.i<=4);
 const mid={x:wall.reduce((a,p)=>a+p.x,0)/4,y:wall.reduce((a,p)=>a+p.y,0)/4};
 assert.ok(Math.abs(Math.hypot(mid.x-spot.x,mid.y-spot.y)-9.15)<.4,'wall exactly at required distance');
 assert.ok((mid.x-spot.x)*dir>0,'wall is between kicker and goal');
 const forwards=g.teams[0].filter(p=>p.i>0&&Math.abs(goal-p.x)<18&&p.id!==r.kickerId);
 assert.ok(forwards.length>=3,'multiple attacking runners in area');
 const markers=g.teams[1].filter(p=>p.i>=5&&!p.red);
 let marked=forwards.filter(p=>markers.some(d=>Math.hypot(d.x-p.x,d.y-p.y)<5));
 assert.ok(marked.length>=3,`only ${marked.length} of ${forwards.length} runners picked up`);
});
test('kickoff puts the ball at the centre, both teams in their halves, then passes it',()=>{
 const g=new MatchEngine(TEAMS[0],TEAMS[4],42);g.start();
 const r=g.restart;assert.equal(r.type,'kickoff');assert.equal(g.ball.x,52.5);assert.equal(g.ball.y,34);
 for(let side=0;side<2;side++)for(const p of g.teams[side]){
  const dir=g.direction(side), own=(p.x-52.5)*dir;
  assert.ok(own<=.01,`${p.name} is in opponent half before kickoff: ${p.x}`);
 }
 const taker=g.kicker(r);assert.ok(Math.hypot(taker.x-52.5,taker.y-34)<2);
 g.executeRestart();assert.equal(g.ball.flight?.type,'pass');
 assert.deepEqual(g.ball.flight.start,{x:52.5,y:34});
 assert.equal(g.ball.flight.setPiece,true);
 assert.ok(g.events.some(x=>x.type==='kickoff'));
});
test('a defensive line and teammates spread instead of instantly stacking on the ball',()=>{
 const g=game();const holder=g.teams[0][6];holder.x=51;holder.y=34;g.hold(holder);
 for(let i=0;i<80;i++)g.movePlayers(1/30);
 const teammates=g.teams[0].filter(p=>p.i!==0&&p!==holder);
 const unique=new Set(teammates.map(p=>`${Math.round(p.x/3)},${Math.round(p.y/3)}`));
 assert.ok(unique.size>=8,`only ${unique.size} separate support zones`);
 const opponents=g.teams[1].filter(p=>p.i!==0);
 const onTop=teammates.filter(a=>opponents.some(b=>Math.hypot(a.x-b.x,a.y-b.y)<1.3));
 assert.ok(onTop.length<3,`too many opponents stacked: ${onTop.length}`);
});