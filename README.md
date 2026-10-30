# MatchLab 0.3 · Inteligencia táctica colectiva


Laboratorio independiente del proyecto FUERA DE GUIÓN. Selección de dos equipos y simulación 11 contra 11 en Canvas 2D con 300 segundos de duración real aproximada a velocidad 1×.

## Arranque

No requiere instalar nada: abre GitHub Pages. Para desarrollo local, sirve la carpeta con `python3 -m http.server 8000`; no funciona abriendo `index.html` directamente por el uso de módulos ES. `npm test` ejecuta las pruebas del motor sin navegador.

## Arquitectura

- `src/teams.js`: plantillas y ratings *estimados*, con 33 equipos de las cinco grandes ligas (los 20 clubes de LaLiga 2026/27).
- `src/engine.js`: motor determinista con semilla, 22 agentes, balón en posesión/vuelo, pase espacial, desmarques, presión, tiros con desenlace espacial, fueras de juego con línea visible, faltas directas, tarjetas, córners, penaltis, saques de banda, cambios reales y tiempo añadido simplificado. El reloj simulado avanza 18 segundos por cada segundo de representación.
- `src/render.js`: campo y jugadores en Canvas de escala uniforme; traza línea temporal del fuera de juego y distingue desplazamiento de disparos parados.
- `src/app.js`: selección de equipos, alineaciones, velocidades 0.5×/1×/2×/4×, pausa, descanso, marcador, acta y estadísticas.

**Alcance honesto:** es un primer motor espacial experimental, no una simulación de fútbol comercial. La velocidad del tiempo del partido no corresponde 1:1 con la velocidad física de los jugadores, y todavía faltan ley de la ventaja, manos, VAR, sustituciones por lesión, un banquillo completo y reglas arbitrales más sofisticadas. Las sustituciones son automáticas en tres ventanas de juego y se realizan en las interrupciones; los cinco suplentes por club son ejemplos editoriales ilustrativos, **no** banquillos reales verificados. Algunas reglas (por ejemplo fueras de juego, faltas, cambios de posesión) están simplificadas. El motor no modifica ni lee los guardados de FUERA DE GUIÓN.

## Datos

Las 16 alineaciones son **onces propuestos para este experimento**, elegidos de las plantillas oficiales 2026/27. No se garantiza que sean titulares en la vida real. Los ratings y estilos son aproximaciones editoriales para calibrar el motor; **NO son puntuaciones EA SPORTS FC**. Se indican fuentes individuales en `src/teams.js`:

- Premier League: https://www.premierleague.com/en/news/4725682
- Barcelona: https://www.fcbarcelona.com/en/football/first-team/news/4570894/202627-first-team-jersey-numbers-confirmed
- Madrid: https://www.realmadrid.com/es-ES/noticias/futbol/primer-equipo/actualidad/dorsales-del-real-madrid-para-la-temporada-2026-27-10-08-2026
- Atlético: https://www.atleticodemadrid.com/jugadores-primer-equipo/
- DFB: https://datencenter.dfb.de/en/competitions/bundesliga/seasons/2026-2027/teams/borussia-dortmund
- Bayern: https://datencenter.dfb.de/en/competitions/12/seasons/2026-2027/teams/209
- Leverkusen: https://www.bayer04.de/en-us/team/werkself-1/bayer-04-leverkusen
- Inter: https://www.inter.it/en/teams/first-team
- Milan: https://www.acmilan.com/en/teams/men-first-team
- Juventus: https://www.juventus.com/en/teams/first-team-men/squad/
- PSG: https://www.psg.fr/en/mens-football/squad
- Monaco: https://www.asmonaco.com/en/pros/players
- Marsella: https://www.om.fr/en/team/men

## Métricas y criterios para integrar en carrera

Pendiente superar pruebas repetidas de: cero teletransportes del balón durante juego activo, goles = lanzamientos con autor del club correcto, no asistencia en penalti, en saque de banda/parado solo reubicación tras parada, campo sin deformación, cambio de campo al descanso, balance estadístico razonable y buen rendimiento móvil. Se mantiene separado hasta que sea estable.


## Cambios de alfa 0.2

- Pases: selección de receptor ponderada por progreso, espacio, cobertura y riesgo de interceptación; desmarques hacia carriles libres y menor superposición entre jugadores.
- Remates: el balón de una parada termina **por delante** de la línea de gol, en las proximidades del portero. El gol y los tiros desviados tienen trayectorias distintas.
- Banda: los despejes y malos controles cercanos a la línea provocan un vuelo hacia fuera, seguido del saque de banda del equipo contrario; no existe fuera de juego en la recepción directa.
- Córner: cinco o más futbolistas atacantes entran en el área; centro y cabezazo o remate son acciones sucesivas.
- Faltas: el lanzador puede tirar directamente desde una distancia razonable y la barrera se prepara durante la interrupción. No hay asistencia en un gol directo.
- Cambio: rotaciones automáticas en interrupciones alrededor de los minutos 56, 68 y 79, con sustitución efectiva del jugador que ocupa la demarcación.
- Final de periodo: el árbitro deja completar un lanzamiento o ataque muy peligroso, con una ampliación máxima deliberadamente corta. **No reproduce el descuento oficial**, que se calcula según otras circunstancias.
- Offside: se mide la posición al salir el pase; se pita cuando el receptor interviene. Una línea temporal ayuda a comprender la decisión. La regla de interferencia de un atacante que no recibe directamente sigue simplificada.
- Automatización: pruebas unitarias y de múltiples partidos para impedir goles sin tirador, asistencias en penaltis y saques imposibles.

