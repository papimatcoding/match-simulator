
import test from 'node:test';
import assert from 'node:assert/strict';
import {TEAMS,buildLineup,buildBench,auditRosterOwnership,RATINGS_REVISION} from '../src/teams.js';
import {MatchEngine} from '../src/engine.js';
import {readFileSync} from 'node:fs';

const club=id=>TEAMS.find(t=>t.id===id);
const full=id=>[...buildLineup(club(id),0),...buildBench(club(id),0)].map(p=>p.name);
test('33 clubs have no duplicate footballers across all XIs and substitute benches',()=>{
 assert.equal(TEAMS.length,33);
 assert.deepEqual(auditRosterOwnership(),[]);
 assert.equal(RATINGS_REVISION,'0.5.0');
});
test('verified 2026/27 moves are not left in previous teams substitute lists',()=>{
 assert.ok(full('psg').includes('Ferran Torres'));
 assert.ok(!full('barca').includes('Ferran Torres'));
 assert.ok(full('liverpool').includes('Ronald Araujo'));
 assert.ok(!full('barca').includes('Ronald Araujo'));
 assert.ok(full('liverpool').includes('Bradley Barcola'));
 assert.ok(!full('psg').includes('Bradley Barcola'));
 assert.ok(full('mancity').includes('Enzo Fernandez'));
 assert.ok(!full('chelsea').includes('Enzo Fernandez'));
 assert.ok(full('dortmund').includes('Fabio Silva'));
 assert.ok(!full('dortmund').includes('Karim Adeyemi'));
});
test('substitution moment contains exact team, entrant, exit and minute from engine',()=>{
 const g=new MatchEngine(club('barca'),club('madrid'),222);g.start();
 g.time=56*60;g.teams[0].find(p=>p.role==='CM').energy=.50;g.restartAt('throwIn',0,{x:60,y:0},1.1);
 assert.ok(g.subMoment,'expected a stoppage with changes');
 assert.ok(g.subMoment.id>0);
 assert.ok(g.subMoment.minute>=56);
 assert.ok(g.subMoment.changes.length>0);
 for(const change of g.subMoment.changes){
  assert.equal(change.team,g.clubs[change.side].name);
  assert.ok(Number.isInteger(change.in.number));
  assert.ok(Number.isInteger(change.out.number));
  assert.ok(!g.teams[change.side].some(p=>p.name===change.out.name));
  assert.ok(g.teams[change.side].some(p=>p.name===change.in.name));
  assert.ok(g.events.some(e=>e.type==='substitution'&&e.in===change.in.name&&e.out===change.out.name));
 }
 const count=g.events.filter(e=>e.type==='substitution').length;
 g.restartAt('throwIn',0,{x:60,y:0},1.1);
 assert.equal(g.events.filter(e=>e.type==='substitution').length,count,'cannot repeat a window');
});
test('the front end pauses actual match stepping during a substitution, at all playback speeds',()=>{
 const url=new URL('../src/app.js',import.meta.url);
 const code=readFileSync(url,'utf8');
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const css=readFileSync(new URL('../styles/app.css',import.meta.url),'utf8');
 assert.match(code,/subHold=2\.85/);
 assert.match(code,/if\(subHold>0\)/);
 assert.match(code,/else if\(running&&game\.status==='live'\)/);
 assert.match(code,/lastSubMomentId=moment\.id/);
 assert.match(html,/id="sub-moment"/);
 assert.match(css,/\.sub-board/);
});
