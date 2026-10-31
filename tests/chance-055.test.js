import test from 'node:test';
import assert from 'node:assert/strict';
import {TEAMS} from '../src/teams.js';
import {MatchEngine} from '../src/engine.js';
import {chooseCombination,reachableReturnTarget,returnPassViable} from '../src/combinations.js';
const club=id=>TEAMS.find(t=>t.id===id);
const setup=(seed=555)=>{
 const g=new MatchEngine(club('barca'),club('getafe'),seed,{tactics:['tiki_taka','equilibrada']});
 g.start();g.restart=null;
 const owner=g.teams[0][6],wall=g.teams[0][7],runner=g.teams[0][9];
 for(const p of g.teams[0])if(![owner,wall,runner].includes(p)){p.x=12;p.y=10}
 owner.x=54;owner.y=34;wall.x=62;wall.y=29;runner.x=73;runner.y=40;
 for(const p of g.teams[1]){p.x=p.i===0?102:84+(p.i%4);p.y=4+p.i*5}
 g.hold(owner);return {g,owner,wall,runner};
};
test('return aims at a spatial point the runner can actually reach during flight',()=>{
 const {g,owner}=setup();
 const c=chooseCombination(g,owner);assert.ok(c);
 g.combo=c;g.hold(c.wall);
 assert.equal(c.stage,'return');
 c.runner.x=c.wall.x+6;c.runner.y=c.wall.y+5;
 c.target={x:92,y:60};
 const point=reachableReturnTarget(g,c);
 assert.ok(point,'should select a physically attainable alternative to unreachable target');
 const flight=Math.max(.26,Math.min(1.32,Math.hypot(c.wall.x-point.x,c.wall.y-point.y)/47));
 assert.ok(Math.hypot(point.x-c.runner.x,point.y-c.runner.y)<=5.1*(flight+.13)+1);
 assert.ok(point.x<92,'must not aim for the old unrealistic target');
 assert.equal(g.isOffside(c.wall,c.runner),false);
 assert.equal(returnPassViable(g,c),true);
 assert.deepEqual(c.target,point);
});
test('blocked second pass cannot produce an imaginary combination',()=>{
 const {g,owner}=setup(556);
 const c=chooseCombination(g,owner);assert.ok(c);
 g.combo=c;g.hold(c.wall);
 for(const enemy of g.teams[1])if(enemy.i>0){enemy.x=c.runner.x;enemy.y=c.runner.y}
 assert.equal(reachableReturnTarget(g,c),null);
 assert.equal(returnPassViable(g,c),false);
});
test('canceled patterns have exactly one reason, and restarts do not double count',()=>{
 const {g,owner}=setup(557);g.combo=chooseCombination(g,owner);
 assert.ok(g.combo);g.patterns[0].started++;
 g.abortCombo('blocked');g.abortCombo('blocked');
 assert.equal(g.patterns[0].aborted.blocked,1);
 g.combo=chooseCombination(g,owner);g.patterns[0].started++;
 g.restartAt('throwIn',1,{x:70,y:0},1);
 assert.equal(g.patterns[0].aborted.restart,1);
 assert.equal(g.patterns[0].started,2);
});
test('attacking possession selects the open forward in the final third',()=>{
 const {g,owner}=setup(558);
 const forward=g.teams[0].find(p=>p.role==='ST');
 const backward=g.teams[0][4];
 owner.x=79;owner.y=34;forward.x=92;forward.y=34;
 backward.x=68;backward.y=20;
 for(const q of g.teams[0])if(q!==owner&&q!==forward&&q!==backward){q.x=34;q.y=9}
 for(const q of g.teams[1]){q.x=q.i===0?103:54;q.y=55}
 g.attackPasses=3;g.rng=()=>.5;
 const received=g.findReceiver(owner);
 assert.equal(received,forward);
 assert.ok(!g.isOffside(owner,received));
});
test('full seeded matches reconcile all completed, abandoned and started patterns',()=>{
 for(const seed of [155,355,555]){
  const g=new MatchEngine(club('barca'),club('getafe'),seed,{tactics:['tiki_taka','equilibrada']});
  g.start();
  for(let i=0;i<7200&&g.status!=='finished';i++){
   if(g.status==='halftime'){g.resumeHalf();continue}
   g.update(.08);
   assert.ok(g.teams.flat().every(p=>p.x>=0&&p.x<=105&&p.y>=0&&p.y<=68));
  }
  assert.equal(g.status,'finished');
  for(const a of g.patterns){
   const aborts=Object.values(a.aborted).reduce((n,v)=>n+v,0);
   assert.equal(a.started,a.completed+aborts,'combination accounting '+seed);
  }
  assert.equal(g.goals.length,g.stats[0].goals+g.stats[1].goals);
 }
});
