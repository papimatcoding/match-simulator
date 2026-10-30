// 2026/27 roster snapshots from club/federation websites; XI and ratings are demo estimates.
// Players encoded as "number|name". Positions come from the declared 4-3-3 / 4-2-3-1 / 3-5-2 template.
const R = (str) => str.split(';').map(item => {const [number,name] = item.trim().split('|');return {number:Number(number),name};});
const T=(id,name,league,rating,style,color,formation,raw,source)=>({id,name,league,rating,style,color,formation,players:R(raw),source,ratings:{attack:Math.min(94,rating+(style==='vertical'?2:1)),midfield:Math.min(94,rating+(style==='posesion'?2:0)),defense:Math.min(94,rating+(style==='bloque'?2:0))}});
export const RATINGS_REVISION='0.2.4';
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
T('marseille','Olympique de Marsella','Ligue 1',81,'presion','#62b6d7','433','1|Jeffrey de Lange;22|Timothy Weah;4|Conrad Egan-Riley;21|Nayef Aguerd;33|Emerson Palmieri;23|Pierre-Emile Hojbjerg;19|Geoffrey Kondogbia;7|Angel Gomes;14|Igor Paixao;9|Amine Gouiri;11|Neal Maupay','https://www.om.fr/en/team/men'),
T('athletic','Athletic Club','LaLiga',80,'presion','#dc354a','433','1|Unai Simon;2|Jesus Areso;3|Dani Vivian;4|Aymeric Laporte;5|Yuri Berchiche;6|Mikel Jauregizar;7|Inigo Ruiz de Galarreta;8|Oihan Sancet;9|Inaki Williams;10|Gorka Guruzeta;11|Nico Williams','https://www.laliga.com/en-GB/laliga-easports/clubs'),
T('betis','Real Betis','LaLiga',79,'posesion','#32a46c','433','1|Alvaro Valles;2|Hector Bellerin;3|Marc Bartra;4|Natan;5|Junior Firpo;6|Marc Roca;7|Pablo Fornals;8|Isco;9|Antony;10|Cucho Hernandez;11|Abde Ezzalzouli','https://www.laliga.com/en-GB/laliga-easports/clubs'),
T('villarreal','Villarreal CF','LaLiga',79,'vertical','#f1c843','433','1|Luiz Junior;2|Santiago Mourino;3|Juan Foyth;4|Renato Veiga;5|Sergi Cardona;6|Pape Gueye;7|Santi Comesana;8|Alberto Moleiro;9|Nicolas Pepe;10|Georges Mikautadze;11|Gerard Moreno','https://www.laliga.com/en-GB/laliga-easports/clubs'),
T('sociedad','Real Sociedad','LaLiga',78,'posesion','#5084d1','433','1|Alex Remiro;2|Jon Aramburu;3|Igor Zubeldia;4|Jon Martin;5|Sergio Gomez;6|Jon Gorrotxategi;7|Yangel Herrera;8|Carlos Soler;9|Take Kubo;10|Mikel Oyarzabal;11|Ander Barrenetxea','https://www.laliga.com/en-GB/laliga-easports/clubs'),
T('celta','RC Celta','LaLiga',77,'posesion','#64b6e3','433','1|Andrei Radu;2|Sergio Carreira;3|Carl Starfelt;4|Javi Rodriguez;5|Marcos Alonso;6|Ilaix Moriba;7|Miguel Roman;8|Hugo Alvarez;9|Williot Swedberg;10|Borja Iglesias;11|Iago Aspas','https://www.laliga.com/en-GB/laliga-easports/clubs'),
T('osasuna','CA Osasuna','LaLiga',77,'bloque','#be3448','433','1|Sergio Herrera;2|Valentin Rosier;3|Alejandro Catena;4|Flavien Boyomo;5|Abel Bretones;6|Lucas Torro;7|Jon Moncayola;8|Aimar Oroz;9|Raul Moro;10|Ante Budimir;11|Ruben Garcia','https://www.laliga.com/en-GB/laliga-easports/clubs'),
T('rayo','Rayo Vallecano','LaLiga',77,'presion','#e84e54','433','1|Augusto Batalla;2|Andrei Ratiu;3|Florian Lejeune;4|Luiz Felipe;5|Pep Chavarria;6|Pathe Ciss;7|Pedro Diaz;8|Unai Lopez;9|Isi Palazon;10|Jorge de Frutos;11|Alvaro Garcia','https://www.laliga.com/en-GB/laliga-easports/clubs'),
T('valencia','Valencia CF','LaLiga',77,'vertical','#e69e4e','433','1|Stole Dimitrievski;2|Dimitri Foulquier;3|Cesar Tarrega;4|Mouctar Diakhaby;5|Jose Gaya;6|Pepelu;7|Guido Rodriguez;8|Javi Guerra;9|Diego Lopez;10|Hugo Duro;11|Arnaut Danjuma','https://www.laliga.com/en-GB/laliga-easports/clubs'),
T('espanyol','RCD Espanyol','LaLiga',76,'bloque','#4382c6','433','1|Marko Dmitrovic;2|Omar El Hilali;3|Leandro Cabrera;4|Unai Nunez;5|Carlos Romero;6|Urko Gonzalez;7|Pol Lozano;8|Edu Exposito;9|Tyrhys Dolan;10|Roberto Fernandez;11|Javi Puado','https://www.laliga.com/en-GB/laliga-easports/clubs'),
T('sevilla','Sevilla FC','LaLiga',76,'vertical','#d84652','433','1|Odysseas Vlachodimos;2|Jose Angel Carmona;3|Marcao;4|Kike Salas;5|Gabriel Suazo;6|Lucien Agoume;7|Peque Fernandez;8|Jon Guridi;9|Chidera Ejuke;10|Isaac Romero;11|Ruben Vargas','https://www.laliga.com/en-GB/laliga-easports/clubs'),
T('deportivo','RC Deportivo','LaLiga',75,'vertical','#457cbb','433','1|Leo Roman;2|Adria Altimira;3|Dani Barcia;4|Miguel Loureiro;5|Angelino;6|Diego Villares;7|Riki Rodriguez;8|Mario Soriano;9|David Mella;10|Pierre-Emerick Aubameyang;11|Yeremay Hernandez','https://www.laliga.com/en-GB/laliga-easports/clubs'),
T('getafe','Getafe CF','LaLiga',75,'bloque','#4d7bb8','433','1|David Soria;2|Kiko Femenia;3|Djene Dakonam;4|Juan Berrocal;5|Zaid Romero;6|Mario Martin;7|Ramon Terrats;8|Javi Munoz;9|Juanmi;10|Borja Mayoral;11|Christantus Uche','https://www.laliga.com/en-GB/laliga-easports/clubs'),
T('alaves','Deportivo Alaves','LaLiga',75,'bloque','#3b82bb','433','1|Antonio Sivera;2|Jonny Otto;3|Nahuel Tenaglia;4|Facundo Garces;5|Yusi;6|Antonio Blanco;7|Ander Guevara;8|Denis Suarez;9|Miguel Rodriguez;10|Lucas Boye;11|Toni Martinez','https://www.laliga.com/en-GB/laliga-easports/clubs'),
T('levante','Levante UD','LaLiga',74,'vertical','#af4854','433','1|Pablo Cunat;2|Jeremy Toljan;3|Adrian Dela;4|Alberto Cabello;5|Manu Sanchez;6|Oriol Rey;7|Jon Olasagasti;8|Carlos Alvarez;9|Roger Brugue;10|Etta Eyong;11|Ivan Romero','https://www.laliga.com/en-GB/laliga-easports/clubs'),
T('elche','Elche CF','LaLiga',73,'bloque','#dce2dd','433','1|Matias Dituro;2|Buba Sangare;3|David Affengruber;4|Pedro Bigas;5|Victor Chust;6|Gonzalo Villar;7|Martim Neto;8|Marc Aguado;9|German Valera;10|Fer Nino;11|Josan Ferrandez','https://www.laliga.com/en-GB/laliga-easports/clubs'),
T('racing','Racing Santander','LaLiga',73,'presion','#489663','433','1|Hampus Eriksson;2|Clement Michelin;3|Alvaro Mantilla;4|Pablo Ramon;5|Mario Garcia;6|Sergio Canales;7|Gustavo Puerta;8|Inigo Sainz-Maza;9|Andres Martin;10|Juan Carlos Arana;11|Inigo Vicente','https://www.laliga.com/en-GB/laliga-easports/clubs'),
T('malaga','Malaga CF','LaLiga',72,'vertical','#56a8d5','433','1|Alfonso Herrero;2|Carlos Puga;3|Andres Murillo;4|Alex Pastor;5|Dani Sanchez;6|Izan Merino;7|Carlos Dotor;8|Dani Lorenzo;9|David Larrubia;10|Chupe;11|Haitam Abaida','https://www.laliga.com/en-GB/laliga-easports/clubs')
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
 marseille:[77,79,77,82,79,83,79,79,82,82,77],
 athletic:[85,79,80,80,79,80,80,82,81,81,83],
 betis:[80,78,79,79,78,79,79,83,81,80,80],
 villarreal:[80,78,79,79,78,79,79,82,80,80,80],
 sociedad:[84,77,78,78,77,78,78,79,79,84,79],
 celta:[78,76,77,77,76,77,77,78,78,78,81],
 osasuna:[78,76,77,77,76,77,77,78,78,82,78],
 rayo:[78,76,77,77,76,77,77,78,78,81,78],
 valencia:[78,76,77,77,76,77,77,78,78,78,78],
 espanyol:[77,75,76,76,75,76,76,77,77,77,77],
 sevilla:[77,75,76,76,75,76,76,77,77,77,77],
 deportivo:[76,74,75,75,74,75,75,76,76,76,80],
 getafe:[80,74,75,75,74,75,75,76,76,76,76],
 alaves:[76,74,75,75,74,75,75,76,76,76,76],
 levante:[75,73,74,74,73,74,74,75,75,75,75],
 elche:[74,72,73,73,72,73,73,74,74,74,74],
 racing:[74,72,73,73,72,78,73,74,74,74,74],
 malaga:[76,71,72,72,71,72,72,73,73,73,73]
};
const BENCH_OVR={
 arsenal:[80,79,82,83,81], liverpool:[84,80,80,81,79],
 mancity:[79,79,82,83,81], chelsea:[78,78,82,80,80],
 barca:[80,84,83,84,81], madrid:[81,85,82,82,81],
 atleti:[79,82,81,84,81], bayern:[76,82,81,81,79],
 dortmund:[78,79,79,80,79], leverkusen:[77,80,79,77,79],
 inter:[74,78,80,81,78], milan:[77,78,79,84,79],
 juve:[79,78,78,80,81], psg:[79,83,79,82,83],
 monaco:[79,78,77,80,78], marseille:[79,79,77,80,78],
 athletic:[77,77,78,77],
 betis:[76,76,77,76],
 villarreal:[76,76,77,76],
 sociedad:[75,75,76,75],
 celta:[74,74,75,74],
 osasuna:[74,74,75,74],
 rayo:[74,74,75,74],
 valencia:[74,74,75,74],
 espanyol:[73,73,74,73],
 sevilla:[73,73,74,73],
 deportivo:[72,72,73,72],
 getafe:[72,72,73,72],
 alaves:[72,72,73,72],
 levante:[71,71,72,71],
 elche:[70,70,71,70],
 racing:[70,70,71,70],
 malaga:[69,69,70,69]
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
 marseille:'12|Geronimo Rulli|GK;5|Leonardo Balerdi|CB;6|Valentin Rongier|CM;10|Mason Greenwood|RW;8|Amine Harit|AM',
 athletic:'13|Alex Padilla|GK;14|Aitor Paredes|CB;15|Alex Berenguer|CM;16|Robert Navarro|ST',
 betis:'13|Diego Conde|GK;14|Valentin Gomez|CB;15|Giovani Lo Celso|CM;16|Aitor Ruibal|ST',
 villarreal:'13|Peter Gulacsi|GK;14|Logan Costa|CB;15|Tajon Buchanan|CM;16|Ayoze Perez|ST',
 sociedad:'13|Unai Marrero|GK;14|Aihen Munoz|CB;15|Benat Turrientes|CM;16|Orri Oskarsson|ST',
 celta:'13|Ivan Villar|GK;14|Javi Rueda|CB;15|Pablo Duran|CM;16|Ferran Jutgla|ST',
 osasuna:'13|Aitor Fernandez|GK;14|Jorge Herrando|CB;15|Iker Munoz|CM;16|Raul Garcia de Haro|ST',
 rayo:'13|Dani Cardenas|GK;14|Nobel Mendy|CB;15|Oscar Valentin|CM;16|Sergio Camello|ST',
 valencia:'13|Cristian Rivero|GK;14|Jesus Vazquez|CB;15|Andre Almeida|CM;16|Luis Rioja|ST',
 espanyol:'13|Angel Fortuno|GK;14|Ruben Sanchez|CB;15|Jofre Carreras|CM;16|Kike Garcia|ST',
 sevilla:'13|Fran Gonzalez|GK;14|Juan Iglesias|CB;15|Manu Bueno|CM;16|Alfon Gonzalez|ST',
 deportivo:'13|German Parreno|GK;14|Ximo Navarro|CB;15|Jairo Noriega|CM;16|Zakaria Eddahchouri|ST',
 getafe:'13|Jiri Letacek|GK;14|Abdel Abqar|CB;15|Orel Mangala|CM;16|Martin Satriano|ST',
 alaves:'13|Jesus Owono|GK;14|Nico Valentini|CB;15|Pablo Ibanez|CM;16|Carlos Alena|ST',
 levante:'13|Dani Martin|GK;14|Victor Garcia|CB;15|Hugo Sotelo|CM;16|Paco Cortes|ST',
 elche:'13|Juan Iturbe|GK;14|Dani Martin|CB;15|Fede Redondo|CM;16|Facundo Buonanotte|ST',
 racing:'13|Julen Agirrezabala|GK;14|Jorge Salinas|CB;15|Asier Villalibre|CM;16|Yassir Zabiri|ST',
 malaga:'13|Carlos Lopez|GK;14|Rafita|CB;15|Ramon Enriquez|CM;16|Adrian Nino|ST'
};
const group=role=>role==='GK'?'GK':['RB','LB','CB','RWB','LWB'].includes(role)?'DEF':['DM','CM','AM'].includes(role)?'MID':'ATT';
export function buildBench(team,side){
 const raw=(RESERVES[team.id]||'').split(';').filter(Boolean);const taken=new Set(team.players.map(p=>p.number));
 return raw.map((entry,i)=>{
 const [num,name,role]=entry.split('|');let number=Number(num);while(taken.has(number))number++;taken.add(number);
 const rating=BENCH_OVR[team.id]?.[i]??Math.max(68,team.rating-6);
 return {id:`${side}-bench-${i}`,side,i:11+i,name,number,role,group:group(role),
 anchor:{x:48,y:34},rating,skills:estimatedSkills(name,role,rating),
 x:52.5,y:34,fx:52.5,fy:34,energy:1,card:false,red:false};
 });
}