Referencia de las reglas aplicadas de forma simplificada: [IFAB Ley 7](https://www.theifab.com/laws/latest/the-duration-of-the-match/), [IFAB Ley 11](https://www.theifab.com/laws/latest/offside/), [IFAB Ley 17](https://www.theifab.com/laws/latest/the-corner-kick/).

## Cambios de alfa 0.3.0

- **Tiros razonados**: oportunidad estimada por distancia, ángulo, marcadores en la línea y calidad de remate. Disminuyen los tiros lejanos sin sentido; los atacantes consideran compañeros mejor colocados. El desenlace y la trayectoria siguen vinculados.
- **Pases más intencionales**: más valor a progresar sin regalar el balón, teniendo en cuenta cobertura, presión, longitud y fuera de juego. Se evitan tanto la concatenación de pases exclusivamente hacia atrás como los pelotazos absurdos a una zona tapada.
- **Juego sin balón**: extremos conservan amplitud, atacantes temporizan rupturas, mediocampistas crean triángulos y dos defensores presionan con intensidades distintas. Separación posicional adicional.
- **Faltas directas**: barrera de cuatro situada a 9,15 m del balón, orientación hacia la portería, con otros defensores asignados a marcajes sobre potenciales rematadores (simplificado). Se respeta el metro de separación de la barrera.
- **Saque de centro real**: ambos equipos se colocan en su mitad, balón en el punto central, lanzador y receptor disponibles, pase animado al reanudar; círculo resaltado con etiqueta para reconocer la reanudación.
- **Equilibrio del laboratorio**: en una batería de 60 partidos distintos, alrededor de 11,6 remates y 2,3 goles por partido. Son cifras de la simulación, no estadísticas de una liga.
- **Regresión**: cuatro nuevas pruebas de toma de decisiones, barrera y marcajes, saque de centro y separación de los futbolistas.

Referencia: [IFAB Regla 13](https://www.theifab.com/es/laws/latest/free-kicks/) y [Regla 8](https://www.theifab.com/laws/latest/the-start-and-restart-of-play/).

**Limitación:** un modelo espacial simple sigue siendo distinto a un simulador 3D profesional. La elección del disparo y del pase es heurística; la continuidad de los movimientos y de las interrupciones debe seguirse validando visualmente en diversos navegadores.
## Actualización 0.3.0 · ritmo, definición y LaLiga

- **33 clubes**, con los 20 clubes reales que disputan LaLiga 2026/27. Los 17 onces adicionales son selecciones ilustrativas de futbolistas vinculados a sus plantillas; los dorsales de prueba y las valoraciones individuales estimadas no son fichas oficiales de EA.
- La toma de decisiones es más rápida, con velocidades de ejecución de pases y remates ajustadas. A velocidad 1×, un partido sigue durando aproximadamente cinco minutos.
- Se elimina la pérdida de balón aleatoria que mandaba demasiados pases correctos a la banda. Los errores de pase se relacionan con habilidad, distancia y presión y pueden derivar en una intercepción visible.
- Los delanteros rematan con más decisión cuando tienen una ocasión clara; los tiros lejanos o tapados se desincentivan.
- Los córners pueden originarse en despejes y desvíos de disparos; sus probabilidades se recalibraron para mantener resultados creíbles.
- El motor se ha comparado en partidos repetidos entre clubes fuertes y modestos para comprobar que los atributos influyan. Los resultados individuales siguen siendo aleatorios.

**Fuentes de referencia:** [LaLiga - clubes 2026/27](https://www.laliga.com/en-GB/laliga-easports/clubs), [Flashscore - plantillas 26/27](https://www.flashscore.es/noticias/futbol-laliga-plantillas-20-equipos-temporada-26-27/2qiJDXlB/), [FC 27 clubes y valoraciones](https://fafifa.com/league/la-liga). Las alineaciones, dorsales e índices numéricos de esta alfa son configuraciones de simulación, no actas ni datos oficiales en tiempo real.

## 0.3 · Cinco identidades reales en el motor

Cada equipo parte de la filosofía de su club (posesión/tiki-taka, ofensiva/vertical, bloque bajo/defensiva o presión). La táctica se puede elegir por separado para local y visitante **antes del partido y durante el encuentro**. Las cinco opciones: ofensiva, equilibrada, defensiva, presión alta y tiki-taka. No son solo etiquetas: influyen en la anchura, profundidad, cantidad de futbolistas que presionan, carrera de los atacantes, ritmo de decisiones y valoración de líneas de pase. Desde el minuto 72, ir perdiendo aumenta la urgencia y, desde el 78, ir ganando favorece proteger la ventaja.

Cambios de inteligencia sin balón: llegadas de centrocampistas desde segunda línea, diagonales del extremo del lado débil, un central marcando al delantero con cobertura zonal del resto y variación de receptores en saques de esquina. El cabezazo tiene valoración de precisión diferente al remate con el pie, y se evalúa la calidad de la ocasión. Se conserva la misma pelota física para resolver tiros, goles, pérdidas, córners y remates. Datos y resultados del laboratorio no constituyen estadísticas oficiales de EA.
