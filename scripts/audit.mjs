// Reproducible audit: 60 full matches, same seeds/teams for every tactical preset.
// Run: npm run audit. All metrics derive from the actual match engine and its event ledger.
import assert from 'node:assert/strict';
import {TEAMS} from '../src/teams.js';
import {MatchEngine} from '../src/engine.js';
const club=id=>TEAMS.find(x=>x.id===id);
const styles=['presion','defensiva','equilibrada','tiki_taka','ofensiva'];
const round=(x,n=1)=>+x.toFixed(n);
const result={version:'0.5.2',seedFormula:'seed*157',clubs:['barca','getafe'],gamesPerTactic:12,tactics:{}};
for(const tactic of styles){
 const s={games:0,shots:0,goals:0,onTarget:0,xg:0,passes:0,completed:0,interceptions:0,regains:0,quick:0,loose:0,offsides:0,corners:0,throwIns:0,passExits:0,fouls:0,saves:0,patterns:0,patternsCompleted:0,passLength:0,progressive:0,backward:0,short:0,passAttempts:0,maxIdle:0,possession:0,shapeSamples:0,crowdedPairs:0,defensiveWidth:0,defensiveSamples:0,unphysicalPlayers:0,magneticPasses:0,illegalCompletions:0,finished:0};
 for(let seed=1;seed<=12;seed++){
  const g=new MatchEngine(club('barca'),club('getafe'),seed*157,{tactics:[tactic,'equilibrada']});
  const pass=g.pass.bind(g);
  g.pass=function(from,to,setPiece,aim){
   if(from.side===0){const length=Math.hypot(from.x-to.x,from.y-to.y),progress=(to.x-from.x)*this.direction(0);
    s.passAttempts++;s.passLength+=length;s.progressive+=progress>=10?1:0;s.backward+=progress<=-5?1:0;s.short+=length<=15?1:0}
   pass(from,to,setPiece,aim);
   if(this.ball.flight?.type==='pass'&&this.ball.flight.interceptedBy)s.magneticPasses++;
  };
  g.start();let idle=0;
  for(let tick=0;tick<7200&&g.status!=='finished';tick++){
   if(g.status==='halftime'){g.resumeHalf();idle=0;continue}
   const owner=g.ball.owner,previous={x:owner?.x,y:owner?.y};
   g.update(.08);
   if(owner&&g.ball.owner===owner&&Math.hypot(owner.x-previous.x,owner.y-previous.y)<.025)idle+=.08;else idle=0;
   s.maxIdle=Math.max(s.maxIdle,idle);
   if(g.teams.flat().some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<0||p.x>105||p.y<0||p.y>68))s.unphysicalPlayers++;
   if(tick%13===0&&!g.restart){
    s.shapeSamples++;
    const players=g.teams[0].filter(p=>p.i!==0&&!p.red);
    for(let a=0;a<players.length;a++)for(let b=a+1;b<players.length;b++)
     if(Math.hypot(players[a].x-players[b].x,players[a].y-players[b].y)<3)s.crowdedPairs++;
    if(g.ball.owner?.side===1){s.defensiveSamples++;
     s.defensiveWidth+=Math.max(...players.map(p=>p.y))-Math.min(...players.map(p=>p.y))}
   }
  }
  assert.equal(g.status,'finished',tactic+' seed '+seed);
  s.finished++;const a=g.stats[0];assert.ok(a.completed<=a.passes,'completed > attempted');
  assert.equal(g.goals.length,g.stats[0].goals+g.stats[1].goals);
  s.games++;for(const key of ['shots','goals','onTarget','xg','passes','completed','interceptions','offsides','corners','throwIns','fouls','saves'])s[key]+=a[key];
  s.regains+=g.collectiveStats[0].regains;s.quick+=g.collectiveStats[0].counterpressRecoveries;
  s.loose+=g.events.filter(e=>e.type==='loose'&&e.side===0).length;
  s.passExits+=g.events.filter(e=>e.type==='throwIn'&&e.description.includes('pase de')).length;
  s.patterns+=g.patterns[0].started;s.patternsCompleted+=g.patterns[0].completed;
  s.possession+=g.possessionPct;
 }
 result.tactics[tactic]={
  matches:s.games,shotsPerMatch:round(s.shots/s.games),goalsPerMatch:round(s.goals/s.games),
  xgPerMatch:round(s.xg/s.games,2),goalsPerXg:round(s.goals/s.xg,2),
  shotsOnTargetPct:round(100*s.onTarget/s.shots),
  passesPerMatch:round(s.passes/s.games),passCompletionPct:round(100*s.completed/s.passes),
  interceptionsPerMatch:round(s.interceptions/s.games),regainsPerMatch:round(s.regains/s.games),
  counterpressRecoveriesPct:round(100*s.quick/Math.max(1,s.regains)),
  looseBallsPerMatch:round(s.loose/s.games),offsidesPerMatch:round(s.offsides/s.games),
  cornersPerMatch:round(s.corners/s.games),throwInsPerMatch:round(s.throwIns/s.games),
  passExitsPerMatch:round(s.passExits/s.games),foulsPerMatch:round(s.fouls/s.games),
  savesPerMatch:round(s.saves/s.games),
  combinationAttemptsPerMatch:round(s.patterns/s.games),
  combinationCompletionPct:round(100*s.patternsCompleted/Math.max(1,s.patterns)),
  meanPassLengthM:round(s.passLength/s.passAttempts),
  progressivePassPct:round(100*s.progressive/s.passAttempts),
  backwardPassPct:round(100*s.backward/s.passAttempts),
  shortPassPct:round(100*s.short/s.passAttempts),
  possessionPct:round(s.possession/s.games),
  crowdedPairsPerSample:round(s.crowdedPairs/s.shapeSamples,2),
  defensiveBlockWidthM:round(s.defensiveWidth/Math.max(1,s.defensiveSamples)),
  longestCarrierIdleSeconds:round(s.maxIdle,2),
  outOfFieldPlayerSamples:s.unphysicalPlayers,
  magneticInterceptions:s.magneticPasses
 };
 assert.equal(s.unphysicalPlayers,0);
 assert.equal(s.magneticPasses,0);
 assert.ok(s.maxIdle<2.3,'stationary carrier '+tactic);
 assert.ok(s.completed/s.passes>.65&&s.completed/s.passes<.95,'pass success outside audit band '+tactic);
 assert.ok(s.loose>0,'no loose balls '+tactic);
}
console.log('MATCHLAB SPATIAL AUDIT: 60 complete seeded matches, 28+ independent metrics per tactic');
console.log(JSON.stringify(result,null,2));
