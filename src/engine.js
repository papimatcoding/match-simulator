import {buildLineup,buildBench} from './teams.js?v=0.5.5';
import {defaultTactic,tacticalState,TACTICS} from './tactics.js?v=0.5.5';
import {defaultRole,assignRole,eligibleRoles,roleTarget,roleBonus,safeOutlet,escapeDirection} from './roles.js?v=0.5.5';
import {isClearChance,passingLane,supportTarget} from './decisions.js?v=0.5.5';
import {combinationRate,chooseCombination,combinationValid,returnPassViable,combinationTarget,coverPassingLane} from './combinations.js?v=0.5.5';
import {resetCollective,onPossessionChange,getCollectivePhase,pressingAssignments,collectiveTarget} from './collective.js?v=0.5.5';
import {aimPass,interceptSegment,defensiveLaneTargets,flightAnticipationTarget,fieldExit} from './ball-intelligence.js?v=0.5.5';
import {decisionDelay,orientedFirstTouch,findSpaceRun} from './tempo-control.js?v=0.5.5';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const hypot=(x,y)=>Math.hypot(x,y);
const rndFactory=seed=>{let s=(seed>>>0)||1;return()=>((s^=s<<13,s^=s>>>17,s^=s<<5)>>>0)/4294967296};
const STATS=()=>({goals:0,shots:0,onTarget:0,xg:0,passes:0,completed:0,interceptions:0,fouls:0,corners:0,offsides:0,yellows:0,reds:0,saves:0,throwIns:0,substitutions:0,freeKicks:0,possSeconds:0,orientedControls:0});
const safeName=p=>p?.name||'un futbolista';
export class MatchEngine{
 constructor(home,away,seed=20261029,options={}){
  if(home.id===away.id)throw Error('Los equipos deben ser diferentes');
  this.clubs=[home,away];this.rng=rndFactory(seed);this.seed=seed;this.tactics=[options.tactics?.[0]||defaultTactic(home),options.tactics?.[1]||defaultTactic(away)].map(k=>TACTICS[k]?k:'equilibrada');
  this.teams=[buildLineup(home,0),buildLineup(away,1)];
  for(let side=0;side<2;side++)for(const p of this.teams[side])assignRole(p,defaultRole(p,this.clubs[side]));
  this.debugAI=false;this.selectedPlayer=null;this.diagnostics=[];this.stallWatch={id:null,x:0,y:0,seconds:0};
  this.benches=[buildBench(home,0),buildBench(away,1)];this.rosterHistory=this.teams.map((t,i)=>[...t,...this.benches[i]]);this.subsUsed=[0,0];this.subWindows=[56,68,79];this.subMoment=null;this.subMomentSerial=0;
  this.stats=[STATS(),STATS()];this.events=[];this.goals=[];
  this.ball={x:52.5,y:34,owner:null,flight:null,loose:null};this.attackPasses=0;
   this.combo=null;this.comboCooldown=0;this.patterns=[0,1].map(()=>({started:0,completed:0,aborted:{lost:0,blocked:0,timeout:0,restart:0,reception:0}}));
  this.time=0;this.realTime=0;this.half=1;this.status='preview';this.phase='kickoff';
   this.collectiveStats=[{regains:0,counterpressRecoveries:0},{regains:0,counterpressRecoveries:0}];resetCollective(this,0);
  this.carrier=null;this.possession=0;this.decision=1;this.restart=null;this.lastPass=null;
  this.toast='';this.toastTTL=0;this.goalFlash=0;this.isSetPiece=false;this.sequence=0;this.offsideMark=null;this.pendingCornerHeader=null;this.pendingPeriod=null;this.periodStart=null;
  this.reposition(0,true);
 }
 random(a,b){return a+(b-a)*this.rng()}
 isClearChance(p,q){return isClearChance(this,p,q)}
 passingLane(from,to){return passingLane(this,from,to)}
 collectivePhase(side){return getCollectivePhase(this,side)}
 collectivePressers(side){return pressingAssignments(this,side,this.ball)}
 setPlayerRole(side,index,key,focus='equilibrado'){const p=this.teams[side]?.[index];if(!p||!eligibleRoles(p.role).includes(key))return false;assignRole(p,key,focus);return true}
 diagnose(reason,player=null){this.diagnostics.push({time:Math.round(this.time/60*10)/10,reason,player:player?.name||null});if(this.diagnostics.length>90)this.diagnostics.shift()}
  tactic(side){return tacticalState(this.tactics[side],this.time/60,this.stats[side].goals-this.stats[1-side].goals)}
  setTactic(side,key){if(![0,1].includes(side)||!TACTICS[key])return false;this.tactics[side]=key;this.add('tactic',side,`${this.clubs[side].name} cambia a ${TACTICS[key].label.toLowerCase()}.`);return true}
 direction(side){return (side===0?1:-1)*(this.half===1?1:-1)}
 goalX(side){return this.direction(side)===1?105:0}
 ownGoalX(side){return this.direction(side)===1?0:105}
 localToWorld(side,x,y){return {x:this.direction(side)===1?x:105-x,y:this.direction(side)===1?y:68-y}}
 add(type,side,description,player=null,detail={}){
  const event={id:++this.sequence,type,side,minute:this.time>5400?'90+'+Math.ceil((this.time-5400)/60):this.half===1&&this.time>2700?'45+'+Math.ceil((this.time-2700)/60):Math.min(90,Math.max(1,Math.ceil(this.time/60))),time:this.time,description,player:player?.name||null,...detail};
  this.events.push(event);this.toast=description;this.toastTTL=type==='goal'?4:2.4;return event;
 }
 reposition(side,kickoff=false){
  for(let s=0;s<2;s++)for(let p of this.teams[s]){
   const q=this.localToWorld(s,p.anchor.x,p.anchor.y);p.x=p.fx=q.x;p.y=p.fy=q.y;
  }
  this.ball.owner=null;this.ball.flight=null;this.ball.loose=null;this.carrier=null;this.ball.x=52.5;this.ball.y=34;
  if(kickoff){this.restartAt('kickoff',side,{x:52.5,y:34},1.4);this.possession=side;this.phase='saque de centro'}
 }
 start(){if(this.status!=='preview')return;this.status='live';this.add('start',-1,'Comienza el partido.');this.reposition(0,true)}
 resumeHalf(){if(this.status!=='halftime')return;this.half=2;this.time=2700;this.pendingPeriod=null;this.periodStart=null;this.status='live';this.add('half',-1,'Comienza la segunda parte. Los equipos cambian de campo.');this.reposition(1,true)}
 isActive(p){return !p.red}
 nearest(side,x,y,filter=()=>true){let best=null,d=1e9;for(const p of this.teams[side])if(!p.red&&filter(p)){const v=hypot(p.x-x,p.y-y);if(v<d){best=p;d=v}}return best}
 keeper(side){return this.teams[side][0]}
 abortCombo(reason='lost'){
  if(!this.combo)return;
  const key=Object.hasOwn(this.patterns[this.combo.side].aborted,reason)?reason:'lost';
  this.patterns[this.combo.side].aborted[key]++;this.combo=null;
 }
 hold(p){if(this.possession!==p.side){onPossessionChange(this,p.side);this.attackPasses=0}this.carrier=p;this.possession=p.side;this.ball.owner=p;this.ball.flight=null;this.ball.loose=null;this.phase='posesion';this.decision=decisionDelay(this,p);p.aiEscape=null;this.isSetPiece=false;this.ball.x=p.x;this.ball.y=p.y;this.lastPass=this.lastPass?.to===p.id?this.lastPass:null;
  this.stallWatch={id:p.id,x:p.x,y:p.y,seconds:0};p.aiLastChoice='Controlar balón';p.aiReason='Evaluar compañeros, rivales y espacios';
  const c=this.combo;
  if(c){
   if(p===c.wall&&c.stage==='wall'){
    c.stage='return';this.decision=Math.min(this.decision,.17);
    p.aiIntent='Devolver pared al compañero que rompe';
   }else if(p===c.runner&&c.stage==='flight'){
    this.patterns[c.side].completed++;
    this.add('combinationComplete',c.side,`¡Pared completada! ${c.wall.name} habilita la ruptura de ${p.name}.`,p);
    this.combo=null;
   }else if(p!==c.initiator||c.stage!=='wall'){
    this.abortCombo(p.side!==c.side?'lost':'reception');
   }
  }
 }
 ballFree(){this.ball.owner=null;this.carrier=null;this.ball.loose=null}
 kickoff(side){this.lastPass=null;this.restartAt('kickoff',side,{x:52.5,y:34},1.15)}
 restartAt(type,side,spot,wait=1.8){
  this.ballFree();this.lastPass=null;this.abortCombo('restart');
  this.possession=side;resetCollective(this,side);
  this.ball.flight=null;this.ball.loose=null;this.ball.x=clamp(spot.x,0,105);this.ball.y=clamp(spot.y,0,68);
  this.restart={type,side,spot:{x:this.ball.x,y:this.ball.y},wait};this.restart.kickerId=this.selectKicker(this.restart)?.id;
  const setKicker=this.kicker(this.restart);if(setKicker){setKicker.x=clamp(spot.x-this.direction(side)*1.2,1,104);setKicker.y=clamp(spot.y,1,67)}
  if(['corner','penalty','throwIn','freekick','indirect','goalKick','kickoff'].includes(type)){
   // Stoppages allow organised positioning, not teleportation during live play.
   // Move attackers first so defenders can man-mark the resulting threats.
   for(const s of [side,1-side])for(const p of this.teams[s]){
    if(p.red||p===setKicker)continue;
    const target=this.restartPosition(p,this.restart);p.x=p.fx=target.x;p.y=p.fy=target.y;
   }
  }
  this.phase=type==='penalty'?'penalti':type==='corner'?'córner':type==='freekick'?'falta directa':type==='indirect'?'falta indirecta':type==='goalKick'?'saque de puerta':type==='throwIn'?'saque de banda':type==='kickoff'?'saque de centro':'reanudación';
  this.makeSubsAtStoppage();
 }
 // An end-of-half whistle waits for an ongoing promising attack, but not indefinitely.
 dangerous(){
  if(this.restart?.type==='penalty')return true;
  if(this.ball.flight?.type==='shot')return true;
  const attacking=this.ball.owner?.side??this.ball.flight?.side;
  if(attacking===undefined)return false;
  const x=this.ball.x,dir=this.direction(attacking);
  return (this.goalX(attacking)-x)*dir<30 && (this.ball.owner!==null||this.ball.flight!==null);
 }
 finishPeriod(){
  this.pendingPeriod=null;this.periodStart=null;this.ballFree();this.ball.flight=null;this.restart=null;this.abortCombo('restart');
  if(this.half===1){this.status='halftime';this.add('half',-1,'Descanso. Los equipos cambiarán de campo.');}
  else{this.status='finished';this.add('end',-1,'Final del partido.');}
 }
 update(dt){
  if(this.status!=='live')return;
  dt=clamp(dt,0,.08);this.realTime+=dt;this.time+=dt*18;
  this.toastTTL=Math.max(0,this.toastTTL-dt);this.goalFlash=Math.max(0,this.goalFlash-dt);
  if(this.offsideMark){this.offsideMark.ttl-=dt;if(this.offsideMark.ttl<=0)this.offsideMark=null}
  const limit=this.half===1?2700:5400;
  if(this.time>=limit){
   if(this.periodStart===null)this.periodStart=this.time;
   if(!this.dangerous()||this.time>=limit+40){this.finishPeriod();return}
   this.pendingPeriod=this.half;
  }
  if(this.ball.owner)this.stats[this.ball.owner.side].possSeconds+=dt;
  else if(this.ball.flight)this.stats[this.ball.flight.side].possSeconds+=dt*.8;
  if(this.combo&&!combinationValid(this,this.combo))this.abortCombo(this.realTime>this.combo.expiry?'timeout':'lost');
  this.movePlayers(dt);
  if(this.restart){this.restart.wait-=dt;if(this.restart.wait<=0)this.executeRestart();return}
  if(this.ball.flight){this.updateFlight(dt);return}
   if(this.ball.loose&&this.advanceLoose(dt))return;
  if(this.ball.owner){const p=this.ball.owner;this.ball.x=p.x+this.direction(p.side)*.75;this.ball.y=p.y;
   const w=this.stallWatch;
   if(w.id!==p.id)this.stallWatch={id:p.id,x:p.x,y:p.y,seconds:0};
   else if(hypot(p.x-w.x,p.y-w.y)>.85){w.x=p.x;w.y=p.y;w.seconds=0}
   else if((w.seconds+=dt)>1.6){
    const q=safeOutlet(this,p),op=this.nearest(1-p.side,p.x,p.y,z=>z.i>0);
    this.diagnose('Sin avance: salida de emergencia',p);
    p.aiReason='Sin avance: comprobar tiro, pase, despeje y conducción';
    p.aiLastChoice='Liberar posesión';w.seconds=0;
    if(this.isClearChance(p)){this.shoot(p);return}
    if(q&&dist(p,q)>.6&&this.passingLane(p,q)>2.4){this.pass(p,q);return}
    const ownDistance=(p.x-this.ownGoalX(p.side))*this.direction(p.side);
    if(ownDistance<27&&op&&dist(op,p)<4){this.clearance(p,1-p.side);return}
    p.aiEscape=escapeDirection(this,p);this.decision=Math.min(this.decision,.15);
   }
   this.decision-=dt;if(this.decision<=0)this.decide(p);return}
  const allowed=p=>!this.ball.loose||this.ball.loose.age>.24||p.id!==this.ball.loose.failedId;
   const near0=this.nearest(0,this.ball.x,this.ball.y,allowed),near1=this.nearest(1,this.ball.x,this.ball.y,allowed);
  const choice=dist(near0,this.ball)<=dist(near1,this.ball)?near0:near1;if(choice&&dist(choice,this.ball)<2.8)this.hold(choice);
 }
 advanceLoose(dt){
  const loose=this.ball.loose;if(!loose)return false;
  loose.age+=dt;
  const previous={x:this.ball.x,y:this.ball.y};
  const proposed={x:previous.x+loose.vx*dt,y:previous.y+loose.vy*dt};
  const exit=fieldExit(previous,proposed);
  if(exit){
   const side=1-loose.lastSide;this.ball.x=exit.point.x;this.ball.y=exit.point.y;
   if(exit.type==='throwIn'){
    this.stats[side].throwIns++;
    this.add('throwIn',side,`El control defectuoso manda el balón fuera. Saque para ${this.clubs[side].name}.`);
    this.restartAt('throwIn',side,{x:clamp(exit.point.x,1,104),y:exit.point.y},1.06);
   }else if(Math.abs(exit.point.x-this.goalX(loose.lastSide))<.01){
    this.add('goalKick',side,'El balón sale por la línea de fondo tras un mal control.');
    this.restartAt('goalKick',side,{x:this.ownGoalX(side)+this.direction(side)*5.5,y:34},1.1);
   }else{
    this.stats[side].corners++;
    this.add('corner',side,'Córner tras un control defectuoso.');
    this.restartAt('corner',side,{x:this.goalX(side),y:exit.point.y<34?0:68},1.42);
   }
   return true;
  }
  this.ball.x=proposed.x;this.ball.y=proposed.y;
  const friction=Math.max(0,1-1.25*dt);loose.vx*=friction;loose.vy*=friction;
  if(Math.hypot(loose.vx,loose.vy)<.45)this.ball.loose=null;
  return false;
 }
 makeSubsAtStoppage(){
  if(this.time<56*60||this.time>=90*60)return;
  const changes=[];
  for(let side=0;side<2;side++){
   if(this.subsUsed[side]>=3||this.time/60<this.subWindows[this.subsUsed[side]])continue;
   const team=this.teams[side],bench=this.benches[side];
   let candidates=team.filter(p=>p.i>0&&!p.red&&!p.subOn).sort((a,b)=>a.energy-b.energy);
   const outgoing=candidates.find(p=>bench.some(q=>q.role===p.role))||candidates.find(p=>bench.some(q=>q.group===p.group));
   if(!outgoing)continue;
   const idx=bench.findIndex(q=>q.role===outgoing.role);
   const j=idx>=0?idx:bench.findIndex(q=>q.group===outgoing.group);
   if(j<0)continue;
   const incoming=bench.splice(j,1)[0],slot=team.indexOf(outgoing);
   Object.assign(incoming,{i:outgoing.i,anchor:{...outgoing.anchor},x:outgoing.x,y:outgoing.y,fx:outgoing.fx,fy:outgoing.fy,side,subOn:true,energy:1,red:false});
   assignRole(incoming,defaultRole(incoming,this.clubs[side]));team[slot]=incoming;this.subsUsed[side]++;this.stats[side].substitutions++;
   this.add('substitution',side,`Cambio en ${this.clubs[side].name}: entra ${incoming.name} (#${incoming.number}) por ${outgoing.name} (#${outgoing.number}).`,
    incoming,{in:incoming.name,out:outgoing.name,inNumber:incoming.number,outNumber:outgoing.number});
   changes.push({side,team:this.clubs[side].name,color:this.clubs[side].color,
      in:{name:incoming.name,number:incoming.number},out:{name:outgoing.name,number:outgoing.number}});
   this.restart.kickerId=this.selectKicker(this.restart)?.id;
  }
  if(changes.length)this.subMoment={id:++this.subMomentSerial,minute:Math.ceil(this.time/60),changes};
 }
 movePlayers(dt){
  const owner=this.ball.owner, bx=this.ball.x,by=this.ball.y;
  const B=owner?.side??this.ball.flight?.side??this.restart?.side??this.possession;
  // Press only with nearby players; the rest keep a zonal defensive structure.
  const closest=[null,null],laneTargets=[null,null];
  // Each side pursues an unowned ball physically, rather than waiting for a
  // nearby scripted reception or teleporting the recovery.
  const recovering=!owner&&!this.restart&&!this.ball.flight&&!this.ball.loose;
  const recoverers=[0,1].map(side=>recovering?this.nearest(side,bx,by,p=>p.i!==0):null);
  for(let side=0;side<2;side++){
   if(side===B)continue;
   const sorted=this.teams[side].filter(p=>p.i!==0&&!p.red)
    .map(p=>({p,d:hypot(p.x-bx,p.y-by)})).sort((a,b)=>a.d-b.d);
   closest[side]=pressingAssignments(this,side,{x:bx,y:by});
    laneTargets[side]=defensiveLaneTargets(this,side,owner,closest[side]);
  }
  for(let side=0;side<2;side++){
   const dir=this.direction(side),team=this.teams[side],attacking=side===B,tactic=this.tactic(side);
   const pressers=closest[side]||[];
   const defenders=this.teams[1-side].filter(p=>!p.red);
   const defenderLine=defenders.map(p=>p.x*dir).sort((a,b)=>b-a)[1]||95;
   for(const p of team){if(p.red)continue;
    let target;
    if(this.restart){target=this.restartPosition(p,this.restart)}
    else if(p.i===0){
     const x=this.ownGoalX(side)+dir*(7+clamp((bx-this.ownGoalX(side))*dir*.065,0,9));
     target={x:clamp(x,3,102),y:clamp(34+(by-34)*.14,18,50)};
    } else if(p===owner){target={x:p.x,y:p.y}}
    else if(this.ball.flight?.type==='pass'&&this.ball.flight.to===p){target={...this.ball.flight.end}}
    else{
     const anchor=this.localToWorld(side,p.anchor.x,p.anchor.y);
     const ballShift=clamp((bx-52.5)*dir*.26*tactic.depth,-13,15)+(tactic.depth-1)*7;
     target={x:anchor.x+dir*ballShift,y:clamp(34+(anchor.y-34)*tactic.width+(by-34)*.16,4,64)};
     const nearby=hypot(p.x-bx,p.y-by);
     if(attacking){
      const lane=Math.sign(anchor.y-34)||((p.i%2)*2-1);
      const isWinger=['LW','RW','RWB','LWB'].includes(p.role);
      const isForward=['ST','LW','RW','AM'].includes(p.role);
      const isMid=['DM','CM','AM'].includes(p.role);
      // Wide players STAY wide, instead of collapsing into a crowd around the ball.
      if(isWinger)target.y=clamp(anchor.y+(by-34)*.10,5,63);
      else if(p.role==='ST')target.y=clamp(34+lane*4+(by-34)*.12,12,56);
      else if(isMid)target.y=clamp(anchor.y+(by-34)*.25,7,61);
      if(isForward){
       const nearGoal=(this.goalX(side)-bx)*dir;
       const runClock=Math.sin(this.realTime*1.15+p.i*1.73);
       const run=nearGoal>14&&nearby<40&&runClock>-(.20+.25*tactic.runs);
       target.x+=dir*(run?7.5*tactic.runs:1.5);
       if(run&&!isWinger)target.y=clamp(target.y+lane*(2.5+(p.i%3)*2),5,63);
       // Controlled timing: forwards hold just ONSIDE until a pass is played.
       if(run){const lead=Math.min(3.3,Math.max(0,runClock-.15)*4.2*tactic.runs);
         if(target.x*dir>defenderLine-.9+lead)target.x=dir*(defenderLine-.9+lead)}
      }
      if(isMid&&nearby<25&&p!==owner&&!(p.role==='AM'&&nearby>13&&nearby<22)){
       // Support triangles: midfielders offer a passing angle, not the same spot.
       target.x=clamp(bx-dir*(4+(p.i%3)*2),3,102);
       target.y=clamp(by+lane*(9+(p.i%2)*3),4,64);
      }
      // Midfielders make late runs and the far winger attacks the back post.
      const inFinalThird=(this.goalX(side)-bx)*dir<34;
      if(inFinalThird&&p!==owner&&['CM','AM'].includes(p.role)&&p.i!==5){
       const wave=Math.sin(this.realTime*.83+p.i*1.41);
       if(wave>-.38&&nearby<43){
        target.x=clamp(bx+dir*(5+5*tactic.runs),3,102);
        target.y=clamp(34+(p.i%2?1:-1)*(8+(p.i%3)*2),7,61);
        if(target.x*dir>defenderLine-.75)target.x=dir*(defenderLine-.75);
       }
      }
      if(inFinalThird&&isWinger&&p.role!=='RWB'&&p.role!=='LWB'&&Math.abs(anchor.y-by)>18){
       target.y=clamp(anchor.y+(34-anchor.y)*.43,7,61);target.x+=dir*5*tactic.runs;
      }
     }else{
      if(p===pressers[0])target={x:bx-dir*2.4,y:by+(p.i%2?1:-1)*.8};
      else if(p===pressers[1])target={x:bx-dir*5.5,y:by+(p.i%2?1:-1)*5.5};
      else{
       // Defenders remain on the goal side and protect their assigned lanes.
       if(['CB','LB','RB','RWB','LWB'].includes(p.role))target.x=clamp(target.x-dir*(2+(1-tactic.depth)*5),3,102);
       if(p.role==='CB'&&p.i===2){
        const striker=this.teams[1-side].find(q=>q.role==='ST'&&!q.red);
        if(striker&&hypot(striker.x-bx,striker.y-by)<42&&(striker.x-this.ownGoalX(side))*dir<54){
         target.x=clamp(striker.x-dir*2.5,3,102);target.y=clamp(striker.y+2,4,64);
        }
       }
      }
     }
    }
    if(!this.restart&&p!==owner&&p.i>0){
     let pushX=0,pushY=0;
     for(const q of [...this.teams[0],...this.teams[1]]){
      if(q===p||q.red)continue;
      const isPresser=pressers.includes(p);
      const sep=p.side===q.side?4.5*tactic.spacing:isPresser?1.9:3.2;
      const dx=target.x-q.x,dy=target.y-q.y;
      const d=hypot(dx,dy);
      if(d<sep){const nx=d>.01?dx/d:Math.cos(p.i*3+q.i),ny=d>.01?dy/d:Math.sin(p.i*3+q.i);
       const strength=(sep-d)*.43;
       pushX+=nx*strength;pushY+=ny*strength;
      }
     }
     target.x+=clamp(pushX,-4.5,4.5);
     target.y+=clamp(pushY,-4.5,4.5);
    }
    if(!this.restart){
     const receiving=this.ball.flight?.type==='pass'&&this.ball.flight.to===p;
     if(receiving){target={...this.ball.flight.end};p.aiIntent='Desmarcarse para recibir el pase'}
     else{
      const plan=roleTarget(this,p,target,{x:bx,y:by},attacking,owner);
      target={x:plan.x,y:plan.y};p.aiIntent=plan.intent;
      const support=supportTarget(this,p,owner,target);
      if(support){target={x:support.x,y:support.y};p.aiIntent=support.intent}
      const coordinated=combinationTarget(this,p);
      if(coordinated){target={x:coordinated.x,y:coordinated.y};p.aiIntent=coordinated.intent}
       else if(attacking&&owner){
        const run=findSpaceRun(this,p,owner,target);
        if(run){target={x:run.x,y:run.y};p.aiIntent=run.intent}
       }
     }
     if(attacking&&owner&&p!==owner&&p.role==='ST'&&p!==this.combo?.runner&&
       (this.goalX(side)-owner.x)*dir<27){
      target.x=target.x*.48+clamp(owner.x+dir*10,3,102)*.52;
      target.y=target.y*.48+(owner.y<34?37:31)*.52;
      p.aiIntent='Romper hacia zona de remate';
     }
    }
    else p.aiIntent='Recolocarse para reanudación';
    if(!this.restart&&!attacking&&p===pressers[1]&&owner){
     const cover=coverPassingLane(this,p,owner);
     if(cover){
      target.x=target.x*.22+cover.x*.78;
      target.y=target.y*.22+cover.y*.78;
      p.aiIntent=cover.intent;
     }
    }
    if(!this.restart&&p!==owner&&p.i>0){
     const collective=collectiveTarget(this,p,target,this.collectivePhase(side),pressers);
     target={x:collective.x,y:collective.y};if(collective.intent)p.aiIntent=collective.intent;
     const intercept=flightAnticipationTarget(this,p,this.ball.flight)||laneTargets[side]?.get(p);
     if(intercept){target={x:intercept.x,y:intercept.y};p.aiIntent=intercept.intent}
    }
    if(recovering&&p===recoverers[side]){
     target={x:bx,y:by};p.aiIntent='Acudir al balón suelto';
    }
    p.fx=clamp(target.x,2,103);p.fy=clamp(target.y,2,66);
    p.energy=clamp(p.energy-(p===owner?.02:.004)*dt,.52,1);
    const pressureStyle=tactic.press;
    const delta=hypot(p.fx-p.x,p.fy-p.y);
    const rawSpeed=p.i===0?2.5:(p===owner?3.5:pressers[0]===p?6.0*pressureStyle:pressers[1]===p?5.7*pressureStyle:pressers[2]===p?5.4*pressureStyle:5.15)*(.75+p.skills.pace/300)*(.75+.25*p.energy);
    const speed=p.i===0?rawSpeed:Math.min(rawSpeed,6.7); // tactical pressing cannot create superhuman sprint speed
    if(delta>.01){const step=Math.min(delta,speed*dt);p.x+=step*(p.fx-p.x)/delta;p.y+=step*(p.fy-p.y)/delta}
   }
  }
  if(owner&&!this.restart){const dir=this.direction(owner.side);const front=this.nearest(1-owner.side,owner.x,owner.y,p=>p.i!==0);const pressure=front?dist(front,owner):20;
   const remaining=Math.abs(this.goalX(owner.side)-owner.x);
   if(owner.aiEscape){const dest=owner.aiEscape,dd=hypot(dest.x-owner.x,dest.y-owner.y);if(dd>.5){const step=Math.min(dd,dt*5.4);owner.x+=(dest.x-owner.x)/dd*step;owner.y+=(dest.y-owner.y)/dd*step}else owner.aiEscape=null}
   if(!owner.aiEscape&&remaining>12&&pressure>2.5){owner.x=clamp(owner.x+dir*dt*(2.0+owner.rating/90),2,103);owner.y=clamp(owner.y+Math.sin(this.realTime*.8+owner.i)*dt*.34,2,66)}
   if(pressure<2.2&&this.rng()<dt*(.12+Math.max(0,front.skills.defense-70)*.004)){
    this.ball.x=owner.x;this.ball.y=owner.y;
    if(this.rng()<.16)this.foul(owner,front);
    else if(Math.abs(owner.y-34)>25&&this.rng()<.42){this.clearance(front,owner.side)}
    else{this.hold(front);this.stats[front.side].interceptions++;this.add('turnover',front.side,`${front.name} recupera ante ${owner.name}.`,front)}
   }
  }
 }
 restartPosition(p,r){
  const spot=r.spot,dir=this.direction(r.side),isAtk=p.side===r.side;
  if(r.type==='kickoff'){
   if(p.id===r.kickerId)return {x:spot.x-dir*.65,y:34};
   const a=this.localToWorld(p.side,p.anchor.x,p.anchor.y);
   if(isAtk){
    if(p===this.kickoffSupport(r))return {x:52.5-dir*5.5,y:34+dir*1.5};
    return {x:clamp(52.5-dir*Math.max(4,Math.abs(a.x-52.5)),3,102),y:a.y};
   }
   // All opponents in their own half and at least 9.15m from the centre spot.
   const x=52.5+dir*Math.max(10.5,Math.abs(a.x-52.5));
   return {x:clamp(x,3,102),y:a.y};
  }
  if(r.type==='penalty'){
   if(p.i===0)return {x:this.ownGoalX(p.side)+this.direction(p.side)*1.6,y:34};
   if(isAtk){if(p===this.kicker(r))return {x:spot.x-dir*3,y:34};return {x:spot.x-dir*(17+p.i%3),y:clamp(34+((p.i%2)?1:-1)*(13+(p.i%3)*3),8,60)}}
   return {x:spot.x-dir*(18+p.i%4),y:clamp(34+(p.i%2?1:-1)*(11+p.i%3*3),7,61)};
  }
  if(r.type==='freekick'&&hypot(spot.x-this.goalX(r.side),spot.y-34)<36){
   if(p===this.kicker(r))return {x:spot.x-dir*2.8,y:spot.y+1.6};
   const gx=this.goalX(r.side);
   if(isAtk){
    // Players create screened runs toward the box, with two offering short options.
    if([5,6].includes(p.i))return {x:clamp(spot.x-dir*(8+p.i%2*2),3,102),y:clamp(spot.y+(p.i===5?9:-9),4,64)};
    return {x:clamp(gx-dir*(6+(p.i*3)%12),3,102),y:clamp(15+(p.i*11)%37,5,63)};
   }
   if(p.i>0&&p.i<=4){
    // Four-man wall nine metres from the ball, aligned between kicker and goal.
    const vx=gx-spot.x,vy=34-spot.y,l=hypot(vx,vy)||1;
    const mid={x:spot.x+vx/l*9.15,y:spot.y+vy/l*9.15};
    const perp={x:-vy/l,y:vx/l};
    return {x:clamp(mid.x+perp.x*(p.i-2.5)*1.85,2,103),y:clamp(mid.y+perp.y*(p.i-2.5)*1.85,2,66)};
   }
   const threats=this.teams[r.side].filter(q=>q!==this.kicker(r)&&q.i>0&&!q.red&&!([5,6].includes(q.i))).sort((a,b)=>Math.abs(gx-a.x)-Math.abs(gx-b.x));
   const threat=threats[p.i-5];
   if(threat){
    // Man marking: remaining defenders track the attacking runs from goal side.
    let mark={x:threat.x+dir*1.5,y:threat.y+(p.i%2?1.6:-1.6)};
    const dd=hypot(mark.x-spot.x,mark.y-spot.y);
    if(dd<9.5){const angle=Math.atan2(mark.y-spot.y,mark.x-spot.x);mark={x:spot.x+Math.cos(angle)*9.6,y:spot.y+Math.sin(angle)*9.6}}
    return {x:clamp(mark.x,2,103),y:clamp(mark.y,2,66)};
   }
  }
  if((r.type==='corner'||r.type==='throwIn')&&p===this.kicker(r))return {x:clamp(spot.x-dir*(r.type==='corner'?1.5:.3),1,104),y:clamp(spot.y+(spot.y<34?1.1:-1.1),1,67)};
  if(p.i===0)return {x:this.ownGoalX(p.side)+this.direction(p.side)*3.4,y:34};
  if(r.type==='corner'){
   const gx=this.goalX(r.side);
   if(isAtk){if([2,3,5,6,8,9,10].includes(p.i))return {x:clamp(gx-dir*(5+(p.i*7)%10),4,101),y:clamp(24+(p.i*9)%21,8,60)};return {x:clamp(gx-dir*29,4,101),y:clamp(16+(p.i*11)%35,5,63)}}
   return {x:clamp(gx-dir*(5+p.i%4*3),4,101),y:clamp(23+(p.i*6)%24,5,63)};
  }
  if(r.type==='throwIn'){const t=this.localToWorld(p.side,p.anchor.x,p.anchor.y);return {x:clamp(spot.x+(t.x-spot.x)*.46,3,102),y:clamp(spot.y+(spot.y===0?1:-1)*(4+(p.i*7)%17),2,66)}}
  const a=this.localToWorld(p.side,p.anchor.x,p.anchor.y);
  return {x:clamp(a.x+(spot.x-52)*.19,3,102),y:clamp(a.y+(spot.y-34)*.19,3,65)};
 }
 selectKicker(r){const team=this.teams[r.side].filter(p=>!p.red);if(r.type==='kickoff')return team.find(p=>p.role==='ST')||team[9];if(r.type==='goalKick')return this.keeper(r.side);if(r.type==='penalty')return team.find(p=>p.role==='ST')||team[9];
  if(r.type==='throwIn')return this.nearest(r.side,r.spot.x,r.spot.y,p=>p.i!==0&&['LB','RB','RWB','LWB','CB'].includes(p.role))||team[2];if(r.type==='corner')return team.filter(p=>p.role==='RW'||p.role==='LW'||p.role==='AM').sort((a,b)=>Math.abs(a.anchor.y-r.spot.y)-Math.abs(b.anchor.y-r.spot.y))[0]||team[8];return this.nearest(r.side,r.spot.x,r.spot.y,p=>p.i!==0)||team[6]}
 kicker(r){return this.teams[r.side].find(p=>p.id===r.kickerId)||this.selectKicker(r)}
 kickoffSupport(r){const k=this.kicker(r);return this.teams[r.side].find(p=>p.role==='CM'&&p!==k&&!p.red)||this.teams[r.side].find(p=>p.role==='AM'&&p!==k&&!p.red)||this.teams[r.side].find(p=>p!==k&&p.i>0&&!p.red)}
 executeRestart(){
  const r=this.restart;this.restart=null;if(!r)return;
  const side=r.side,dir=this.direction(side),k=this.kicker(r);
  k.x=clamp(r.spot.x-dir*1.2,1,104);k.y=r.spot.y;
  this.ball.x=r.spot.x;this.ball.y=r.spot.y;
  if(r.type==='penalty'){
   this.hold(k);this.ball.x=r.spot.x;this.ball.y=34;this.ball.owner=null;this.carrier=null;this.shoot(k,true);return;
  }
  if(r.type==='corner'){
   this.ball.owner=null;const options=this.teams[side].filter(p=>p.i>0&&p!==k&&!p.red&&['ST','CB','AM','CM'].includes(p.role));
   const candidates=options.map(p=>({p,near:hypot(p.x-this.goalX(side),p.y-34),def:this.nearest(1-side,p.x,p.y,z=>z.i!==0)}))
      .map(z=>({...z,score:40-z.near*.8+z.p.rating*.15+(z.p.role==='CB'?6:0)+(z.def?Math.min(8,dist(z.p,z.def))*1.6:0)+this.random(-8,8)})).sort((a,b)=>b.score-a.score);
    const receiver=candidates[0]?.p;
   if(receiver){this.pass(k,receiver,true);this.pendingCornerHeader=receiver.id;}return;
  }
  if(r.type==='throwIn'){const receiver=this.teams[side].filter(p=>p.i!==0&&p!==k&&!p.red).sort((a,b)=>hypot(a.x-r.spot.x,a.y-r.spot.y)-hypot(b.x-r.spot.x,b.y-r.spot.y))[0];if(receiver)this.pass(k,receiver,true);else this.hold(k);return}
  if(r.type==='goalKick'){const receiver=this.teams[side].find(p=>p.role==='CB'&&!p.red)||this.teams[side][2];this.pass(this.keeper(side),receiver,true);return}
  if(r.type==='freekick'&&Math.abs(this.goalX(side)-r.spot.x)<33&&this.rng()<.82){this.add('directKick',side,`${k.name} prepara un lanzamiento directo.`,k);this.shoot(k,false,true);return}
  if(r.type==='kickoff'){
   // An actual, visible first touch from the centre spot into midfield.
   const receiver=this.kickoffSupport(r);
   this.add('kickoff',side,`${this.clubs[side].name} mueve el balón desde el centro.`,k);
   if(receiver){this.ball.x=52.5;this.ball.y=34;this.pass(k,receiver,true)}
   else this.hold(k);
   return;
  }
  const receiver=this.findReceiver(k);if(receiver)this.pass(k,receiver,true);else this.hold(k);
 }
 shotQuality(p){
  const goal=this.goalX(p.side);
  const distance=hypot(goal-p.x,(p.y-34)*1.08);
  const sideAngle=Math.abs(p.y-34);
  const angleFactor=clamp(1-Math.pow(sideAngle/(18+distance*.24),1.5),.09,1);
  const defending=this.teams[1-p.side].filter(q=>q.i!==0&&!q.red);
  const blockers=defending.filter(q=>{
   const vx=goal-p.x,vy=34-p.y,ux=q.x-p.x,uy=q.y-p.y;
   const t=clamp((ux*vx+uy*vy)/(vx*vx+vy*vy),0,1);
   const perpendicular=hypot(ux-vx*t,uy-vy*t);
   return t>.07&&t<.96&&perpendicular<2.7;
  }).length;
  const nearby=defending.reduce((v,q)=>Math.min(v,dist(q,p)),30);
  const skill=clamp(.88+(p.skills.shot+roleBonus(this,p,'shot')-80)*.009+(this.clubs[p.side].rating-78)*.006,.58,1.28);
  const xg=clamp(.54*Math.exp(-Math.max(0,distance-7)/14)*angleFactor*
   (1-Math.min(4,blockers)*.13)*skill*(nearby<2.5?.78:1),.003,.70);
  return {distance,angleFactor,blockers,nearby,xg};
 }
 shouldShoot(p,quality=this.shotQuality(p)){
  const {distance,angleFactor,blockers,xg}=quality;
  if(p.i===0||(p.x-52.5)*this.direction(p.side)<=0)return false;
  if(['CB','LB','RB','LWB','RWB','DM'].includes(p.role)&&distance>22)return false;
  if(distance>32||angleFactor<.14)return false;
  if(this.isClearChance(p,quality))return true;
  const forward=this.direction(p.side);
  const betterTeammate=this.teams[p.side].some(q=>q!==p&&q.i>0&&!q.red&&
   (q.x-p.x)*forward>3&&hypot(this.goalX(p.side)-q.x,q.y-34)<distance-4&&
   dist(p,q)<24&&this.teams[1-p.side].every(d=>d.i===0||dist(q,d)>3.4));
  let rate=distance<10?.99:distance<16?.87:distance<23?.43:distance<29?.16:.009;
  rate*=clamp(.68+xg*2.1,.46,1.55);
  rate*=clamp(1-blockers*.20,.23,1);
  if(betterTeammate)rate*=distance<12?.65:.40;
  if(quality.nearby<2.2&&distance>12)rate*=.60;
   if(distance<11&&angleFactor>.62&&blockers===0)rate=Math.max(rate,.93);
   if(distance>=22)rate*=.66;else if(distance>=13)rate*=.93;else if(distance>=10)rate*=.9;
  return this.rng()<rate;
 }
 decide(p){if(p.red){this.ballFree();return}
  const side=p.side;
  if(this.pendingCornerHeader===p.id){this.pendingCornerHeader=null;this.add('header',side,`${p.name} se eleva para cabecear el córner.`,p);this.shoot(p,false,false,true);return}
  const quality=this.shotQuality(p);
  const nearest=this.nearest(1-side,p.x,p.y,q=>q.i!==0),press=nearest?dist(p,nearest):25;
  if(this.isClearChance(p,quality)){
   p.aiLastChoice='Finalizar mano a mano';p.aiReason='Tiro claro y sin defensas en trayectoria';this.shoot(p);return
  }
  if(this.shouldShoot(p,quality)){p.aiLastChoice='Disparar';p.aiReason=`Ocasión xG ${quality.xg.toFixed(2)}, distancia ${quality.distance.toFixed(1)} m`;this.shoot(p);return}
  if(press<3&&this.rng()<.065){this.foul(p,nearest);return}
  if(press<2.5&&this.rng()<.12){this.stats[1-side].interceptions++;this.add('tackle',1-side,`${nearest.name} gana el balón a ${p.name}.`,nearest);this.hold(nearest);return}
  // A clear carrier may advance before making another choice.
  if((quality.distance>36&&press>5&&this.rng()<.18)||(press>7&&this.rng()<.12)){this.decision=this.random(.22,.46)/this.tactic(side).tempo;return}
  if(this.combo?.wall===p&&this.combo.stage==='return'){
   const c=this.combo;
   if(returnPassViable(this,c)){
    c.stage='flight';p.aiLastChoice='Pared hacia '+c.runner.name;
    p.aiReason='Tercer hombre rompe a espacio con corredor despejado';
    this.pass(p,c.runner,false,c.target);return
   }
   this.abortCombo('blocked');
  }
  if(!this.combo&&this.realTime>=this.comboCooldown&&this.rng()<combinationRate(this.tactics[side])){
   const c=chooseCombination(this,p);
   if(c){
    this.combo=c;this.comboCooldown=this.realTime+5.7;
    this.patterns[side].started++;
    p.aiLastChoice='Iniciar pared con '+c.wall.name;
    p.aiReason=c.runner.name+' prepara un desmarque detrás de la primera línea';
    this.add('combination',side,`${p.name} prepara una pared con ${c.wall.name}; ${c.runner.name} ataca el espacio.`,p);
    this.pass(p,c.wall);return
   }
  }
  const receiver=this.findReceiver(p);
  if(receiver){p.aiLastChoice='Pase a '+receiver.name;p.aiReason='Progresar con línea disponible';this.pass(p,receiver);return}
  const q=safeOutlet(this,p);
  if(q&&dist(q,p)>.7&&this.passingLane(p,q)>2.3){
   p.aiLastChoice='Reciclar con '+q.name;p.aiReason='No hay pase vertical: cambiar la orientación';this.pass(p,q);return
  }
  const ownDistance=(p.x-this.ownGoalX(side))*this.direction(side);
  if(ownDistance<26&&press<5){p.aiLastChoice='Despejar';p.aiReason='Evitar pérdida cerca de nuestra portería';this.clearance(p,1-side);return}
  if(quality.distance<16&&quality.angleFactor>.33&&quality.xg>.065&&p.i>0){
   p.aiLastChoice='Rematar bajo presión';p.aiReason='Sin pase seguro cerca de portería';this.shoot(p);return
  }
  p.aiEscape=escapeDirection(this,p);p.aiLastChoice='Conducir a espacio';p.aiReason='Sin pase ni tiro viable';this.diagnose('Sin línea de pase: escape',p);
  this.decision=.28/this.tactic(side).tempo;
 }
 findReceiver(p){
  const side=p.side,dir=this.direction(side),style=this.tactics[side],tactic=this.tactic(side);
  const defenderLine=this.teams[1-side].filter(z=>!z.red).map(z=>z.x*dir).sort((a,b)=>b-a)[1]??this.goalX(side)*dir;
  const tiredOfCirculating=style==='tiki_taka'&&this.attackPasses>=3&&Math.abs(this.goalX(side)-p.x)<58;
  const options=this.teams[side].filter(q=>q!==p&&q.i!==0&&!q.red&&dist(q,p)>5&&dist(q,p)<43);
  if(!options.length)return null;
  const rated=options.map(q=>{
   const d=dist(q,p),progress=(q.x-p.x)*dir;
   const opponent=this.nearest(1-side,q.x,q.y,z=>z.i!==0),free=opponent?dist(q,opponent):20;
   const vx=q.x-p.x,vy=q.y-p.y,magSq=vx*vx+vy*vy;
   let lane=20;
   for(const z of this.teams[1-side]){if(z.i===0||z.red)continue;
    const t=clamp(((z.x-p.x)*vx+(z.y-p.y)*vy)/magSq,0,1);
    if(t<.12||t>.95)continue;
    lane=Math.min(lane,hypot(z.x-(p.x+vx*t),z.y-(p.y+vy*t)));
   }
   const isOff=this.isOffside(p,q);
   const risky=d>30?Math.pow((d-30)/12,1.4)*(style==='tiki_taka'?11:5):0;
   const inTraffic=free<3?22:free<5?11:0;
   const blindLane=lane<2.5?30:lane<4?13:0;
   // Possession prefers clean short angles; vertical sides can play into space.
   const attackZone=Math.abs(this.goalX(side)-q.x)<25;
    const roleChance=attackZone?(q.role==='ST'?5:['LW','RW','AM','CM'].includes(q.role)?7:0):0;
    const rolePreference=(tiredOfCirculating&&['LW','RW','ST','AM'].includes(q.role)&&progress>3?12:0)+roleBonus(this,q,'pass')*.8+(q.aiRole==='delantero_avanzado'&&progress>4?6:0)+
    (style==='tiki_taka'&&['organizador','falso_nueve','lateral_invertido'].includes(q.aiRole)?(Math.abs(this.goalX(side)-p.x)<35?3:9):0)+
    (style==='ofensiva'&&['extremo_interior','box_to_box','lateral_ofensivo'].includes(q.aiRole)&&progress>3?10:0)+
    (style==='defensiva'&&progress<0?7:0);
    const attackingWindow=attackZone&&free>3.4?Math.min(6,(q.skills.shot-70)*.45):0;
    // Attack an unmarked final-third window without inventing a pass.
    const finishWindow=style==='tiki_taka'&&this.attackPasses>=2&&
     Math.abs(this.goalX(side)-p.x)<48&&
     ['ST','LW','RW','AM','CM'].includes(q.role)&&
     progress>1&&free>3.4&&lane>3.4&&!isOff&&
     Math.abs(this.goalX(side)-q.x)<30?
     clamp(14+(30-Math.abs(this.goalX(side)-q.x))*.3,0,21):0;
    const score=(progress>=0?progress*(style==='ofensiva'?.96:style==='tiki_taka'?(tiredOfCirculating?1.10:.64):style==='defensiva'?.73:.78)+3:progress*.37)+roleChance+attackingWindow+
    Math.min(free,12)*.79+Math.min(lane,11)*1.08+rolePreference+finishWindow-
    d*(style==='tiki_taka'?.38:style==='defensiva'?.27:.16)-inTraffic-blindLane-risky-
     (style==='tiki_taka'&&d>20?(d-20)*.9:0)-
    (progress< -10?5:0)-(isOff?(q.x*dir-Math.max(p.x*dir,defenderLine)<3.5?5+Math.max(0,p.skills.pass-65)*.25:90):0)+this.random(-2,2);
   return {q,score};
  }).sort((a,b)=>b.score-a.score);
  const chosen=rated[0];
  if(!chosen||chosen.score< -8)return null;
  return chosen.q;
 }
 isOffside(from,to){
  const dir=this.direction(from.side);if((to.x-52.5)*dir<=0)return false;
  const def=this.teams[1-from.side].filter(p=>!p.red).map(p=>p.x*dir).sort((a,b)=>b-a);
  if(def.length<2)return false;
  return to.x*dir>Math.max(def[1],from.x*dir)+.4;
 }
 pass(from,to,setPiece=false,aim=null){
  if(!from||!to)return;
  const side=from.side;
  this.stats[side].passes++;this.attackPasses++;
  const offside=!setPiece&&this.isOffside(from,to);
  const start={x:this.ball.x,y:this.ball.y};
  // Every normal pass targets a legal reception point; throw-ins are generated by actual clearances.
   // Predict a bounded receiving point, leaving the receiver time to run onto the ball.
  const advance=(to.x-from.x)*this.direction(side);
  const end=aim?{x:clamp(aim.x,2,103),y:clamp(aim.y,2,66)}:
    {x:clamp(to.x+this.direction(side)*(advance>0?Math.min(3,advance*.13):0),2,103),y:clamp(to.y+this.random(-.6,.6),2,66)};
  this.ballFree();this.ball.x=start.x;this.ball.y=start.y;
  const aimed=aimPass(this,from,start,end,setPiece);
  const finish=aimed.end; // Never redirect a pass toward a randomly chosen defender.
  this.ball.flight={type:'pass',side,from,to,start,end:finish,t:0,duration:clamp(dist(start,finish)/47,.26,1.32),setPiece,offside,outOfPlay:aimed.outOfPlay};
  if(offside){const defenders=this.teams[1-side].filter(p=>!p.red).map(p=>p.x*this.direction(side)).sort((a,b)=>b-a);this.offsideMark={x:defenders[1]*this.direction(side),ttl:4.5};}
  this.phase='pase';this.add('pass',side,`${from.name} juega para ${to.name}.`,from,{receiver:to.name});
 }
 // The animation must end at the actual keeper/save point, never inside the net.
 shoot(from,penalty=false,freeKick=false,header=false){
  const side=from.side,dir=this.direction(side),goal=this.goalX(side);
  const d=hypot(from.x-goal,(from.y-34)*1.05);
  const quality=this.shotQuality(from);
  const keeperRating=this.keeper(1-side).rating;
  const keeperMod=clamp(1+(80-keeperRating)*.005,.86,1.13);
  const aerial=clamp((from.rating-73)*.4+(['CB','ST'].includes(from.role)?7:0)+(['delantero_avanzado','central_anticipador'].includes(from.aiRole)?4:0),-5,17);
  const xg=penalty?.76:freeKick?clamp(quality.xg*.66,.018,.18):header?clamp(quality.xg*(.80+aerial/80)+(d<17?.05:0),.016,.34):clamp(quality.xg*keeperMod,.004,.65);
  this.stats[side].shots++;this.stats[side].xg+=xg;
  const targetRate=penalty?.91:header?clamp(.56+aerial*.008-quality.blockers*.028,.38,.82):
    this.isClearChance(from,quality)?clamp(.84+(from.skills.shot-75)*.004,.78,.95):
    clamp(.77-(d>24?.13:0)-quality.blockers*.045+(from.skills.shot-83)*.005,.38,.92);
  const onTarget=this.rng()<targetRate;
  const goalChance=onTarget&&(this.rng()<clamp(xg/targetRate,0,.94));
  const targetY=onTarget?this.random(31.2,36.8):(this.rng()<.5?this.random(25,29.3):this.random(38.7,43));
  const assist=!penalty&&!freeKick&&this.lastPass?.side===side&&this.lastPass?.to===from.id&&this.time-this.lastPass.time<150?this.lastPass.from:null;
  const start={x:this.ball.x,y:this.ball.y};
  const outcome=goalChance?'goal':onTarget?'save':'miss';
  const keeper=this.keeper(1-side),saveY=clamp(targetY,31,37);
  const end=outcome==='save'?{x:goal-dir*(2.0+this.random(0,1.4)),y:saveY}:{x:goal+dir*.7,y:targetY};
  this.ballFree();this.ball.flight={type:'shot',side,from,start,end,t:0,duration:clamp(d/47,.28,.88),goalChance,onTarget,xg,penalty,freeKick,header,assist,outcome,keeper};
  this.phase=penalty?'penalti':freeKick?'falta directa':'disparo';
  this.add('shot',side,penalty?`${from.name} lanza el penalti.`:freeKick?`${from.name} ejecuta la falta directa.`:`${from.name} ${header?'cabecea':'remata'} a portería.`,from,{xg});
 }
 clearance(by,lastSide){
  const start={x:this.ball.x,y:this.ball.y};const edge=start.y<34?-1:69;
  const end={x:clamp(start.x+this.direction(by.side)*this.random(4,14),2,103),y:edge};
  this.ballFree();this.ball.flight={type:'clearance',side:by.side,from:by,start,end,t:0,duration:clamp(dist(start,end)/28,.5,1.7),lastSide:by.side};
  this.phase='despeje';this.add('clearance',by.side,`${by.name} despeja hacia la banda.`,by);
 }
 foul(attacker,defender){
  if(!defender||!attacker)return;
  const side=attacker.side,where={x:attacker.x,y:attacker.y};this.stats[1-side].fouls++;
  this.add('foul',1-side,`Falta de ${defender.name} sobre ${attacker.name}.`,defender);
  const chance=this.rng();if(chance<.008){defender.red=true;this.stats[1-side].reds++;this.add('red',1-side,`${defender.name} es expulsado.`,defender)}
  else if(chance<.16){defender.card=true;this.stats[1-side].yellows++;this.add('yellow',1-side,`Amarilla para ${defender.name}.`,defender)}
  const inBox=Math.abs(where.x-this.goalX(side))<16.5&&Math.abs(where.y-34)<20.15;
  if(inBox){const spot={x:this.goalX(side)-this.direction(side)*11,y:34};this.add('penalty',side,`¡Penalti para ${this.clubs[side].name}!`);this.restartAt('penalty',side,spot,1.85)}
  else {this.stats[side].freeKicks++;this.restartAt('freekick',side,where,1.6)}
 }
 updateFlight(dt){
  const f=this.ball.flight;if(!f)return;const previous={x:this.ball.x,y:this.ball.y};f.t=Math.min(f.duration,f.t+dt);
  const u=clamp(f.t/f.duration,0,1),e=u;this.ball.x=f.start.x+(f.end.x-f.start.x)*e;this.ball.y=f.start.y+(f.end.y-f.start.y)*e;
  if(f.type==='shot'&&f.outcome==='save'&&f.keeper){const q=f.keeper;const t=clamp(u*1.6,0,1);q.x+=(f.end.x-q.x)*Math.min(.35,t*.3);q.y+=(f.end.y-q.y)*Math.min(.35,t*.3)}
  if(f.type==='pass'&&u>.05){
   const contact=interceptSegment(this,f,previous,this.ball);
   if(contact){const defender=contact.player;this.ball.x=contact.point.x;this.ball.y=contact.point.y;
    this.stats[defender.side].interceptions++;this.hold(defender);
    this.add('interception',defender.side,`${defender.name} intercepta en la trayectoria el pase de ${f.from.name}.`,defender);return;
   }
  }
  if(u<1)return;
  this.ball.flight=null;
  if(f.type==='clearance'){const side=1-f.lastSide,spot={x:clamp(f.end.x,1,104),y:f.end.y<34?0:68};this.add('throwIn',side,`Saque de banda para ${this.clubs[side].name}.`);this.stats[side].throwIns++;this.restartAt('throwIn',side,spot,1.06);return}
  if(f.type==='shot'){
   if(f.onTarget)this.stats[f.side].onTarget++;
   if(f.goalChance){
    this.stats[f.side].goals++;this.goals.push({side:f.side,scorer:f.from.name,assist:f.assist,minute:Math.ceil(this.time/60),penalty:f.penalty});this.goalFlash=3.1;
    this.add('goal',f.side,`¡GOOOL! ${f.from.name}${f.penalty?' (p.)':''}${f.assist?' · asistencia de '+f.assist:''} · ${this.clubs[f.side].name}.`,f.from);
    this.kickoff(1-f.side);return;
   }
   if(f.onTarget){const keeper=this.keeper(1-f.side);this.stats[1-f.side].saves++;const corner=this.rng()<.43;
    this.add('save',1-f.side,`${keeper.name} detiene el disparo de ${f.from.name}.`,keeper);
    if(corner){this.stats[f.side].corners++;this.add('corner',f.side,`Córner para ${this.clubs[f.side].name}.`);this.restartAt('corner',f.side,{x:this.goalX(f.side),y:f.end.y<34?0:68},1.42)}
    else this.restartAt('goalKick',1-f.side,{x:this.ownGoalX(1-f.side)+this.direction(1-f.side)*5.5,y:34},1.1);
   }else{if(this.rng()<.16){this.stats[f.side].corners++;this.add('corner',f.side,`Desvío defensivo: córner para ${this.clubs[f.side].name}.`);this.restartAt('corner',f.side,{x:this.goalX(f.side),y:f.end.y<34?0:68},1.8)}else{this.add('miss',f.side,`${f.from.name} remata fuera.`,f.from);this.restartAt('goalKick',1-f.side,{x:this.ownGoalX(1-f.side)+this.direction(1-f.side)*5.5,y:34},1.1)}}
   return;
  }
  if(f.type==='pass'){
   if(f.outOfPlay){
    if(f.outOfPlay==='throwIn'){
     const side=1-f.side;this.stats[side].throwIns++;
     this.add('throwIn',side,`El pase de ${f.from.name} sale por la banda. Saque para ${this.clubs[side].name}.`);
     this.restartAt('throwIn',side,{x:clamp(f.end.x,1,104),y:f.end.y<34?0:68},1.06);
    }else if(Math.abs(f.end.x-this.goalX(f.side))<.01){
     this.add('goalKick',1-f.side,`El pase de ${f.from.name} sale por la línea de fondo.`);
     this.restartAt('goalKick',1-f.side,{x:this.ownGoalX(1-f.side)+this.direction(1-f.side)*5.5,y:34},1.1);
    }else{
     this.stats[1-f.side].corners++;this.add('corner',1-f.side,`El pase de ${f.from.name} concede un córner.`);
     this.restartAt('corner',1-f.side,{x:this.goalX(1-f.side),y:f.end.y<34?0:68},1.42);
    }
    return;
   }
    if(f.offside){this.stats[f.side].offsides++;this.add('offside',f.side,`Fuera de juego de ${f.to.name}.`,f.to,{line:this.offsideMark?.x});this.restartAt('indirect',1-f.side,{x:clamp(f.to.x,4,101),y:clamp(f.to.y,4,64)},1.35);return}
   const recipient=f.to;if(recipient.red){this.restartAt('freekick',1-f.side,{x:f.end.x,y:f.end.y},1);return}
   this.ball.x=f.end.x;this.ball.y=f.end.y;
   const defender=this.nearest(1-f.side,this.ball.x,this.ball.y,p=>p.i!==0);
   const receiverDistance=dist(recipient,this.ball);
   if(defender&&dist(defender,this.ball)<2.45&&dist(defender,this.ball)<receiverDistance){
    this.stats[defender.side].interceptions++;this.hold(defender);
    this.add('interception',defender.side,`${defender.name} se anticipa al control de ${recipient.name}.`,defender);return;
   }
   if(receiverDistance>1.85||this.rng()<(.025+(defender&&dist(defender,this.ball)<4?.07:0)-(f.setPiece?.02:0))){
    this.phase='balon dividido';this.lastPass=null;
    const length=Math.max(.1,dist(f.start,f.end)),touch=receiverDistance<=1.85;
    const sideline=Math.min(this.ball.y,68-this.ball.y);
    const sideDrift=touch&&sideline<13?(this.ball.y<34?-1:1)*this.random(5.5,8.5):this.random(-1.8,1.8);
    this.ball.loose={vx:(f.end.x-f.start.x)/length*this.random(2.5,4.5),vy:(f.end.y-f.start.y)/length*3+sideDrift,lastSide:f.side,failedId:touch?recipient.id:null,age:0};
    this.add('loose',f.side,`El envío de ${f.from.name} queda dividido.`,f.from);
    if(this.combo&&f.side===this.combo.side&&
     ((this.combo.stage==='wall'&&f.to===this.combo.wall)||(this.combo.stage==='flight'&&f.to===this.combo.runner)))
     this.abortCombo('reception');
    return;
   }
   recipient.x+=clamp(f.end.x-recipient.x,-.18,.18);recipient.y+=clamp(f.end.y-recipient.y,-.18,.18);
   this.stats[f.side].completed++;this.hold(recipient);
    recipient.aiEscape=orientedFirstTouch(this,recipient);
    if(recipient.aiEscape)this.stats[f.side].orientedControls++;
    this.decision=Math.min(this.decision,.22/this.tactic(recipient.side).tempo);
    this.lastPass={from:f.from.name,to:recipient.id,side:f.side,time:this.time};
   if(this.pendingCornerHeader===recipient.id)this.decision=.22;
  }
 }
 get clock(){const secs=Math.floor(this.time);return `${String(Math.floor(secs/60)).padStart(2,'0')}:${String(secs%60).padStart(2,'0')}`}
 get score(){return `${this.stats[0].goals} - ${this.stats[1].goals}`}
 get possessionPct(){const total=this.stats[0].possSeconds+this.stats[1].possSeconds;return total?Math.round(this.stats[0].possSeconds/total*100):50}
 snapshot(){return {patterns:this.patterns,tactics:this.tactics,diagnostics:this.diagnostics,roleCount:this.teams.reduce((n,a)=>n+a.filter(p=>p.aiRole).length,0),status:this.status,time:this.time,half:this.half,score:this.stats.map(s=>s.goals),events:this.events,stats:this.stats,goals:this.goals,subsUsed:this.subsUsed,ball:{x:this.ball.x,y:this.ball.y,owner:this.ball.owner?.id||null,flight:this.ball.flight?.type||null},teams:this.teams};}
}