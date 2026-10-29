// 2026/27 roster snapshots from club/federation websites; XI and ratings are demo estimates.
// Players encoded as "number|name". Positions come from the declared 4-3-3 / 4-2-3-1 / 3-5-2 template.
const R = (str) => str.split(';').map(item => {const [number,name] = item.trim().split('|');return {number:Number(number),name};});
const T=(id,name,league,rating,style,color,formation,raw,source)=>({id,name,league,rating,style,color,formation,players:R(raw),source,ratings:{attack:Math.min(94,rating+(style==='vertical'?2:1)),midfield:Math.min(94,rating+(style==='posesion'?2:0)),defense:Math.min(94,rating+(style==='bloque'?2:0))}});
export const RATINGS_REVISION='0.2.3';
export const LEAGUES = ['Premier League','LaLiga','Bundesliga','Serie A','Ligue 1'];
export const TEAMS = [
T('arsenal','Arsenal','Premier League',88,'posesion','#ec364b','433','1|David Raya;12|Jurrien Timber;2|William Saliba;6|Gabriel Magalhaes;5|Piero Hincapie;36|Martin Zubimendi;41|Declan Rice;8|Martin Odegaard;7|Bukayo Saka;14|Viktor Gyokeres;10|Eberechi Eze','https://www.premierleague.com/en/news/4725682'),
T('liverpool','Liverpool','Premier League',87,'presion','#e0444e','433','1|Alisson Becker;30|Jeremie Frimpong;4|Virgil van Dijk;33|Ronald Araujo;6|Milos Kerkez;38|Ryan Gravenberch;10|Alexis Mac Allister;8|Dominik Szoboszlai;7|Florian Wirtz;9|Alexander Isak;29|Bradley Barcola','https://www.premierleague.com/en/news/4725682'),
T('mancity','Manchester City','Premier League',89,'posesion','#70c4e9','433','1|Gianluigi Donnarumma;82|Rico Lewis;3|Ruben Dias;6|Marc Guehi;24|Josko Gvardiol;5|Elliot Anderson;17|Enzo Fernandez;47|Phil Foden;11|Jeremy Doku;9|Erling Haaland;10|Rayan Cherki','https://www.premierleague.com/en/news/4725682'),
T('chelsea','Chelsea','Premier League',85,'vertical','#507dec','4231','1|Emiliano Martinez;24|Reece James;3|Wesley Fofana;6|Levi Colwill;21|Jorrel Hato;25|Moises Caicedo;14|Jordan Henderson;7|Pedro Neto;10|Cole Palmer;17|Morgan Rogers;9|Joao Pedro','https://www.premierleague.com/en/news/4725682'),
T('barca','FC Barcelona','LaLiga',90,'posesion','#b63259','433','1|Joan Garcia;23|Jules Kounde;5|Pau Cubarsi;24|Eric Garcia;3|Alejandro Balde;16|Rodri;8|Pedri;21|Frenkie de Jong;10|Lamine Yamal;9|Gabriel Jesus;11|Raphinha','https://www.fcbarcelona.com/en/football/first-team/news/4570894/202627-first-team-jersey-numbers-confirmed'),
T('madrid','Real Madrid','LaLiga',90,'vertical','#ecebf4','433','1|Thibaut Courtois;12|Trent Alexander-Arnold;4|Dean Huijsen;3|Eder Militao;17|Marc Cucurella;14|Aurelien Tchouameni;8|Federico Valverde;5|Jude Bellingham;11|Rodrygo;10|Kylian Mbappe;7|Vinicius Junior','https://www.realmadrid.com/es-ES/noticias/futbol/primer-equipo/actualidad/dorsales-del-real-madrid-para-la-temporada-2026-27-10-08-2026'),
T('atleti','Atlético de Madrid','LaLiga',85,'bloque','#e44447','4231','13|Jan Oblak;18|Marc Pubill;24|Robin Le Normand;17|David Hancko;22|Alejandro Grimaldo;23|Morten Hjulmand;6|Koke;20|Giuliano Simeone;8|Pablo Barrios;11|Ademola Lookman;19|Julian Alvarez','https://www.atleticodemadrid.com/jugadores-primer-equipo/'),
T('bayern','Bayern Múnich','Bundesliga',90,'presion','#dc3e52','433','1|Manuel Neuer;27|Konrad Laimer;2|Dayot Upamecano;4|Jonathan Tah;19|Alphonso Davies;6|Joshua Kimmich;45|Aleksandar Pavlovic;10|Jamal Musiala;17|Michael Olise;9|Harry Kane;14|Luis Diaz','https://datencenter.dfb.de/en/competitions/12/seasons/2026-2027/teams/209'),
T('dortmund','Borussia Dortmund','Bundesliga',84,'vertical','#f1ca4f','433','1|Gregor Kobel;26|Julian Ryerson;3|Waldemar Anton;4|Nico Schlotterbeck;24|Daniel Svensson;7|Jobe Bellingham;8|Felix Nmecha;25|Joey Veerman;17|Carney Chukwuemeka;9|Serhou Guirassy;14|Maximilian Beier','https://datencenter.dfb.de/en/competitions/bundesliga/seasons/2026-2027/teams/borussia-dortmund'),
T('leverkusen','Bayer Leverkusen','Bundesliga',84,'vertical','#d64d62','433','1|Mark Flekken;17|Lucas Vazquez;4|Jarell Quansah;12|Edmond Tapsoba;3|Miguel Gutierrez;24|Aleix Garcia;8|Robert Andrich;10|Malik Tillman;19|Moussa Diaby;14|Patrik Schick;11|Martin Terrier','https://www.bayer04.de/en-us/team/werkself-1/bayer-04-leverkusen'),
T('inter','Inter de Milán','Serie A',87,'bloque','#477fe3','352','1|Josep Martinez;6|John Stones;25|Manuel Akanji;95|Alessandro Bastoni;99|Djed Spence;32|Federico Dimarco;20|Hakan Calhanoglu;23|Nicolo Barella;8|Petar Sucic;10|Lautaro Martinez;9|Marcus Thuram','https://www.inter.it/en/teams/first-team'),
T('milan','AC Milan','Serie A',84,'posesion','#db4d53','433','16|Mike Maignan;23|Fikayo Tomori;34|Mario Gila;31|Strahinja Pavlovic;2|Pervis Estupinan;14|Luka Modric;12|Adrien Rabiot;30|Ardon Jashari;11|Christian Pulisic;9|Goncalo Ramos;20|Omari Hutchinson','https://www.acmilan.com/en/teams/men-first-team'),
T('juve','Juventus','Serie A',84,'bloque','#dfe6e4','433','25|Guglielmo Vicario;15|Pierre Kalulu;3|Gleison Bremer;4|Federico Gatti;20|Andrea Cambiaso;5|Manuel Locatelli;19|Khephren Thuram;8|Teun Koopmeiners;7|Francisco Conceicao;9|Randal Kolo Muani;10|Kenan Yildiz','https://www.juventus.com/en/teams/first-team-men/squad/'),
T('psg','Paris Saint-Germain','Ligue 1',89,'posesion','#4c73d8','433','30|Lucas Chevalier;2|Achraf Hakimi;5|Marquinhos;51|Willian Pacho;25|Nuno Mendes;87|Joao Neves;17|Vitinha;8|Fabian Ruiz;10|Ousmane Dembele;9|Ferran Torres;7|Khvicha Kvaratskhelia','https://www.psg.fr/en/mens-football/squad'),
T('monaco','AS Monaco','Ligue 1',82,'vertical','#d95264','4231','1|Lukas Hradecky;2|Vanderson;15|Eric Dier;22|Mohammed Salisu;20|Flavio Nazinho;6|Denis Zakaria;8|Lamine Camara;18|Takumi Minamino;10|Aleksandr Golovin;11|Matthis Abline;9|Folarin Balogun','https://www.asmonaco.com/en/pros/players'),
T('marseille','Olympique de Marsella','Ligue 1',81,'presion','#62b6d7','433','1|Jeffrey de Lange;22|Timothy Weah;4|Conrad Egan-Riley;21|Nayef Aguerd;33|Emerson Palmieri;23|Pierre-Emile Hojbjerg;19|Geoffrey Kondogbia;7|Angel Gomes;14|Igor Paixao;9|Amine Gouiri;11|Neal Maupay','https://www.om.fr/en/team/men')
];
export const SLOTS={
 '433':[['GK',5,34],['RB',21,57],['CB',18,42],['CB',18,26],['LB',21,11],['DM',39,34],['CM',51,46],['CM',51,22],['RW',73,57],['ST',78,34],['LW',73,11]],
 '4231':[['GK',5,34],['RB',21,57],['CB',18,42],['CB',18,26],['LB',21,11],['DM',40,43],['DM',40,25],['RW',65,56],['AM',62,34],['LW',65,12],['ST',78,34]],
 '352':[['GK',5,34],['CB',18,52],['CB',17,34],['CB',18,16],['RWB',43,61],['LWB',43,7],['DM',41,34],['CM',53,47],['CM',53,21],['ST',77,44],['ST',77,24]]
};
// Player OVRs are explicitly curated per player, NOT calculated from squad order or shirt number.
// Ratings remain independent editorial estimates unless a player has a verified EA FC 27 entry.
// Values follow the exact order of each team's starting XI above.
const STARTING_OVR={
 arsenal:[85,82,88,88,83,84,87,86,87,85,85],
 liverpool:[89,83,88,85,82,85,84,85,86,88,83],
 mancity:[89,77,87,83,84,80,87,85,84,91,86],
 chelsea:[84,83,82,81,78,88,80,83,86,81,83],
 barca:[83,85,85,82,82,90,90,86,90,82,89],
 madrid:[90,86,83,84,83,85,88,90,85,91,89],
 atleti:[87,80,82,83,86,83,82,81,82,84,87],
 bayern:[85,82,84,83,82,86,81,88,90,90,85],
 dortmund:[85,79,80,84,78,80,79,78,79,84,79],
 leverkusen:[82,79,79,84,79,82,80,80,81,83,78],
 inter:[79,83,83,87,78,86,85,86,79,88,83],
 milan:[86,82,78,81,80,84,83,78,84,82,79],
 juve:[85,81,85,79,82,84,81,81,81,81,85],
 psg:[83,85,84,86,89,85,90,84,90,82,89],
 monaco:[81,80,80,79,75,82,80,80,83,77,82],
 marseille:[77,79,77,82,79,83,79,79,82,82,77]
};
const BENCH_OVR={
 arsenal:[80,79,82,83,81], liverpool:[84,80,80,81,79],
 mancity:[79,79,82,83,81], chelsea:[78,78,82,80,80],
 barca:[80,84,83,84,81], madrid:[81,85,82,82,81],
 atleti:[79,82,81,84,81], bayern:[76,82,81,81,79],
 dortmund:[78,79,79,80,79], leverkusen:[77,80,79,77,79],
 inter:[74,78,80,81,78], milan:[77,78,79,84,79],
 juve:[79,78,78,80,81], psg:[79,83,79,82,83],
 monaco:[79,78,77,80,78], marseille:[79,79,77,80,78]
};
// The following individual four-attribute profiles are from the published FC 27
// launch database: https://www.ea.com/games/ea-sports-fc/ratings
// Overall values for these players above match that database.
const VERIFIED_SKILLS={
 'Erling Haaland':{pace:87,shot:92,pass:71,tackle:47},
 'Alejandro Balde':{pace:90,shot:52,pass:75,tackle:77},
 'Frenkie de Jong':{pace:77,shot:70,pass:85,tackle:77},
 'Pedri':{pace:76,shot:75,pass:89,tackle:77},
 'Lamine Yamal':{pace:86,shot:84,pass:87,tackle:38},
 'Kylian Mbappe':{pace:96,shot:91,pass:80,tackle:29},
 'Harry Kane':{pace:62,shot:94,pass:83,tackle:49},
 'Rodri':{pace:62,shot:78,pass:86,tackle:85},
 'Michael Olise':{pace:83,shot:82,pass:89,tackle:47},
 'Jude Bellingham':{pace:79,shot:86,pass:83,tackle:79},
 'Vinicius Junior':{pace:93,shot:85,pass:80,tackle:31},
 'Khvicha Kvaratskhelia':{pace:86,shot:85,pass:84,tackle:59},
 'Nuno Mendes':{pace:94,shot:77,pass:80,tackle:84},
 'Ousmane Dembele':{pace:90,shot:89,pass:83,tackle:55},
 'Vitinha':{pace:72,shot:81,pass:88,tackle:75}
};
const ROLE_OFFSETS={
 GK:[-33,-24,-52,-34],RB:[6,-4,-26,1],LB:[6,-4,-26,1],
 CB:[-7,-10,-33,5],RWB:[6,-3,-22,-1],LWB:[6,-3,-22,-1],
 DM:[-6,2,-17,2],CM:[-3,3,-11,-7],AM:[2,3,0,-22],
 RW:[6,-1,-1,-35],LW:[6,-1,-1,-35],ST:[1,-13,7,-38]
};
const bound=(n)=>Math.min(97,Math.max(24,Math.round(n)));
function estimatedSkills(name,role,rating){
 const official=VERIFIED_SKILLS[name];
 if(official)return {...official};
 const m=ROLE_OFFSETS[role]||ROLE_OFFSETS.CM;
 return {pace:bound(rating+m[0]),pass:bound(rating+m[1]),shot:bound(rating+m[2]),tackle:bound(rating+m[3])};
}
export function buildLineup(team, side){
 const slots=SLOTS[team.formation],overalls=STARTING_OVR[team.id];
 if(!overalls||overalls.length!==team.players.length)throw Error('Missing or invalid individual ratings for '+team.id);
 return team.players.map((p,i)=>{
  const role=slots[i][0],rating=overalls[i];
  return {id:side+'-'+i,side,i,name:p.name,number:p.number,role,
   anchor:{x:slots[i][1],y:slots[i][2]},rating,skills:estimatedSkills(p.name,role,rating),
   x:0,y:0,fx:0,fy:0,face:0,energy:1,card:false};
 });
}

