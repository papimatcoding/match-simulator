import test from 'node:test';
import assert from 'node:assert/strict';
import {TEAMS} from '../src/teams.js';
import {MatchEngine} from '../src/engine.js';
import {decisionDelay,orientedFirstTouch,findSpaceRun} from '../src/tempo-control.js';

const club=id=>TEAMS.find(t=>t.id===id);
const make=(seed=54)=>{
 const g=new MatchEngine(club('barca'),club('getafe'),seed);
 g.start();g.restart=null;return g;
};
const metres=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

test('contextual delay is bounded, deterministic and reacts to nearby pressure',()=>{
 const g=make(),p=g.teams[0][6],foe=g.teams[1][6];
 p.x=50;p.y=34;g.random=()=>.31;
 for(const q of g.teams[1]){q.x=98;q.y=62}
 const clear=decisionDelay(g,p);
 foe.x=51;foe.y=34;
 const pressured=decisionDelay(g,p);
 assert.ok(pressured<clear,{pressured,clear});
 assert.ok(pressured>=.10&&clear<=.52);
 assert.equal(pressured,decisionDelay(g,p));
});

test('oriented control is a bounded direction, never an instant ball or player teleport',()=>{
 const g=make(),p=g.teams[0][6];p.x=52;p.y=24;
 for(const foe of g.teams[1]){foe.x=88;foe.y=58}
 const before={x:p.x,y:p.y},ball={x:g.ball.x,y:g.ball.y};
 const target=orientedFirstTouch(g,p);
 assert.ok(target);
 assert.ok(metres(before,target)<=4);
 assert.deepEqual({x:p.x,y:p.y},before);
 assert.deepEqual({x:g.ball.x,y:g.ball.y},ball);
 assert.ok(target.x>=3&&target.x<=102&&target.y>=3&&target.y<=65);
 assert.equal(orientedFirstTouch(g,g.teams[0][0]),null);
});

test('first touch near the edge never selects an out-of-field target',()=>{
 const g=make(),p=g.teams[0][6];
 for(const [x,y] of [[2.5,1],[101,67],[4,64],[97,3]]){
  p.x=x;p.y=y;
  const target=orientedFirstTouch(g,p);
  if(target){assert.ok(target.x>=3&&target.x<=102);
   assert.ok(target.y>=3&&target.y<=65)}
 }
});

test('new forward run seeks a free receiving channel and stays onside',()=>{
 const g=make(),owner=g.teams[0][6],p=g.teams[0].find(z=>z.role==='LW');
 owner.x=54;owner.y=32;p.x=57;p.y=14;
 for(const enemy of g.teams[1]){enemy.x=90;enemy.y=59}
 const original={x:58,y:14},run=findSpaceRun(g,p,owner,original);
 assert.ok(run,JSON.stringify({p:p.role}));
 assert.ok(run.x>original.x,'run should seek the space ahead');
 assert.ok(run.y>=3&&run.y<=65);
 assert.equal(g.isOffside(owner,{x:run.x,y:run.y,side:0}),false);
 assert.equal(run.intent.includes('carril'),true);
});

test('run does not teleport or overwrite a coordinated flight and never selects offside',()=>{
 const g=make(),owner=g.teams[0][6],p=g.teams[0].find(z=>z.role==='LW');
 owner.x=54;owner.y=34;p.x=58;p.y=12;
 for(const enemy of g.teams[1]){enemy.x=66;enemy.y=61}
 const before={x:p.x,y:p.y};
 const run=findSpaceRun(g,p,owner,{x:61,y:12});
 assert.deepEqual({x:p.x,y:p.y},before);
 if(run)assert.equal(g.isOffside(owner,{x:run.x,y:run.y,side:0}),false);
 assert.equal(findSpaceRun(g,owner,owner,{x:62,y:34}),null);
});

test('pass reception sets a physical oriented target and keeps accounting exact',()=>{
 const g=make(),from=g.teams[0][6],to=g.teams[0][9];
 from.x=40;from.y=32;to.x=55;to.y=33;
 for(const foe of g.teams[1]){foe.x=96;foe.y=60}
 const initial={x:to.x,y:to.y};
 g.ball.owner=null;g.ball.flight={type:'pass',side:0,from,to,start:{x:40,y:32},
  end:{x:55,y:33},t:0,duration:.3,setPiece:false,offside:false,outOfPlay:null};
 g.ball.x=40;g.ball.y=32;g.rng=()=>.99;
 g.updateFlight(.3);
 assert.equal(g.stats[0].completed,1);
 assert.equal(g.ball.owner,to);
 assert.ok(to.aiEscape,'receiver gets a proposed touch direction');
 assert.ok(metres(initial,to)<.2,'reception does not teleport receiver');
 assert.ok(g.decision>=.28/g.tactic(0).tempo,'receiving a pass must allow an oriented first touch');
 const before={x:to.x,y:to.y};
 g.movePlayers(.08);
 assert.ok(metres(before,to)<=.75,'oriented control must move physically');
});

test('two complete matches remain deterministic with no out-of-bounds players',()=>{
 function fixture(){
  const g=new MatchEngine(club('barca'),club('getafe'),546,{tactics:['ofensiva','equilibrada']});
  g.start();
  for(let i=0;i<7200&&g.status!=='finished';i++){
   if(g.status==='halftime'){g.resumeHalf();continue}
   g.update(.08);
   for(const p of g.teams.flat()){
    assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));
    assert.ok(p.x>=0&&p.x<=105&&p.y>=0&&p.y<=68);
   }
  }
  assert.equal(g.status,'finished');
  return {stats:g.stats,events:g.events,goals:g.goals};
 }
 assert.deepEqual(fixture(),fixture());
});
