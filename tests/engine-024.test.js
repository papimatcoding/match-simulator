import test from 'node:test';
import assert from 'node:assert/strict';
import {MatchEngine} from '../src/engine.js';
import {TEAMS,buildLineup,buildBench} from '../src/teams.js';

const select=id=>TEAMS.find(t=>t.id===id);
const play=(a,b,seed)=>{
 const g=new MatchEngine(select(a),select(b),seed);g.start();
 for(let i=0;i<6500&&g.status!=='finished';i++){
   if(g.status==='halftime')g.resumeHalf();
   g.update(.08);
 }
 assert.equal(g.status,'finished');
 return g;
};

test('20 LaLiga clubs have coherent starting XIs, ratings and active benches',()=>{
 const clubs=TEAMS.filter(t=>t.league==='LaLiga');
 assert.equal(clubs.length,20);
 assert.equal(new Set(TEAMS.map(t=>t.id)).size,TEAMS.length);
 for(const t of clubs){
  const xi=buildLineup(t,0),bench=buildBench(t,0);
  assert.equal(xi.length,11,t.id);
  assert.ok(bench.length>=4,t.id);
  assert.ok(xi.every(x=>x.rating>=68&&x.rating<=95),t.id);
 }
});

test('touchline passes do not leave the field by an unrelated random roll',()=>{
 const g=new MatchEngine(select('barca'),select('malaga'),17);g.start();g.restart=null;
 const p=g.teams[0][8],q=g.teams[0][7];
 p.x=76;p.y=3;q.x=86;q.y=6;
 for(let i=0;i<100;i++){
  g.ball.x=p.x;g.ball.y=p.y;g.pass(p,q);
  assert.equal(g.ball.flight.type,'pass');
  assert.ok(g.ball.flight.end.y>=0&&g.ball.flight.end.y<=68);
 }
});

test('close central striker takes a clear chance rather than repeatedly refusing',()=>{
 const g=new MatchEngine(select('barca'),select('malaga'),38);g.start();g.restart=null;
 const p=g.teams[0][9];p.x=97;p.y=34;
 for(const defender of g.teams[1].slice(1)){defender.x=60;defender.y=12+defender.i*4;}
 let decided=0;for(let k=0;k<100;k++)if(g.shouldShoot(p))decided++;
 assert.ok(decided>80,'clear chance shoots '+decided+' times');
});

test('ratings influence ball retention and favour stronger clubs over repeated fixtures',()=>{
 const g=new MatchEngine(select('barca'),select('malaga'),127);g.start();g.restart=null;
 const strong=g.teams[0][7],weak=g.teams[1][7],strongTo=g.teams[0][6],weakTo=g.teams[1][6];
 let err=[0,0];
 for(let i=0;i<250;i++){
  for(const [side,p,q] of [[0,strong,strongTo],[1,weak,weakTo]]){
   g.ball.x=p.x;g.ball.y=p.y;g.pass(p,q);
   if(g.ball.flight.interceptedBy)err[side]++;
  }
 }
 assert.deepEqual(err,[0,0],'no interception can be predetermined by a random target');
 const matches=Array.from({length:8},(_,i)=>play('barca','malaga',i*31+53));
 const homeShots=matches.reduce((n,m)=>n+m.stats[0].shots,0);
 const awayShots=matches.reduce((n,m)=>n+m.stats[1].shots,0);
 assert.ok(homeShots>awayShots,JSON.stringify({homeShots,awayShots,reason:'dominant side should create more shots over eight seeds'}));
 const totalGoals=matches.reduce((n,m)=>n+m.stats[0].goals+m.stats[1].goals,0);
 const totalCorners=matches.reduce((n,m)=>n+m.stats[0].corners+m.stats[1].corners,0);
 assert.ok(totalGoals>4&&totalGoals<52,'plausible aggregate goals');
 assert.ok(totalCorners>16&&totalCorners<96,'corners within broad calibration bounds');
});