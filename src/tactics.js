// MatchLab tactical identities. Ratings are handled by teams.js; tactical choices are independent.
export const TACTICS={
 equilibrada:{label:'Equilibrada',description:'Bloque compacto, apoyos y riesgos controlados',width:1,depth:1,press:1,runs:1,direct:1,tempo:1,spacing:1,corners:5,counterPress:.52,compactness:.58,breakSpeed:.95},
 ofensiva:{label:'Ofensiva',description:'Más llegadas, extremos interiores y defensa adelantada',width:1.03,depth:1.22,press:1.12,runs:1.35,direct:1.18,tempo:1.14,spacing:1.08,corners:6,counterPress:.66,compactness:.46,breakSpeed:1.25},
 defensiva:{label:'Defensiva',description:'Bloque bajo y transiciones con pocos riesgos',width:.87,depth:.70,press:.70,runs:.70,direct:.94,tempo:.85,spacing:1.04,corners:4,counterPress:.12,compactness:.90,breakSpeed:.78},
 presion:{label:'Presión alta',description:'Robo arriba, coberturas y transiciones rápidas',width:.95,depth:1.16,press:1.46,runs:1.22,direct:1.17,tempo:1.22,spacing:1.06,corners:5,counterPress:.98,compactness:.62,breakSpeed:1.23},
 tiki_taka:{label:'Tiki-taka',description:'Triángulos, circulación corta y desmarques entre líneas',width:1.10,depth:1.07,press:1.13,runs:1.10,direct:.66,tempo:1.12,spacing:1.13,corners:5,counterPress:.84,compactness:.70,breakSpeed:1.03}
};
export const DEFAULT_TACTIC={posesion:'tiki_taka',vertical:'ofensiva',bloque:'defensiva',presion:'presion'};
export function defaultTactic(club){return DEFAULT_TACTIC[club?.style]||'equilibrada'}
export function tacticalState(key,minute,goalDiff){
 const base=TACTICS[key]||TACTICS.equilibrada;
 const urgent=minute>=72&&goalDiff<0;
 const protect=minute>=78&&goalDiff>0;
 return {
  ...base,
  key:TACTICS[key]?key:'equilibrada',
  phase:urgent?'buscando remontada':protect?'protegiendo ventaja':'plan inicial',
  depth:Math.max(.58,Math.min(1.42,base.depth+(urgent?.12:protect?-.10:0))),
  press:Math.max(.62,Math.min(1.58,base.press+(urgent?.18:protect?-.12:0))),
  runs:Math.max(.56,Math.min(1.55,base.runs+(urgent?.15:protect?-.10:0))),
  tempo:Math.max(.72,Math.min(1.40,base.tempo+(urgent?.10:protect?-.08:0)))
 };
}
