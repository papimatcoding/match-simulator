import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {TEAMS,buildLineup,RATINGS_REVISION} from '../src/teams.js';
const file = path => readFileSync(new URL(path,import.meta.url),'utf8');
test('published module graph busts cached ratings from prior builds', () => {
 const version = '0.5.7';
 assert.equal(RATINGS_REVISION,'0.5.0');
 assert.match(file('../index.html'), /src\/app\.js\?v=0\.5\.7/);
 assert.match(file('../src/app.js'), /\.\/teams\.js\?v=0\.5\.7/);
 assert.match(file('../src/app.js'), /\.\/engine\.js\?v=0\.5\.7/);
 assert.match(file('../src/engine.js'), /\.\/teams\.js\?v=0\.5\.7/);
 assert.match(file('../index.html'), /id="ratings-revision"/);
});
test('lineup screen data uses footballer-specific values, not team OVR or shirt',()=>{
 const city=buildLineup(TEAMS.find(t=>t.id==='mancity'),0);
 const barca=buildLineup(TEAMS.find(t=>t.id==='barca'),1);
 const rating=(team,name)=>team.find(p=>p.name===name)?.rating;
 assert.equal(rating(city,'Erling Haaland'),91);
 assert.equal(rating(barca,'Frenkie de Jong'),86);
 assert.equal(rating(barca,'Alejandro Balde'),82);
 assert.ok(rating(city,'Erling Haaland')>rating(barca,'Frenkie de Jong'));
});
test('LaLiga completa y escalones de calidad para pruebas',()=>{
 const laLiga=TEAMS.filter(t=>t.league==='LaLiga');
 assert.equal(laLiga.length,20);
 const ids=new Set(TEAMS.map(t=>t.id));assert.equal(ids.size,TEAMS.length);
 for(const t of laLiga){
  const eleven=buildLineup(t,0);
  assert.equal(eleven.length,11,t.id);
  assert.equal(new Set(eleven.map(x=>x.name)).size,11,t.id);
  assert.ok(eleven.every(p=>p.rating>=65&&p.rating<=95),t.id);
 }
 assert.ok(TEAMS.find(t=>t.id==='barca').rating>TEAMS.find(t=>t.id==='malaga').rating+12);
});

test('tactical presets are imported as a versioned module',()=>{
 assert.ok(file('../src/app.js').includes('tactics.js?v=0.5.7'));
 assert.ok(file('../src/engine.js').includes('tactics.js?v=0.5.7'));
 assert.ok(file('../src/engine.js').includes('roles.js?v=0.5.7'));
 assert.ok(file('../src/app.js').includes('roles.js?v=0.5.7'));
 assert.match(file('../index.html'),/id="tactic-home"/);
 assert.match(file('../index.html'),/id="live-tactic-home"/);
 assert.match(file('../index.html'),/id="ai-inspector"/);
});

test('substitution break has a visible card and its own versioned asset graph',()=>{
 assert.match(file('../index.html'),/id="sub-moment"/);
 assert.ok(file('../src/app.js').includes('subHold=2.85'));
 assert.ok(file('../src/app.js').includes('0.5.7'));
 assert.ok(file('../src/engine.js').includes('0.5.7'));
});

test('situational intelligence is loaded from versioned decision module',()=>{
 assert.ok(file('../src/engine.js').includes('decisions.js?v=0.5.7'));
 assert.ok(file('../index.html').includes('src/app.js?v=0.5.7'));
});

test('coordinated combination module and match statistics are visible',()=>{
 assert.ok(file('../src/engine.js').includes('combinations.js?v=0.5.7'));
 assert.ok(file('../src/engine.js').includes('collective.js?v=0.5.7'));
 assert.ok(file('../src/engine.js').includes('ball-intelligence.js?v=0.5.7'));
 assert.ok(file('../src/app.js').includes('Fase colectiva:'));
 assert.ok(file('../src/app.js').includes('Paredes iniciadas'));
 assert.ok(file('../src/app.js').includes('Paredes completadas'));
});
