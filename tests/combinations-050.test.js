import test from 'node:test';
import assert from 'node:assert/strict';
import {TEAMS} from '../src/teams.js';
import {MatchEngine} from '../src/engine.js';
import {chooseCombination,returnPassViable,coverPassingLane,combinationValid} from '../src/combinations.js';

const club=id=>TEAMS.find(x=>x.id===id);
const setup=(seed=45)=>{
 const g=new MatchEngine(club('barca'),club('getafe'),seed,{tactics:['tiki_taka','presion']});
 g.start();g.restart=null;
 const owner=g.teams[0][6],wall=g.teams[0][7],runner=g.teams[0][9];
 for(const p of g.teams[0])if(![owner,wall,runner].includes(p)){
  p.x=12;p.y=10;p.fx=p.x;p.fy=p.y;
 }
 owner.x=54;owner.y=34;wall.x=62;wall.y=29;runner.x=73;runner.y=40;
 for(const p of g.teams[1]){
  p.x=p.i===0?102:82+(p.i%4);p.y=4+p.i*5;
 }
 g.hold(owner);
 return {g,owner,wall,runner};
};
test('chooses coordinated two-pass movement with a real third-man target',()=>{
 const {g,owner}=setup();
 const c=chooseCombination(g,owner);
 assert.ok(c,'no viable combination');
 assert.notEqual(c.wall,c.runner);
 assert.ok(c.target.x>c.runner.x);
 assert.ok(c.target.y>=5&&c.target.y<=63);
 assert.equal(g.isOffside(c.wall,c.runner),false);
});
test('wall pass, visible return ball and third-man receipt produce completion event',()=>{
 const {g,owner}=setup();
 const c=chooseCombination(g,owner);
 assert.ok(c);
 g.combo=c;g.patterns[0].started++;
 g.pass(owner,c.wall);
 assert.equal(g.ball.flight.type,'pass');
 const fly=()=>{for(let i=0;i<50&&g.ball.flight;i++)g.update(.08);assert.equal(g.ball.flight,null,'ball flight never finished')};
 fly();
 assert.equal(g.ball.owner,c.wall);
 assert.equal(c.stage,'return');
 assert.ok(returnPassViable(g,c),'lane became unusable');
 g.decide(c.wall);
 assert.equal(g.ball.flight?.type,'pass');
 assert.equal(g.ball.flight?.to,c.runner);
 assert.ok(Math.hypot(g.ball.flight.end.x-c.target.x,g.ball.flight.end.y-c.target.y)<5,'real pass has bounded spatial error');
 fly();
 assert.equal(g.ball.owner,c.runner);
 assert.equal(g.patterns[0].completed,1);
 assert.equal(g.combo,null);
 assert.ok(g.events.some(e=>e.type==='combinationComplete'));
});
test('an intercepted wall pass ends the plan rather than forcing a magic return pass',()=>{
 const {g,owner}=setup(53);
 const c=chooseCombination(g,owner);assert.ok(c);
 g.combo=c;g.hold(g.teams[1][5]);
 assert.equal(g.combo,null);
 assert.ok(!combinationValid(g,c));
});
test('pressing team assigns a cover player to cut a passing lane',()=>{
 const {g,owner}=setup(55);
 const marker=g.teams[1][4];marker.x=64;marker.y=33;
 const target=coverPassingLane(g,marker,owner);
 assert.ok(target&&target.intent.includes('Cerrar pase'));
 assert.ok(target.x>=3&&target.x<=102&&target.y>=3&&target.y<=65);
 g.setTactic(1,'defensiva');
 assert.equal(coverPassingLane(g,marker,owner),null);
});
test('the same clubs play measurably different football with different tactics',()=>{
 const outcomes={tiki_taka:{started:0,completed:0},defensiva:{started:0,completed:0}};
 for(const tactic of Object.keys(outcomes)){
  for(let seed=1;seed<=10;seed++){
   const g=new MatchEngine(club('barca'),club('getafe'),seed*97,{tactics:[tactic,'defensiva']});
   g.start();
   for(let i=0;i<7200&&g.status!=='finished';i++){
    if(g.status==='halftime')g.resumeHalf();
    g.update(.08);
   }
   assert.equal(g.status,'finished');
   assert.equal(g.goals.length,g.stats[0].goals+g.stats[1].goals);
   assert.ok(g.patterns[0].completed<=g.patterns[0].started);
   outcomes[tactic].started+=g.patterns[0].started;
   outcomes[tactic].completed+=g.patterns[0].completed;
  }
 }
 assert.ok(outcomes.tiki_taka.started>outcomes.defensiva.started*2,
   JSON.stringify(outcomes));
 assert.ok(outcomes.tiki_taka.completed>outcomes.defensiva.completed,
   JSON.stringify(outcomes));
});
