import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {TEAMS,buildLineup,RATINGS_REVISION} from '../src/teams.js';
const file = path => readFileSync(new URL(path,import.meta.url),'utf8');
test('published module graph busts cached ratings from prior builds', () => {
 const version = '0.2.3';
 assert.equal(RATINGS_REVISION,version);
 assert.match(file('../index.html'), /src\/app\.js\?v=0\.2\.3/);
 assert.match(file('../src/app.js'), /\.\/teams\.js\?v=0\.2\.3/);
 assert.match(file('../src/app.js'), /\.\/engine\.js\?v=0\.2\.3/);
 assert.match(file('../src/engine.js'), /\.\/teams\.js\?v=0\.2\.3/);
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