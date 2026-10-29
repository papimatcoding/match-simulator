# MatchLab · prototipo 0.1

Laboratorio independiente del proyecto FUERA DE GUIÓN. Selección de dos equipos y simulación 11 contra 11 en Canvas 2D con 300 segundos de duración real aproximada a velocidad 1×.

## Arranque

No requiere instalar nada: abre GitHub Pages. Para desarrollo local, sirve la carpeta con `python3 -m http.server 8000`; no funciona abriendo `index.html` directamente por el uso de módulos ES. `npm test` ejecuta las pruebas del motor sin navegador.

## Arquitectura

- `src/teams.js`: plantillas y ratings *estimados*, con 16 equipos de las cinco grandes ligas.
- `src/engine.js`: motor de estado determinista con semilla, 22 agentes, balón en posesión/vuelo, pase espacial, presión, disparo, eventos, estadísticas, fueras de juego, faltas, tarjetas, córners y penaltis. El reloj simulado avanza 18 segundos por cada segundo de representación.
- `src/render.js`: campo y jugadores en Canvas de escala uniforme, independiente de las estadísticas.
- `src/app.js`: selección de equipos, alineaciones, velocidades 0.5×/1×/2×/4×, pausa, descanso, marcador, acta y estadísticas.

**Alcance honesto:** es un primer motor espacial experimental, no una simulación de fútbol comercial. La velocidad del tiempo del partido no corresponde 1:1 con la velocidad física de los jugadores, y todavía faltan sustituciones, saques de banda detallados, ley de la ventaja, manos y las reglas completas del VAR. Algunas reglas (por ejemplo fueras de juego, sanciones, cambios de posesión) están simplificadas. El motor no modifica ni lee los guardados de FUERA DE GUIÓN.

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