// 2026/27 roster snapshots from club/federation websites; XI and ratings are demo estimates.
// Players encoded as "number|name". Positions come from the declared 4-3-3 / 4-2-3-1 / 3-5-2 template.
const R = (str) => str.split(';').map(item => {const [number,name] = item.trim().split('|');return {number:Number(number),name};});
const T=(id,name,league,rating,style,color,formation,raw,source)=>({id,name,league,rating,style,color,formation,players:R(raw),source,ratings:{attack:Math.min(94,rating+(style==='vertical'?2:1)),midfield:Math.min(94,rating+(style==='posesion'?2:0)),defense:Math.min(94,rating+(style==='bloque'?2:0))}});
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
export function buildLineup(team, side){
 const slots=SLOTS[team.formation]; return team.players.map((p,i)=>({
 id:side+'-'+i,side,i,name:p.name,number:p.number,role:slots[i][0],anchor:{x:slots[i][1],y:slots[i][2]},
 rating:Math.max(69,Math.min(94,team.rating+(i===0?1:0)+((p.number*13+i*7)%9)-4)),
 skills:{pace:Math.max(65,Math.min(95,team.rating+(i%5)*2-3)),pass:Math.max(65,Math.min(95,team.rating+(i%7)-3)),shot:Math.max(53,Math.min(96,team.rating+(i>=8?4:-18))),tackle:Math.max(54,Math.min(95,team.rating+(i<5?3:-15)))},
 x:0,y:0,fx:0,fy:0,face:0,energy:1,card:false
 }));
}