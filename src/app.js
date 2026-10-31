import {LEAGUES,TEAMS,RATINGS_REVISION} from './teams.js?v=0.5.1';
import {MatchEngine} from './engine.js?v=0.5.1';
import {PitchRenderer} from './render.js?v=0.5.1';
import {TACTICS,defaultTactic} from './tactics.js?v=0.5.1';
import {ROLES,eligibleRoles,ROLE_FOCUS} from './roles.js?v=0.5.1';
const $=q=>document.querySelector(q);
// The displayed revision proves which ratings dataset the browser has loaded.
const revisionLabel=document.getElementById('ratings-revision');
if(revisionLabel)revisionLabel.textContent=RATINGS_REVISION;
const by=id=>document.getElementById(id);
const show=(el,on)=>el.classList.toggle('hidden',!on);
const esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const light=color=>['#ecebf4','#f1ca4f'].includes(color);
const icon=team=>`<div class="club-emblem ${light(team.color)?'light':''}" style="background:${team.color}">${team.name.split(' ').filter(n=>n.length>2).slice(0,2).map(x=>x[0]).join('').toUpperCase()}</div>`;
const teamLabel=team=>`${team.name} · ${team.league}`;
const opts=()=>LEAGUES.map(league=>`<optgroup label="${league}">${TEAMS.filter(t=>t.league===league).map(t=>`<option value="${t.id}">${t.name}</option>`).join('')}</optgroup>`).join('');
by('home').innerHTML=opts();by('away').innerHTML=opts();by('home').value='barca';by('away').value='madrid';
const tacticOptions=()=>Object.entries(TACTICS).map(([key,t])=>`<option value="${key}">${t.label}</option>`).join('');
for(const id of ['tactic-home','tactic-away','live-tactic-home','live-tactic-away'])by(id).innerHTML=tacticOptions();
by('tactic-home').value=defaultTactic(TEAMS.find(t=>t.id==='barca'));
by('tactic-away').value=defaultTactic(TEAMS.find(t=>t.id==='madrid'));
let game=null,renderer=null,running=false,speed=1,lastFrame=0,accum=0,lastUI=0,lastEv=0,tab='feed';
let subHold=0,lastSubMomentId=0;
function selected(){return [TEAMS.find(t=>t.id===by('home').value),TEAMS.find(t=>t.id===by('away').value)]}
function syncSelection(){const [home,away]=selected();for(const [side,t] of [['home',home],['away',away]])by(side+'-profile').innerHTML=`${icon(t)}<div class="prof-info"><strong>${esc(t.name)}</strong><small>ATA ${t.ratings.attack} · MED ${t.ratings.midfield} · DEF ${t.ratings.defense}<br>${esc(t.style.toUpperCase())} · ${t.formation.replace('433','4-3-3').replace('4231','4-2-3-1').replace('352','3-5-2')}</small></div><div class="ovr" title="Global estimada">${t.rating}</div>`;by('new-match').disabled=home.id===away.id}
by('home').addEventListener('change',()=>{by('tactic-home').value=defaultTactic(selected()[0]);syncSelection()});
by('away').addEventListener('change',()=>{by('tactic-away').value=defaultTactic(selected()[1]);syncSelection()});
by('swap').onclick=()=>{const a=by('home').value;by('home').value=by('away').value;by('away').value=a;
 by('tactic-home').value=defaultTactic(selected()[0]);by('tactic-away').value=defaultTactic(selected()[1]);syncSelection()};syncSelection();
for(const [id,side] of [['live-tactic-home',0],['live-tactic-away',1]])by(id).addEventListener('change',()=>{if(game?.status==='live'||game?.status==='halftime'){game.setTactic(side,by(id).value);refresh(true)}});

