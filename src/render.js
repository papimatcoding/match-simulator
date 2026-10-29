const mix=(a,b,t)=>a+(b-a)*t;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export class PitchRenderer{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.w=900;this.h=600;this.px=0;this.py=0;this.scale=1;this.lastBall=[];this.resize();this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas)}
 resize(){const rect=this.canvas.getBoundingClientRect();const pixelRatio=Math.min(window.devicePixelRatio||1,2);this.canvas.width=Math.max(1,Math.floor(rect.width*pixelRatio));this.canvas.height=Math.max(1,Math.floor(rect.height*pixelRatio));this.w=rect.width;this.h=rect.height;this.ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);this.scale=Math.min((this.w-42)/105,(this.h-42)/68);this.px=(this.w-105*this.scale)/2;this.py=(this.h-68*this.scale)/2;}
 point(x,y){return [this.px+x*this.scale,this.py+y*this.scale]}
 field(engine){const ctx=this.ctx,[ox,oy]=this.point(0,0),S=this.scale;const X=v=>ox+v*S,Y=v=>oy+v*S;
  ctx.fillStyle='#08362c';ctx.fillRect(0,0,this.w,this.h);
  for(let i=0;i<12;i++){ctx.fillStyle=i%2?'#176b50':'#137355';ctx.fillRect(X(i*105/12),Y(0),105/12*S+1,68*S)}
  ctx.strokeStyle='#dbf9d6bf';ctx.lineWidth=clamp(S*.15,1,2);ctx.lineJoin='round';
  ctx.strokeRect(X(0),Y(0),105*S,68*S);ctx.beginPath();ctx.moveTo(X(52.5),Y(0));ctx.lineTo(X(52.5),Y(68));ctx.stroke();
  ctx.beginPath();ctx.arc(X(52.5),Y(34),9.15*S,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(X(52.5),Y(34),S*.29,0,7);ctx.fillStyle='#e7f2e3';ctx.fill();
  ctx.strokeRect(X(0),Y(13.84),16.5*S,40.32*S);ctx.strokeRect(X(88.5),Y(13.84),16.5*S,40.32*S);
  ctx.strokeRect(X(0),Y(24.84),5.5*S,18.32*S);ctx.strokeRect(X(99.5),Y(24.84),5.5*S,18.32*S);
  for(const cx of [11,94]){ctx.beginPath();ctx.arc(X(cx),Y(34),S*.27,0,7);ctx.fill()}
  // Penalty arc portions outside the box.
  ctx.beginPath();ctx.arc(X(11),Y(34),9.15*S,-.92,.92);ctx.stroke();ctx.beginPath();ctx.arc(X(94),Y(34),9.15*S,Math.PI-.92,Math.PI+.92);ctx.stroke();
  for(const [x,y,a,b] of [[0,0,0,Math.PI/2],[0,68,-Math.PI/2,0],[105,0,Math.PI/2,Math.PI],[105,68,Math.PI,Math.PI*1.5]]){ctx.beginPath();ctx.arc(X(x),Y(y),S,Math.min(a,b),Math.max(a,b));ctx.stroke()}
  ctx.strokeRect(X(-1.8),Y(30.34),1.8*S,7.32*S);ctx.strokeRect(X(105),Y(30.34),1.8*S,7.32*S);
  // subtle in-field shading for both penalty spots
  if(engine?.restart?.type==='penalty'){const spot=engine.restart.spot;ctx.beginPath();ctx.arc(X(spot.x),Y(spot.y),S*2,0,7);ctx.fillStyle='#fff5';ctx.fill()}
 }
 render(engine){if(!this.w||!engine)return;const ctx=this.ctx;ctx.clearRect(0,0,this.w,this.h);this.field(engine);
  const S=this.scale;
  // A flagged through ball freezes the defensive offside line at pass release.
  if(engine.offsideMark?.ttl>0){
   const [xx]=this.point(engine.offsideMark.x,34);
   ctx.save();ctx.strokeStyle='#ffce6b';ctx.lineWidth=2;ctx.setLineDash([7,6]);
   ctx.beginPath();ctx.moveTo(xx,this.py);ctx.lineTo(xx,this.py+68*S);ctx.stroke();
   ctx.setLineDash([]);ctx.fillStyle='#fff4ce';ctx.font='bold 12px system-ui';ctx.textAlign='left';
   ctx.fillText('LÍNEA DE FUERA DE JUEGO',Math.min(xx+8,this.w-214),this.py+15);ctx.restore();
  }
  for(const side of [0,1])for(const p of engine.teams[side]){
   if(p.red)continue;
   const [x,y]=this.point(p.x,p.y),color=engine.clubs[side].color;
   const bright=['#ecebf4','#f1ca4f'].includes(color);
   const radius=clamp(S*1.13,7.2,12.5);
   if(engine.ball.owner===p){ctx.beginPath();ctx.arc(x,y,radius+4.2,0,7);ctx.strokeStyle='#e9fca8';ctx.lineWidth=2;ctx.stroke()}
   ctx.beginPath();ctx.arc(x,y+2,radius+1,0,7);ctx.fillStyle='#071c18af';ctx.fill();
   ctx.beginPath();ctx.arc(x,y,radius,0,7);ctx.fillStyle=color;ctx.fill();ctx.strokeStyle=bright?'#ffffff':'#ecf8fa';ctx.lineWidth=1.6;ctx.stroke();
   ctx.font=`800 ${Math.round(radius*.95)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=bright?'#0d2730':'#ffffff';ctx.fillText(String(p.number),x,y+.5);
  }
  const {ball}=engine;const [bx,by]=this.point(ball.x,ball.y);
  const rad=clamp(S*.56,4.5,7);
  ctx.beginPath();ctx.ellipse(bx+1.4,by+3.5,rad*1.05,rad*.58,0,0,7);ctx.fillStyle='#001e16ba';ctx.fill();
  ctx.beginPath();ctx.arc(bx,by,rad,0,7);ctx.fillStyle='#fffdf1';ctx.fill();ctx.lineWidth=1.5;ctx.strokeStyle='#293e3b';ctx.stroke();
  ctx.beginPath();ctx.arc(bx,by,rad*.35,0,7);ctx.fillStyle='#23352e';ctx.fill();
  if(ball.flight){const [fx,fy]=this.point(ball.flight.start.x,ball.flight.start.y);ctx.beginPath();ctx.setLineDash([2,5]);ctx.moveTo(fx,fy);ctx.lineTo(bx,by);ctx.strokeStyle='#ffffff80';ctx.lineWidth=1.3;ctx.stroke();ctx.setLineDash([])}
  if(engine.restart?.type==='kickoff'){
   const [cx,cy]=this.point(52.5,34);
   ctx.save();ctx.beginPath();ctx.arc(cx,cy,11*S,0,Math.PI*2);
   ctx.strokeStyle='#f6eb8e9c';ctx.lineWidth=2;ctx.setLineDash([5,5]);ctx.stroke();ctx.setLineDash([]);
   ctx.font='800 12px system-ui';ctx.textAlign='center';ctx.textBaseline='bottom';
   ctx.fillStyle='#fff6c7';ctx.fillText('SAQUE DE CENTRO',cx,cy-12*S);ctx.restore();
  }
  if(engine.goalFlash>0){ctx.save();ctx.globalAlpha=Math.min(.7,engine.goalFlash*.35);ctx.fillStyle='#bce77b';ctx.font=`900 ${Math.min(64,this.w*.10)}px system-ui`;ctx.textAlign='center';ctx.fillText('¡GOL!',this.w/2,this.h/2);ctx.restore()}
 }
}