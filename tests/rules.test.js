import test from 'node:test';
import assert from 'node:assert/strict';
import {TEAMS} from '../src/teams.js';
import {MatchEngine} from '../src/engine.js';
const newGame=()=>{const g=new MatchEngine(TEAMS[0],TEAMS[4],41);g.start();g.restart=null;return g};
const settle=g=>{for(let i=0;i<250&&g.ball.flight;i++)g.updateFlight(1/60)};
test('a saved on-target shot never animates behind the goal-line',()=>{
 let g=newGame(),p=g.teams[0][9];p.x=87;p.y=34;g.hold(p);let n=0;
 do{g.shoot(p);n++;if(n>100)throw Error('No save generated');}while(g.ball.flight.outcome!=='save');
 const f=g.ball.flight,goal=g.goalX(0);assert.ok((goal-f.end.x)*g.direction(0)>0);
 assert.ok(f.end.y>=31&&f.end.y<=37);settle(g);assert.equal(g.stats[0].goals,0);
});
test('throw-in is given to the opponent and is kicked from the correct touchline',()=>{
 const g=newGame(),p=g.teams[0][5];p.x=35;p.y=5;g.ball.x=p.x;g.ball.y=p.y;g.clearance(p,1);settle(g);
 assert.equal(g.restart.type,'throwIn');assert.equal(g.restart.side,1);assert.equal(g.restart.spot.y,0);
 assert.equal(g.stats[1].throwIns,1);g.executeRestart();assert.equal(g.ball.flight.type,'pass');assert.equal(g.ball.flight.setPiece,true);
});
test('a corner brings several attackers into the penalty area',()=>{
 const g=newGame();g.restartAt('corner',0,{x:105,y:0},1.3);
 const inside=g.teams[0].filter(p=>p.i>0&&p.x>88.5&&p.y>13.84&&p.y<54.16);
 assert.ok(inside.length>=4,'Only '+inside.length+' attackers in the box');
 g.executeRestart();assert.equal(g.ball.flight.type,'pass');assert.ok(g.pendingCornerHeader);
});
test('a deliberate direct free kick is a shot with no assist',()=>{
 const g=newGame(),p=g.teams[0][9];p.x=83;p.y=34;g.ball.x=83;g.ball.y=34;g.lastPass={side:0,to:p.id,from:'Fake Assist',time:g.time};g.shoot(p,false,true);
 assert.equal(g.ball.flight.type,'shot');assert.equal(g.ball.flight.assist,null);
});
test('offside: judged at pass but flagged when receiver plays it, not on throw-ins',()=>{
 const g=newGame(),from=g.teams[0][6],to=g.teams[0][9];from.x=60;from.y=34;to.x=100;to.y=34;
 for(let i=0;i<g.teams[1].length;i++)g.teams[1][i].x=90-(i%3);
 assert.equal(g.isOffside(from,to),true);g.hold(from);g.ball.x=60;g.ball.y=34;g.pass(from,to);assert.ok(g.ball.flight.offside);assert.equal(g.stats[0].offsides,0);
 settle(g);assert.equal(g.stats[0].offsides,1);assert.equal(g.restart.type,'indirect');
 g.restart=null;g.ball.x=60;g.ball.y=34;g.pass(from,to,true);assert.equal(g.ball.flight.offside,false);
});
test('substitutions happen during stoppages, preserve distinct shirt numbers and change the active XI',()=>{
 const g=newGame(),before=g.teams[0].map(p=>p.id);g.time=56*60;g.restartAt('freekick',0,{x:50,y:34},2);
 assert.equal(g.subsUsed[0],1);assert.equal(g.teams[0].length,11);
 assert.equal(new Set(g.teams[0].map(p=>p.number)).size,11);
 assert.ok(g.teams[0].some(p=>!before.includes(p.id)));
 assert.ok(g.events.some(e=>e.type==='substitution'));
});
test('halftime does not interrupt a ball flying toward goal',()=>{
 const g=newGame(),p=g.teams[0][9];p.x=89;p.y=34;g.time=2699.5;g.hold(p);g.ball.x=89;g.ball.y=34;g.shoot(p);
 g.update(1/30);assert.equal(g.status,'live');
 for(let i=0;i<200&&g.status==='live';i++)g.update(1/30);
 assert.equal(g.status,'halftime');
});