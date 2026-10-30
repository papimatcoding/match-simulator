import test from 'node:test';
import assert from 'node:assert/strict';
import {TEAMS} from '../src/teams.js';
import {TACTICS,defaultTactic,tacticalState} from '../src/tactics.js';
import {MatchEngine} from '../src/engine.js';

const club=id=>TEAMS.find(t=>t.id===id);
const game=(seed=12,tactics)=>new MatchEngine(club('barca'),club('getafe'),seed,{tactics});
const play=(seed,tactics)=>{const m=game(seed,tactics);m.start();
 for(let k=0;k<7000&&m.status!=='finished';k++){if(m.status==='halftime')m.resumeHalf();m.update(.08)}
 assert.equal(m.status,'finished','match must finish');return m;
};

test('five genuinely distinct tactical identities have grounded default clubs',()=>{
 assert.deepEqual(Object.keys(TACTICS).sort(),['defensiva','equilibrada','ofensiva','presion','tiki_taka']);
 assert.equal(defaultTactic(club('barca')),'tiki_taka');
 assert.equal(defaultTactic(club('getafe')),'defensiva');
 assert.equal(defaultTactic(club('arsenal')),'tiki_taka');
 assert.equal(defaultTactic(club('bayern')),'presion');
 assert.ok(TACTICS.presion.press>TACTICS.defensiva.press);
 assert.ok(TACTICS.ofensiva.runs>TACTICS.defensiva.runs);
 assert.ok(TACTICS.tiki_taka.direct<TACTICS.ofensiva.direct);
});

test('team tactics can be selected separately and updated live',()=>{
 const g=game(45,['presion','equilibrada']);assert.deepEqual(g.tactics,['presion','equilibrada']);
 assert.equal(g.tactic(0).key,'presion');assert.ok(g.setTactic(0,'defensiva'));
 assert.equal(g.tactic(0).key,'defensiva');assert.equal(g.setTactic(0,'nonexistent'),false);
 assert.ok(g.events.some(e=>e.type==='tactic'));
});

test('teams adapt to score in final minutes rather than ignore match context',()=>{
 const g=game();g.time=76*60;g.stats[0].goals=0;g.stats[1].goals=1;
 const urgent=g.tactic(0);assert.equal(urgent.phase,'buscando remontada');
 assert.ok(urgent.press>TACTICS.tiki_taka.press);
 assert.ok(urgent.runs>TACTICS.tiki_taka.runs);
 g.time=80*60;const protecting=g.tactic(1);
 assert.equal(protecting.phase,'protegiendo ventaja');assert.ok(protecting.press<TACTICS.defensiva.press);
});

test('different tactics change positions of players without teleporting',()=>{
 const a=game(78,['ofensiva','defensiva']),b=game(78,['defensiva','ofensiva']);
 for(const m of [a,b]){m.start();m.restart=null;m.hold(m.teams[0][6]);}
 for(let i=0;i<60;i++){a.movePlayers(1/30);b.movePlayers(1/30)}
 const positionsA=a.teams[0].map(p=>p.x),positionsB=b.teams[0].map(p=>p.x);
 assert.ok(positionsA.some((x,i)=>Math.abs(x-positionsB[i])>1));
 for(const t of [a,b])for(const team of t.teams)for(const p of team){
  assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));
  assert.ok(p.x>=1&&p.x<=104&&p.y>=1&&p.y<=67);
 }
});

test('corner takers do not always seek the same striker and headers can be attempted',()=>{
 const seen=new Set();
 for(let seed=1;seed<=16;seed++){
  const g=game(seed);g.start();g.restartAt('corner',0,{x:105,y:0},0.1);g.executeRestart();
  assert.equal(g.ball.flight.type,'pass');seen.add(g.ball.flight.to.role);
  assert.ok(['ST','CB','AM','CM'].includes(g.ball.flight.to.role));
 }
 assert.ok(seen.size>=2,'corner target should vary beyond the striker');
});

test('collective match outputs remain grounded in real actions and ledger',()=>{
 let matchCount=0,otherScorers=0,goals=0;
 for(let seed=1;seed<=16;seed++){
  const g=play(seed*147,seed%2?['tiki_taka','defensiva']:['ofensiva','presion']);matchCount++;
  assert.equal(g.goals.length,g.stats[0].goals+g.stats[1].goals);
  assert.ok(g.events.every(x=>typeof x.description==='string'));
  for(const o of g.goals){
   assert.ok(g.rosterHistory[o.side].some(x=>x.name===o.scorer));
   assert.ok(!o.penalty||!o.assist);
   const p=g.rosterHistory[o.side].find(x=>x.name===o.scorer);
   if(p.role!=='ST')otherScorers++;
   goals++;
  }
 }
 assert.ok(matchCount===16&&goals>=8);
 assert.ok(otherScorers>=1,'other positions should have genuine scoring chances');
});
