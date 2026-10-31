import test from 'node:test';
import assert from 'node:assert/strict';
import {TEAMS} from '../src/teams.js';
import {MatchEngine} from '../src/engine.js';
import {fieldExit,defensiveLaneTargets,flightAnticipationTarget} from '../src/ball-intelligence.js';
const club=id=>TEAMS.find(t=>t.id===id);
const make=()=>{const g=new MatchEngine(club('barca'),club('getafe'),91);g.start();g.restart=null;return g};
test('diagonal flight crosses the FIRST physical field boundary',()=>{
 const e=fieldExit({x:90,y:60},{x:110,y:75});
 assert.equal(e.type,'throwIn');assert.equal(e.point.y,68);
 assert.ok(e.point.x>90&&e.point.x<105);
 assert.equal(fieldExit({x:50,y:34},{x:70,y:40}),null);
});
test('a rolling failed control crosses the sideline and awards a throw-in to the other side',()=>{
 const g=make();g.ball.owner=null;g.ball.flight=null;g.ball.x=47;g.ball.y=.2;
 g.ball.loose={vx:1,vy:-8,lastSide:0,age:0,failedId:null};
 assert.equal(g.advanceLoose(.08),true);
 assert.equal(g.stats[1].throwIns,1);
 assert.equal(g.restart.type,'throwIn');assert.equal(g.restart.side,1);
 assert.equal(g.restart.spot.y,0);assert.equal(g.ball.loose,null);
});
test('a failed first touch becomes a moving loose ball and cannot count as a completed pass',()=>{
 const g=make(),from=g.teams[0][6],to=g.teams[0][9];
 for(const p of g.teams[1]){p.x=95;p.y=62}
 to.x=65;to.y=5;g.ball.owner=null;g.ball.x=48;g.ball.y=6;g.rng=()=>0;
 g.ball.flight={type:'pass',side:0,from,to,start:{x:48,y:6},end:{x:65,y:5},t:0,duration:.4,setPiece:false,offside:false,outOfPlay:null};
 g.updateFlight(.4);
 assert.equal(g.stats[0].completed,0);
 assert.equal(g.events.at(-1).type,'loose');
 assert.ok(g.ball.loose&&g.ball.loose.vy<0);
});
test('defenders anticipate plausible receiver lanes without teleporting the ball',()=>{
 const g=make(),owner=g.teams[0][6],receiver=g.teams[0][9],marker=g.teams[1][4];
 owner.x=42;owner.y=34;receiver.x=70;receiver.y=34;
 for(const p of g.teams[0])if(p!==owner&&p!==receiver){p.x=10;p.y=10}
 for(const p of g.teams[1])if(p!==marker){p.x=95;p.y=60}
 marker.x=54;marker.y=39;
 const map=defensiveLaneTargets(g,1,owner,[]);
 const t=map.get(marker);
 assert.ok(t,'defender should read the central passing lane');
 assert.ok(Math.abs(t.y-34)<.1);
 assert.ok(t.x>42&&t.x<70);
 assert.equal(g.ball.x,52.5);
});
test('flight anticipation is restricted to physically reachable future points',()=>{
 const g=make(),p=g.teams[1][4];
 const f={type:'pass',side:0,start:{x:40,y:34},end:{x:70,y:34},t:0,duration:.8};
 p.x=55;p.y=37;const target=flightAnticipationTarget(g,p,f);
 assert.ok(target&&Math.abs(target.y-34)<.1);
 assert.equal(p.y,37,'target selection must not move the defender');
 p.y=45;assert.equal(flightAnticipationTarget(g,p,f),null);
});
test('an actual offside at pass release is penalized at involvement',()=>{
 const g=make(),from=g.teams[0][6],to=g.teams[0][9];
 from.x=55;from.y=34;to.x=81;to.y=34;
 for(const p of g.teams[1]){p.x=p.i===0?103:70;p.y=p.i===0?34:60}
 g.hold(from);g.pass(from,to);assert.equal(g.ball.flight.offside,true);
 g.updateFlight(2);
 assert.equal(g.stats[0].offsides,1);
 assert.equal(g.restart.type,'indirect');assert.equal(g.restart.side,1);
});
test('shot goals are calibrated to summed xG at a fixed location, not multiplied by accuracy twice',()=>{
 const g=make(),p=g.teams[0][9];p.x=90;p.y=34;g.ball.x=90;g.ball.y=34;
 for(const d of g.teams[1].slice(1)){d.x=55;d.y=58}
 let goals=0,xg=0;
 for(let i=0;i<1800;i++){g.shoot(p);const f=g.ball.flight;goals+=f.goalChance?1:0;xg+=f.xg;}
 assert.ok(xg>50);
 assert.ok(Math.abs(goals-xg)/xg<.12,JSON.stringify({goals,xg}));
});