// Small illustrative substitute lists for laboratory rotation. These are editorial
// sample choices, NOT verified official match-day benches for October 2026.
const RESERVES={
 arsenal:'13|Kepa Arrizabalaga|GK;49|Myles Lewis-Skelly|LB;11|Gabriel Martinelli|LW;29|Kai Havertz|ST;23|Mikel Merino|CM',
 liverpool:'25|Giorgi Mamardashvili|GK;2|Joe Gomez|CB;17|Curtis Jones|CM;18|Cody Gakpo|LW;14|Federico Chiesa|RW',
 mancity:'18|Stefan Ortega|GK;27|Matheus Nunes|RB;8|Mateo Kovacic|CM;20|Bernardo Silva|AM;26|Savinho|RW',
 chelsea:'12|Filip Jorgensen|GK;5|Benoit Badiashile|CB;8|Enzo Fernandez|CM;11|Noni Madueke|RW;18|Christopher Nkunku|ST',
 barca:'13|Wojciech Szczesny|GK;4|Ronald Araujo|CB;6|Gavi|CM;20|Dani Olmo|AM;7|Ferran Torres|ST',
 madrid:'13|Andriy Lunin|GK;22|Antonio Rudiger|CB;6|Eduardo Camavinga|CM;15|Arda Guler|AM;16|Brahim Diaz|RW',
 atleti:'1|Juan Musso|GK;2|Jose Maria Gimenez|CB;5|Rodrigo de Paul|CM;7|Antoine Griezmann|AM;9|Alexander Sorloth|ST',
 bayern:'26|Sven Ulreich|GK;3|Kim Min-jae|CB;8|Leon Goretzka|CM;7|Serge Gnabry|RW;11|Kingsley Coman|LW',
 dortmund:'33|Alexander Meyer|GK;5|Ramy Bensebaini|CB;13|Pascal Gross|CM;10|Julian Brandt|AM;27|Karim Adeyemi|ST',
 leverkusen:'28|Janis Blaswich|GK;5|Loic Bade|CB;7|Jonas Hofmann|AM;21|Amine Adli|RW;9|Martin Hlozek|ST',
 inter:'12|Raffaele Di Gennaro|GK;15|Francesco Acerbi|CB;22|Henrikh Mkhitaryan|CM;7|Piotr Zielinski|CM;11|Luis Henrique|ST',
 milan:'57|Marco Sportiello|GK;46|Matteo Gabbia|CB;29|Youssouf Fofana|CM;10|Rafael Leao|LW;7|Santiago Gimenez|ST',
 juve:'1|Mattia Perin|GK;6|Lloyd Kelly|CB;16|Weston McKennie|CM;11|Nicolas Gonzalez|RW;18|Dusan Vlahovic|ST',
 psg:'39|Matvey Safonov|GK;21|Lucas Hernandez|CB;33|Warren Zaire-Emery|CM;14|Desire Doue|RW;29|Bradley Barcola|LW',
 monaco:'16|Philipp Kohn|GK;5|Thilo Kehrer|CB;4|Jordan Teze|RB;17|Eliesse Ben Seghir|AM;36|Breel Embolo|ST',
 marseille:'12|Geronimo Rulli|GK;5|Leonardo Balerdi|CB;6|Valentin Rongier|CM;10|Mason Greenwood|RW;8|Amine Harit|AM'
};
const group=role=>role==='GK'?'GK':['RB','LB','CB','RWB','LWB'].includes(role)?'DEF':['DM','CM','AM'].includes(role)?'MID':'ATT';
export function buildBench(team,side){
 const raw=(RESERVES[team.id]||'').split(';');const taken=new Set(team.players.map(p=>p.number));
 return raw.map((entry,i)=>{
 const [num,name,role]=entry.split('|');let number=Number(num);while(taken.has(number))number++;taken.add(number);
 const rating=BENCH_OVR[team.id]?.[i]??Math.max(68,team.rating-6);
 return {id:`${side}-bench-${i}`,side,i:11+i,name,number,role,group:group(role),
 anchor:{x:48,y:34},rating,skills:estimatedSkills(name,role,rating),
 x:52.5,y:34,fx:52.5,fy:34,energy:1,card:false,red:false};
 });
}