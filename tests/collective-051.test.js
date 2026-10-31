import test from 'node:test';
import assert from 'node:assert/strict';
import {TEAMS} from '../src/teams.js';
import {MatchEngine} from '../src/engine.js';
import {pressingAssignments} from '../src/collective.js';
const club=id=>TEAMS.find(x=>x.id===id);
const make=(tactic='presion')=>{const g=new MatchEngine(club('barca'),club('getafe'),57,{tactics:[tactic,'defensiva']});g.start();g.restart=null;return g};
function turnover(g){
 for(const p of g.teams[0].slice(1)){p.x=54+(p.i%4)*3;p.y=27+(p.i%3)*5}
 const first=g.teams[0][6],rival=g.teams[1][6];
 first.x=62;first.y=34;rival.x=63;rival.y=34;
 g.hold(first);g.realTime=12;g.hold(rival);
 return {first,rival};
}
test('possession changes create timed opposing collective phases',()=>{
 const g=make(),{first}=turnover(g);
 assert.equal(g.collectivePhase(0).mode,'transicion_defensiva');
 assert.equal(g.collectivePhase(1).mode,'transicion_ofensiva');
 assert.equal(g.collectiveStats[1].regains,1);
 g.realTime+=3.3;
 assert.equal(g.collectivePhase(0).mode,'defensa_organizada');
 assert.equal(g.collectivePhase(1).mode,'ataque_organizado');
 g.hold(first);
 assert.equal(g.collectivePhase(0).mode,'transicion_ofensiva');
 assert.equal(g.collectivePhase(1).mode,'transicion_defensiva');
});
test('counterpress assigns nearby players while a low block retreats',()=>{
 const aggressive=make('presion'),low=make('defensiva');
 for(const g of [aggressive,low])turnover(g);
 const high=pressingAssignments(aggressive,0,aggressive.ball);
 const deep=pressingAssignments(low,0,low.ball);
 assert.equal(high.length,3);assert.equal(deep.length,1);
 assert.ok(high.every(p=>p.i!==0&&p.role!=='CB'));
 for(const g of [aggressive,low])g.movePlayers(.08);
 assert.ok(aggressive.teams[0].some(p=>p.aiIntent?.includes('Contrapresión')));
 assert.ok(low.teams[0].some(p=>p.aiIntent?.includes('Replegar')));
});
test('actual quick regain counts but set-piece does not',()=>{
 const g=make(),{first}=turnover(g);
 g.realTime+=.6;g.hold(first);
 assert.equal(g.collectiveStats[0].counterpressRecoveries,1);
 g.restartAt('throwIn',1,{x:52,y:0},1);
 assert.equal(g.collectivePhase(0).mode,'defensa_organizada');
 assert.equal(g.collectivePhase(1).mode,'ataque_organizado');
 assert.equal(g.collectiveStats[0].counterpressRecoveries,1);
});
test('live tactical changes alter pressing without teleportation',()=>{
 const g=make();turnover(g);assert.equal(g.collectivePressers(0).length,3);
 const before=g.teams.flat().map(p=>({p,x:p.x,y:p.y}));
 g.movePlayers(.08);
 for(const {p,x,y} of before){assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));
  assert.ok(Math.hypot(p.x-x,p.y-y)<1.3,'teleport: '+p.name)}
 g.setTactic(0,'defensiva');assert.equal(g.collectivePressers(0).length,1);
});
test('complete seeded matches preserve actions and avoid stationary possession',()=>{
 let shots=0,goals=0;
 for(let seed=1;seed<=12;seed++){
  const g=new MatchEngine(club('barca'),club('getafe'),seed*67,{tactics:[seed%2?'presion':'defensiva','equilibrada']});
  g.start();let still=0,maxStill=0,old={x:g.ball.x,y:g.ball.y};
  for(let i=0;i<7100&&g.status!=='finished';i++){
   if(g.status==='halftime'){g.resumeHalf();still=0;continue}
   g.update(.08);
   if(g.ball.owner&&Math.hypot(g.ball.x-old.x,g.ball.y-old.y)<.02)still+=.08;else still=0;
   maxStill=Math.max(maxStill,still);old={x:g.ball.x,y:g.ball.y};
  }
  assert.equal(g.status,'finished');
  assert.equal(g.goals.length,g.stats[0].goals+g.stats[1].goals);
  assert.ok(maxStill<2.3,'stalled '+maxStill);
  shots+=g.stats[0].shots+g.stats[1].shots;goals+=g.goals.length;
 }
 assert.ok(shots>45&&goals>=5);
});
