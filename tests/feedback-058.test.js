import test from 'node:test';
import assert from 'node:assert/strict';
import {MatchEngine,MATCH_CLOCK_SCALE} from '../src/engine.js';
import {TEAMS} from '../src/teams.js';
import {progressiveCarry,carryIsPreferred} from '../src/progression.js';
import {ROLES,assignRole,familiarity,seedRoleFamiliarity} from '../src/roles.js';
import {shotPoint,chooseShot} from '../src/shot-intelligence.js';
const team=id=>TEAMS.find(t=>t.id===id);
const make=()=>{const g=new MatchEngine(team('barca'),team('getafe'),581);g.start();g.restart=null;return g};

test('a match lasts 2 real minutes per half at 1×, not 3–4 minutes',()=>{
 assert.equal(MATCH_CLOCK_SCALE,22.5);
 assert.equal(2700/MATCH_CLOCK_SCALE,120);
});
test('role familiarity belongs to the player and exact role, never blanket OVR',()=>{
 const g=make(),p=g.teams[0].find(z=>z.role==='RW');
 p.rating=99;p.roleFamiliarity={extremo_interior:1,extremo:0};
 assert.equal(familiarity(p,'extremo_interior'),1);
 assert.equal(familiarity(p,'extremo'),0);
 assignRole(p,'extremo_interior');assert.equal(p.aiFamiliarity,1);
 assignRole(p,'extremo');assert.equal(p.aiFamiliarity,0);
 p.roleFamiliarity.extremo_interior=2;
 assignRole(p,'extremo_interior');assert.equal(p.aiFamiliarity,2);
 assert.ok(!('organizador' in p.roleFamiliarity));
 assert.equal(familiarity(p,'organizador'),0);
 const a=seedRoleFamiliarity('Ejemplo canterano','ST');
 assert.ok(Object.values(a).every(v=>v===1||v===2));
 assert.equal(Object.keys(a).length,1);
});
test('when teammates only offer passes backward, an unmarked ball carrier drives goalward',()=>{
 const g=make();const p=g.teams[0][6];p.x=55;p.y=34;
 for(const q of g.teams[0])if(q!==p){q.x=27;q.y=4+q.i*5}
 for(const q of g.teams[1]){q.x=94;q.y=10+q.i*3}
 g.hold(p);g.comboCooldown=1e6;g.rng=()=>.99;
 const plan=progressiveCarry(g,p,20);assert.ok(plan&&plan.x>p.x&&plan.advance>3);
 const back=g.teams[0][7];assert.ok(carryIsPreferred(g,p,back,plan));
 const before=p.x;g.decide(p);
 assert.equal(g.stats[0].carries,1);
 assert.ok(p.aiEscape.x>before);
 g.movePlayers(.08);assert.ok(p.x>before);
 assert.ok(g.stats[0].forwardCarryMeters>0);
});
test('the primary presser approaches the carrier to actual tackle distance',()=>{
 const g=make(),p=g.teams[0][6],q=g.teams[1][6];
 p.x=55;p.y=34;q.x=60;q.y=34;
 for(const z of g.teams[1])if(z!==q){z.x=92;z.y=4+z.i*5}
 g.hold(p);const before=Math.hypot(q.x-p.x,q.y-p.y);
 for(let i=0;i<14;i++)g.movePlayers(.08);
 assert.ok(Math.hypot(q.x-p.x,q.y-p.y)<before);
 assert.ok(Number.isFinite(q.fx)&&Number.isFinite(q.fy),'pressing must maintain a reachable physical target');
});
test('outfielders do not attempt nonsensical 30m shots, including centre-backs',()=>{
 const g=make(),p=g.teams[0][9],cb=g.teams[0][2];
 p.x=74;p.y=34;cb.x=83;cb.y=34;
 assert.ok(g.shotQuality(p).distance>30);
 assert.equal(g.shouldShoot(p),false);
 assert.equal(g.shouldShoot(cb),false);
});
test('missed shots without a defensive touch never yield a corner',()=>{
 const g=make(),p=g.teams[0][9];p.x=91;p.y=32;g.hold(p);g.shoot(p);
 const f=g.ball.flight;f.goalChance=false;f.onTarget=false;f.parryCorner=false;
 const old=g.stats[0].corners;g.updateFlight(f.duration);
 assert.equal(g.stats[0].corners,old);
 assert.equal(g.restart?.type,'goalKick');
});
test('keeper parry across the goal line is tracked as the cause of a corner',()=>{
 const g=make(),p=g.teams[0][9];p.x=88;p.y=33;g.hold(p);g.shoot(p);
 const f=g.ball.flight;f.goalChance=false;f.onTarget=true;f.parryCorner=true;
 const old=g.stats[0].corners;g.updateFlight(f.duration);
 assert.equal(g.stats[0].corners,old+1);
 assert.equal(g.restart?.type,'corner');
 const e=g.events.filter(x=>x.type==='corner').at(-1);
 assert.equal(e.origin,'keeperParry');
 assert.equal(e.lastTouchSide,1);
});
test('a caught save gives the goalkeeper possession rather than a fictional goal kick',()=>{
 const g=make(),p=g.teams[0][9];p.x=87;p.y=33;g.hold(p);g.shoot(p);
 const f=g.ball.flight;f.goalChance=false;f.onTarget=true;f.parryCorner=false;
 g.updateFlight(f.duration);
 assert.equal(g.restart,null);
 assert.equal(g.ball.owner,g.keeper(1));
});
test('curling trajectories are visible but moderate, and finish at the correct position',()=>{
 const g=make(),p=g.teams[0][9];p.x=81;p.y=20;
 p.technical={...p.technical,curve:98,technique:97,composure:90};
 const shot=chooseShot(g,p,g.shotQuality(p));
 assert.equal(shot.style,'curl');
 assert.ok(Math.abs(shot.curve)<1);
 const f={start:{x:81,y:20},end:{x:105.6,y:35},...shot};
 const mid=shotPoint(f,.5),linear={x:93.3,y:27.5};
 assert.ok(Math.hypot(mid.x-linear.x,mid.y-linear.y)<1);
 assert.deepEqual(shotPoint(f,1),{x:f.end.x,y:f.end.y,height:0});
});