const roleLabel=p=>ROLES[p.aiRole]?.label||p.role;
const proficiency=p=>p.aiFamiliarity===2?'Rol++':p.aiFamiliarity===1?'Rol+':'Base';
const roleOptions=p=>eligibleRoles(p.role).map(key=>`<option value="${key}"${p.aiRole===key?' selected':''}>${ROLES[key].label}</option>`).join('');
function lineup(team,side){const players=game.teams[side];return `<div class="lineup-head">${icon(team)}<div><h3>${esc(team.name)}</h3><small>${esc(team.league)} · ${team.formation==='433'?'4-3-3':team.formation==='4231'?'4-2-3-1':'3-5-2'} · ${esc(TACTICS[game.tactics[side]].label)}</small></div><div class="lineup-pos">${team.rating}</div></div>${players.map(p=>`<div class="playerline"><span class="number">${p.number}</span><span>${esc(p.name)}</span><span class="role">${p.role}</span><span class="value">${p.rating}</span><div class="role-config"><label>ROL <select class="player-role" data-side="${side}" data-index="${p.i}">${roleOptions(p)}</select></label><label>ENFOQUE <select class="player-focus" data-side="${side}" data-index="${p.i}">${ROLE_FOCUS.map(f=>`<option value="${f}"${p.aiFocus===f?' selected':''}>${f}</option>`).join('')}</select></label><small class="role-level">${proficiency(p)}</small></div></div>`).join('')}`}
function showSubMoment(moment){
 const markup=moment.changes.map(change=>{
  const accent=/^#[0-9a-f]{6}$/i.test(change.color)?change.color:'#5dc2a0';
  return `<div class="sub-card" style="--sub-accent:${accent}">
    <div class="sub-club">${esc(change.team)}</div>
    <div class="sub-player sub-out"><span class="sub-arrow">↓</span><span class="sub-number">${change.out.number}</span><span class="sub-name">${esc(change.out.name)}</span><small>SALE</small></div>
    <div class="sub-player sub-in"><span class="sub-arrow">↑</span><span class="sub-number">${change.in.number}</span><span class="sub-name">${esc(change.in.name)}</span><small>ENTRA</small></div>
   </div>`;
 }).join('');
 by('sub-moment').innerHTML=`<div class="sub-board">
  <div class="sub-board-head"><span>CAMBIO DE JUGADORES</span><strong>${moment.minute}'</strong></div>
  <div class="sub-cards">${markup}</div><div class="sub-board-foot">PARTIDO DETENIDO · REANUDACIÓN AUTOMÁTICA</div>
 </div>`;
 show(by('sub-moment'),true);
}
function changeScreen(id){for(const name of ['setup','pregame','game'])show(by(name),id===name)}
function setupMatch(){const [h,a]=selected();if(h.id===a.id)return;
 game=new MatchEngine(h,a,Math.floor(Math.random()*4294967295),{tactics:[by('tactic-home').value,by('tactic-away').value]});changeScreen('pregame');by('lineup-home').innerHTML=lineup(h,0);by('lineup-away').innerHTML=lineup(a,1);window.scrollTo({top:0,behavior:'smooth'})}
by('pregame').addEventListener('change',e=>{
 const el=e.target;if(!el.matches('.player-role,.player-focus')||!game)return;
 const side=Number(el.dataset.side),index=Number(el.dataset.index),p=game.teams[side][index];if(!p)return;
 game.setPlayerRole(side,index,el.classList.contains('player-role')?el.value:p.aiRole,
  el.classList.contains('player-focus')?el.value:p.aiFocus);
 by('lineup-home').innerHTML=lineup(game.clubs[0],0);by('lineup-away').innerHTML=lineup(game.clubs[1],1);
});
by('new-match').onclick=setupMatch;by('change').onclick=()=>changeScreen('setup');
function startMatch(){if(!game)return;changeScreen('game');by('short-home').textContent=game.clubs[0].name;by('short-away').textContent=game.clubs[1].name;by('score-home-meta').textContent=TACTICS[game.tactics[0]].label;by('score-away-meta').textContent=TACTICS[game.tactics[1]].label;
  by('live-tactic-home').value=game.tactics[0];by('live-tactic-away').value=game.tactics[1];
 by('ingame-lineups').innerHTML=game.clubs.map((team,side)=>`<div class="mini-lineup"><header>${esc(team.name)}</header>${game.teams[side].map(p=>`<div><b>${p.number}</b><span>${esc(p.name)}</span></div>`).join('')}</div>`).join('');
 renderer=renderer||new PitchRenderer(by('pitch'));renderer.resize();game.start();speed=1;running=true;lastFrame=0;accum=0;lastEv=0;lastUI=0;subHold=0;lastSubMomentId=0;show(by('sub-moment'),false);aiDebug=false;game.debugAI=false;game.selectedPlayer=game.teams[0][9];show(by('ai-inspector'),false);by('debug').textContent='Analizar IA';document.body.classList.remove('read-mode');by('view').textContent='Solo relato';by('speed').textContent='Velocidad 1×';by('pause').textContent='Ⅱ Pausar';show(by('overlay'),false);refresh(true);window.scrollTo({top:0,behavior:'smooth'});requestAnimationFrame(loop)}
