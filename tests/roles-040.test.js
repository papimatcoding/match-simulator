import test from 'node:test';
import assert from 'node:assert/strict';
import {TEAMS} from '../src/teams.js';
import {ROLES,eligibleRoles} from '../src/roles.js';
import {MatchEngine} from '../src/engine.js';
const club=id=>TEAMS.find(t=>t.id===id);
const match=(seed=41,tactics)=>new MatchEngine(club('barca'),club('getafe'),seed,{tactics});
const run=(g,limit=7000)=>{
 g.start();let longest=0,still=0,prev={x:g.ball.x,y:g.ball.y};
 for(let i=0;i<limit&&g.status!=='finished';i++){
  if(g.status==='halftime'){g.resumeHalf();still=0;continue}
  g.update(.08);
  if(g.ball.owner&&Math.hypot(g.ball.x-prev.x,g.ball.y-prev.y)<.02)still+=.08;
  else still=0;
  longest=Math.max(longest,still);prev={x:g.ball.x,y:g.ball.y};
 }
 assert.equal(g.status,'finished');
 assert.ok(longest<2.7,'ball carrier frozen for '+longest.toFixed(2)+'s');
 assert.equal(g.goals.length,g.stats[0].goals+g.stats[1].goals);
 return g;
};
test('16 distinct role behaviours and eligible choices by natural position',()=>{
 assert.equal(Object.keys(ROLES).length,16);
 assert.ok(eligibleRoles('ST').includes('falso_nueve'));
 assert.ok(eligibleRoles('ST').includes('delantero_avanzado'));
 assert.ok(!eligibleRoles('CB').includes('falso_nueve'));
 assert.ok(eligibleRoles('CM').includes('box_to_box'));
});
test('all 22 footballers have a functional role, focus and familiarity',()=>{
 const g=match();
 for(const team of g.teams)for(const p of team){
  assert.ok(p.aiRole&&ROLES[p.aiRole],p.name);
  assert.ok(['equilibrado','ofensivo','defensivo'].includes(p.aiFocus));
  assert.ok([0,1,2].includes(p.aiFamiliarity));
 }
 assert.equal(g.snapshot().roleCount,22);
});
test('player role can be customized without altering shirt, rating or team',()=>{
 const g=match(),p=g.teams[0][9],number=p.number,rating=p.rating;
 assert.ok(g.setPlayerRole(0,9,'delantero_avanzado','ofensivo'));
 assert.equal(p.aiRole,'delantero_avanzado');
 assert.equal(p.aiFocus,'ofensivo');
 assert.equal(p.number,number);assert.equal(p.rating,rating);
 assert.equal(g.setPlayerRole(0,9,'central_cobertura'),false);
});
test('false nine and advanced striker deliberately target different spaces',()=>{
 const g=match();g.start();g.restart=null;const p=g.teams[0][9];
 g.hold(g.teams[0][7]);g.ball.x=65;g.ball.y=34;
 g.setPlayerRole(0,9,'falso_nueve');g.movePlayers(.08);const falseX=p.fx;
 g.setPlayerRole(0,9,'delantero_avanzado');g.movePlayers(.08);const advancedX=p.fx;
 assert.ok(advancedX>falseX+8,'roles insufficiently distinct: '+falseX+', '+advancedX);
});
test('no-line-of-pass situation triggers meaningful alternative',()=>{
 const g=match();g.start();g.restart=null;
 const holder=g.teams[0][9];holder.x=100;holder.y=7;g.hold(holder);
 for(const q of g.teams[0])if(q!==holder){q.x=20;q.y=34}
 for(const q of g.teams[1])if(q.i>0){q.x=holder.x-1;q.y=holder.y+1}
 const start=g.events.length;g.decide(holder);
 assert.ok(g.ball.flight||holder.aiEscape,'must find a route out');
 assert.ok(g.events.length>start||holder.aiEscape);
});
test('tactics interact with individually selected roles',()=>{
 const a=match(91,['tiki_taka','defensiva']),b=match(91,['ofensiva','presion']);
 for(const g of [a,b]){g.start();g.restart=null;g.hold(g.teams[0][6]);}
 for(let i=0;i<35;i++){a.movePlayers(1/30);b.movePlayers(1/30)}
 assert.ok(a.teams[0].some((p,i)=>Math.hypot(p.x-b.teams[0][i].x,p.y-b.teams[0][i].y)>1));
});
test('multiple full matches retain coherent scorelines and never freeze carriers',()=>{
 const games=[];
 for(let seed=1;seed<=12;seed++)games.push(run(match(seed*91,seed%2?['tiki_taka','defensiva']:['ofensiva','presion'])));
 const shots=games.reduce((n,g)=>n+g.stats[0].shots+g.stats[1].shots,0);
 assert.ok(shots>=60,'Too few shots in twelve games: '+shots);
 for(const g of games)for(const goal of g.goals){
  assert.ok(g.rosterHistory[goal.side].some(p=>p.name===goal.scorer));
  assert.ok(!goal.penalty||!goal.assist);
 }
});
