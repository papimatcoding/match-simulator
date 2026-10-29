import test from 'node:test';
import assert from 'node:assert/strict';
import {TEAMS,buildLineup,buildBench} from '../src/teams.js';

const t=id=>TEAMS.find(team=>team.id===id);
const p=(id,name)=>buildLineup(t(id),0).find(player=>player.name===name);

test('official FC 27 stars preserve the correct ranking and distinct profiles',()=>{
 const haaland=p('mancity','Erling Haaland');
 const frenkie=p('barca','Frenkie de Jong');
 const balde=p('barca','Alejandro Balde');
 assert.equal(haaland.rating,91);
 assert.equal(frenkie.rating,86);
 assert.equal(balde.rating,82);
 assert.ok(haaland.rating>frenkie.rating && frenkie.rating>balde.rating);
 assert.deepEqual(haaland.skills,{pace:87,shot:92,pass:71,tackle:47});
 assert.deepEqual(frenkie.skills,{pace:77,shot:70,pass:85,tackle:77});
 assert.deepEqual(balde.skills,{pace:90,shot:52,pass:75,tackle:77});
});

test('all clubs have individual ratings unaffected by shirt number or index randomness',()=>{
 for(const team of TEAMS){
  const xi=buildLineup(team,0),bench=buildBench(team,0);
  assert.equal(xi.length,11,team.id);
  for(const player of [...xi,...bench]){
   assert.ok(player.rating>=55&&player.rating<=96,player.name);
   for(const skill of Object.values(player.skills))assert.ok(skill>=20&&skill<=99,player.name);
  }
 }
 const city=buildLineup(t('mancity'),0);
 assert.notEqual(city[9].rating,city[0].rating);
 assert.ok(city[9].skills.shot>city[9].skills.pass);
});