by('start').onclick=startMatch;
by('pause').onclick=()=>{if(!game||game.status!=='live')return;running=!running;by('pause').textContent=running?'Ⅱ Pausar':'▶ Reanudar'};
by('speed').onclick=()=>{speed=speed===1?.5:speed===.5?2:speed===2?4:1;by('speed').textContent=`Velocidad ${speed}×`};
let aiDebug=false;
by('debug').onclick=()=>{aiDebug=!aiDebug;if(game)game.debugAI=aiDebug;by('debug').textContent=aiDebug?'Desactivar análisis IA':'Analizar IA';show(by('ai-inspector'),aiDebug);refresh(true)};
by('pitch').addEventListener('click',e=>{
 if(!aiDebug||!game||!renderer)return;
 const rect=by('pitch').getBoundingClientRect(),px=e.clientX-rect.left,py=e.clientY-rect.top;
 let best=null,measure=1e5;
 for(const team of game.teams)for(const p of team){if(p.red)continue;
  const [x,y]=renderer.point(p.x,p.y),d=Math.hypot(px-x,py-y);
  if(d<measure){measure=d;best=p}
 }
 if(best&&measure<32){game.selectedPlayer=best;refreshAI()}
});
function refreshAI(){
 if(!game||!aiDebug)return;
 const p=game.selectedPlayer||game.ball.owner||game.teams[0][9];if(!p)return;
 by('ai-inspector').innerHTML=`<strong>${esc(p.name)} #${p.number}</strong>
 <span>${esc(roleLabel(p))} · ${proficiency(p)} · ${esc(p.aiFocus||'equilibrado')}</span>
 <span>Fase colectiva: ${esc(game.collectivePhase(p.side).label)} · ${esc(game.collectivePhase(p.side).zone)}</span>
  <span>Objetivo: ${esc(p.aiIntent||'Mantener posición')}</span>
 <span>Última decisión: ${esc(p.aiLastChoice||'—')}</span>
 <small>${esc(p.aiReason||'En espera de información')}</small>`;
}
by('view').onclick=()=>{document.body.classList.toggle('read-mode');by('view').textContent=document.body.classList.contains('read-mode')?'Ver campo':'Solo relato'};
by('fullscreen').onclick=()=>{const el=document.querySelector('.pitch-wrapper');if(!document.fullscreenElement)el.requestFullscreen?.();else document.exitFullscreen?.()};
by('rematch').onclick=()=>{running=false;game=null;subHold=0;lastSubMomentId=0;show(by('sub-moment'),false);show(by('overlay'),false);changeScreen('setup')};
by('continue').onclick=()=>{if(game?.status==='halftime'){game.resumeHalf();running=true;show(by('overlay'),false);by('pause').textContent='Ⅱ Pausar'}else if(game?.status==='finished'){by('rematch').click()}};
for(const x of document.querySelectorAll('.tab'))x.addEventListener('click',()=>{tab=x.dataset.tab;document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));document.querySelectorAll('.tabpane').forEach(p=>show(p,p.id==='pane-'+tab));refresh(true)});
function lineStat(title,a,b,suffix='',max=null){const total=max||Math.max(1,a+b);const f=clampNum(a/total*100);return `<div class="statsRow"><div class="statsLabel"><span>${a}${suffix}</span><small>${title}</small><span>${b}${suffix}</span></div><div class="bartrack"><div class="fillH" style="width:${f}%"></div><div class="fillA" style="width:${100-f}%"></div></div></div>`}
const clampNum=x=>Math.min(100,Math.max(0,x));
function statHtml(){const [a,b]=game.stats,p=game.possessionPct;const safePct=s=>s.passes?Math.round(s.completed/s.passes*100):0;return `<div class="stats-head">${lineStat('Posesión',p,100-p,'%')}${lineStat('Remates',a.shots,b.shots)}${lineStat('A puerta',a.onTarget,b.onTarget)}${lineStat('xG',+a.xg.toFixed(2),+b.xg.toFixed(2))}${lineStat('Pases completados',a.completed,b.completed)}${lineStat('Paredes iniciadas',game.patterns[0].started,game.patterns[1].started)}${lineStat('Paredes completadas',game.patterns[0].completed,game.patterns[1].completed)}${lineStat('Recuperaciones tras contrapresión',game.collectiveStats[0].counterpressRecoveries,game.collectiveStats[1].counterpressRecoveries)}${lineStat('Precisión pase',safePct(a),safePct(b),'%')}${lineStat('Córners',a.corners,b.corners)}${lineStat('Saques de banda',a.throwIns,b.throwIns)}${lineStat('Faltas',a.fouls,b.fouls)}${lineStat('Cambios',a.substitutions,b.substitutions)}${lineStat('Fueras de juego',a.offsides,b.offsides)}${lineStat('Amarillas',a.yellows,b.yellows)}${lineStat('Paradas',a.saves,b.saves)}</div><p class="statsFoot">Valores de acciones simuladas. Las paredes son secuencias de pase, devolución y desmarque; se cancelan si se pierde la posesión. xG estimado del laboratorio, no una métrica oficial.</p>`}
function refresh(force=false){if(!game)return;by('score-home').textContent=game.stats[0].goals;by('score-away').textContent=game.stats[1].goals;by('clock').textContent=game.clock;by('half-tag').textContent=game.half===1?'1.ª PARTE':'2.ª PARTE';by('playtag').textContent=game.phase.toUpperCase().replace('POSESION','POSESIÓN');
  by('score-home-meta').textContent=TACTICS[game.tactics[0]].label;
  by('score-away-meta').textContent=TACTICS[game.tactics[1]].label;
  by('tactic-state').textContent=game.clubs.map((club,side)=>`${side?'VISITANTE':'LOCAL'}: ${game.collectivePhase(side).label} (${game.collectivePhase(side).zone})`).join(' · ');
 if(game.toastTTL>0){show(by('ticker'),true);by('ticker').textContent=game.toast}else show(by('ticker'),false);
 if(force||game.events.length!==lastEv){const hadSub=game.events.slice(lastEv).some(e=>e.type==='substitution');lastEv=game.events.length;
  if(hadSub)by('ingame-lineups').innerHTML=game.clubs.map((team,side)=>`<div class="mini-lineup"><header>${esc(team.name)} · Cambios ${game.subsUsed[side]}/3</header>${game.teams[side].map(p=>`<div><b>${p.number}</b><span>${esc(p.name)}</span></div>`).join('')}</div>`).join('');const filtered=game.events.filter(e=>e.type!=='pass'&&e.type!=='loose'&&e.type!=='start').slice(-70).reverse();by('feed').innerHTML=filtered.length?filtered.map(e=>`<div class="event ${e.type}"><b>${e.minute}'</b><span class="evtext">${esc(e.description)}</span></div>`).join(''):`<div class="event empty">El encuentro está a punto de comenzar.</div>`;}
 if(tab==='stats')by('stats').innerHTML=statHtml();if(aiDebug)refreshAI();
 if(game.status==='halftime'){running=false;show(by('overlay'),true);by('overlay-text').innerHTML=`<strong>DESCANSO</strong><p>Ambos equipos van a cambiar de campo. Consulta los datos y reanuda cuando quieras.</p><div class="halftime-score">${game.score}</div>`;by('continue').textContent='Jugar segunda parte →'}
 if(game.status==='finished'){running=false;show(by('overlay'),true);by('overlay-text').innerHTML=`<strong>FINAL DEL PARTIDO</strong><p>${esc(game.clubs[0].name)} contra ${esc(game.clubs[1].name)}. Estadísticas reales de la simulación disponibles en la pestaña correspondiente.</p><div class="halftime-score">${game.score}</div>`;by('continue').textContent='Nueva simulación →'}
}
function loop(timestamp){
 if(!game)return;
 if(!lastFrame)lastFrame=timestamp;
 const dt=Math.min(.075,(timestamp-lastFrame)/1000);
 lastFrame=timestamp;
 // Freeze match time in REAL seconds, independently of 0.5× / 1× / 2× / 4×.
 if(subHold>0){
  subHold=Math.max(0,subHold-dt);
  if(subHold===0)show(by('sub-moment'),false);
 }else if(running&&game.status==='live'){
  accum+=dt*speed;let steps=0;
  while(accum>=1/60&&steps<21){
   game.update(1/60);accum-=1/60;steps++;
   const moment=game.subMoment;
   if(moment&&moment.id!==lastSubMomentId){
    lastSubMomentId=moment.id;subHold=2.85;accum=0;
    showSubMoment(moment);refresh(true);break;
   }
   if(game.status!=='live')break;
  }
  if(steps===21)accum=0;
 }
 if(!document.body.classList.contains('read-mode'))renderer.render(game);
 if(timestamp-lastUI>180||game.status!=='live'){refresh();lastUI=timestamp}
 requestAnimationFrame(loop)}