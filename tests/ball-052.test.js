import test from 'node:test';
import assert from 'node:assert/strict';
import {TEAMS} from '../src/teams.js';
import {MatchEngine} from '../src/engine.js';
import {aimPass,interceptSegment} from '../src/ball-intelligence.js';
const club=id=>TEAMS.find(x=>x.id===id);
const make=()=>{const g=new MatchEngine(club('barca'),club('getafe'),32);g.start();g.restart=null;return g};
test('poorly aimed wide pass crosses the touchline at its actual geometric intersection',()=>{
 const g=make(),p=g.teams[0][9];p.x=50;p.y=4;g.rng=()=>0;
 const aimed=aimPass(g,p,{x:50,y:4},{x:75,y:1});
 assert.equal(aimed.outOfPlay,'throwIn');
 assert.equal(aimed.end.y,0);
 assert.ok(aimed.end.x>50&&aimed.end.x<75);
});
test('interception requires a defender to touch the actual flight segment',()=>{
 const defender={x:8,y:34,skills:{defense:75},red:false,i:3};
 const g={teams:[[],[defender]],rng:()=>0};
 const hit=interceptSegment(g,{side:0},{x:0,y:34},{x:12,y:34});
 assert.equal(hit.player,defender);
 defender.y=41;
 assert.equal(interceptSegment(g,{side:0},{x:0,y:34},{x:12,y:34}),null);
});
test('normal passes are never redirected to an arbitrarily selected defender',()=>{
 const g=make(),from=g.teams[0][6],to=g.teams[0][9];
 g.hold(from);g.pass(from,to);
 const f=g.ball.flight;
 assert.equal(f.type,'pass');
 assert.equal(f.interceptedBy,undefined);
 assert.ok(Math.hypot(f.end.x-to.x,f.end.y-to.y)<10);
});
test('a ball that reaches the end without its receiver is NOT a completed pass',()=>{
 const g=make(),from=g.teams[0][6],to=g.teams[0][9];
 for(const p of g.teams[1]){p.x=101;p.y=63}
 to.x=20;to.y=15;
 g.ball.owner=null;g.ball.flight={type:'pass',side:0,from,to,start:{x:40,y:34},end:{x:55,y:34},t:0,duration:.3,setPiece:false,offside:false,outOfPlay:null};
 g.ball.x=40;g.ball.y=34;g.rng=()=>.99;
 g.updateFlight(.3);
 assert.equal(g.stats[0].completed,0);
 assert.equal(g.events.at(-1).type,'loose');
});
test('a controlled pass increments completed passes once and preserves the carrier',()=>{
 const g=make(),from=g.teams[0][6],to=g.teams[0][9];
 for(const p of g.teams[1]){p.x=101;p.y=63}
 to.x=55;to.y=34;g.ball.owner=null;
 g.ball.flight={type:'pass',side:0,from,to,start:{x:40,y:34},end:{x:55,y:34},t:0,duration:.3,setPiece:false,offside:false,outOfPlay:null};
 g.ball.x=40;g.ball.y=34;g.rng=()=>.99;
 g.updateFlight(.3);
 assert.equal(g.stats[0].completed,1);
 assert.equal(g.ball.owner,to);
});
test('pressure has a physical maximum sprint speed',()=>{
 const g=make();g.setTactic(0,'presion');
 const a=g.teams[0][6],b=g.teams[1][6];a.x=62;a.y=34;b.x=63;b.y=34;
 g.hold(a);g.realTime=12;g.hold(b);
 const pressers=g.collectivePressers(0),before=pressers.map(p=>({p,x:p.x,y:p.y}));
 g.movePlayers(.08);
 for(const {p,x,y} of before)assert.ok(Math.hypot(p.x-x,p.y-y)<=6.71*.08,'unphysical presser '+p.name);
});
