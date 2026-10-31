# MatchLab 0.5.5 — Paredes alcanzables y ocasiones de ataque





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

## Cambios de alfa 0.4.0

- **Tiros razonados**: oportunidad estimada por distancia, ángulo, marcadores en la línea y calidad de remate. Disminuyen los tiros lejanos sin sentido; los atacantes consideran compañeros mejor colocados. El desenlace y la trayectoria siguen vinculados.
- **Pases más intencionales**: más valor a progresar sin regalar el balón, teniendo en cuenta cobertura, presión, longitud y fuera de juego. Se evitan tanto la concatenación de pases exclusivamente hacia atrás como los pelotazos absurdos a una zona tapada.
- **Juego sin balón**: extremos conservan amplitud, atacantes temporizan rupturas, mediocampistas crean triángulos y dos defensores presionan con intensidades distintas. Separación posicional adicional.
- **Faltas directas**: barrera de cuatro situada a 9,15 m del balón, orientación hacia la portería, con otros defensores asignados a marcajes sobre potenciales rematadores (simplificado). Se respeta el metro de separación de la barrera.
- **Saque de centro real**: ambos equipos se colocan en su mitad, balón en el punto central, lanzador y receptor disponibles, pase animado al reanudar; círculo resaltado con etiqueta para reconocer la reanudación.
- **Equilibrio del laboratorio**: en una batería de 60 partidos distintos, alrededor de 11,6 remates y 2,3 goles por partido. Son cifras de la simulación, no estadísticas de una liga.
- **Regresión**: cuatro nuevas pruebas de toma de decisiones, barrera y marcajes, saque de centro y separación de los futbolistas.

Referencia: [IFAB Regla 13](https://www.theifab.com/es/laws/latest/free-kicks/) y [Regla 8](https://www.theifab.com/laws/latest/the-start-and-restart-of-play/).

**Limitación:** un modelo espacial simple sigue siendo distinto a un simulador 3D profesional. La elección del disparo y del pase es heurística; la continuidad de los movimientos y de las interrupciones debe seguirse validando visualmente en diversos navegadores.
## Actualización 0.4.0 · ritmo, definición y LaLiga

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

## Inteligencia 0.4

Nuevo módulo `src/roles.js`: 16 roles funcionales con enfoque ofensivo, equilibrado y defensivo. Familiaridad Base, Rol+ o Rol++ estimada por encaje, media y atributos del futbolista; no son datos propietarios ni oficiales de EA FC. Configurables por jugador en la pantalla de alineaciones.

Funciones: falso nueve entre líneas, delantero avanzado que rompe, lateral invertido dentro, lateral ofensivo desdoblando, todoterreno llegando al área, pivote de cobertura, extremos que atacan intervalos, centrales que anticipan o cubren. Son órdenes espaciales condicionadas por la fase y el contexto, no bonificaciones nominales.

Corrección de estancamientos: el poseedor elige alternativa segura cuando no encuentra pase de progresión; si no avanza durante 1,6 s, intenta reciclar con un compañero o conducir hacia una zona despejada. Se muestra un modo de análisis IA: seleccionar al futbolista en el campo revela rol, intención, decisión y motivo y dibuja objetivos posicionales.

Córners y cabezazos utilizan perfiles de posición y habilidad aérea estimada. Se mantienen el motor físico de trayectorias, estadísticas derivadas y modos tácticos 0.3. Las pruebas automáticas controlan continuidad, decisiones y diferencias de roles.

Se trata de heurísticas individuales y colectivas experimentales, no un simulador de aprendizaje automático ni una representación completa de todos los reglamentos.

## Parche 0.4.1 (30 de octubre de 2026)

- Auditoría automática de nombres de los 33 clubes sobre onces y banquillos: **0 duplicidades entre clubes**; evita que un fichaje permanezca como suplente del club de origen. Revisión dirigida a FC Barcelona, PSG, Liverpool, Chelsea, Dortmund y Elche, basada en fuentes oficiales de 2026/27.
- Ferran Torres solo en PSG; Ronald Araujo y Bradley Barcola solo en Liverpool; Enzo Fernandez solo en Manchester City; Karim Adeyemi solo en FC Barcelona. Ciertos banquillos se mantienen ilustrativos, no corresponden necesariamente a una convocatoria real de una jornada.
- Sustituciones: cuando el motor realiza un cambio durante una interrupción aparece un panel de entrada y salida, club, dorsales y minuto; el reloj y la acción se congelan **2,85 segundos reales**, independientemente de la velocidad 0,5×–4×. Si ambos equipos cambian en la misma interrupción se muestran juntos. Tras la presentación continúa la misma jugada. Los cambios siguen modificando los jugadores activos y las estadísticas.
- La validación CI incluye una prueba automática de consistencia de propiedad de jugadores y de la presencia del panel visual.

Fuentes de plantillas: [Barça 2026/27](https://www.fcbarcelona.com/en/football/first-team/news/4570894/202627-first-team-jersey-numbers-confirmed), [PSG 2026/27](https://www.psg.fr/en/mens-football/squad/season/2026-2027), [Liverpool 2026/27](https://www.liverpoolfc.com/news/liverpool-submit-premier-league-squad-list-2026-27), [Chelsea](https://www.chelseafc.com/en/teams/mens-profiles), [BVB](https://www.bvb.de/de/en/teams/football/first-team.html), [Elche](https://www.elchecf.es/noticias/el-elche-cf-presenta-a-sus-cuatro-ultimas-incorporaciones).

Quedan por verificar exhaustivamente los nombres y dorsales de los 33 onces y banquillos; las plantillas son recortes manuales, no sincronización en directo con una API deportiva.

## 0.4.2 — Lectura de las ocasiones y líneas de pase

- Un atacante en una ocasión frontal clara, a menos de 14 m, sin defensores entre él y la portería, **remata en vez de buscar un pase atrás**. La precisión de remate en el mano a mano también tiene un tratamiento específico.
- Los defensores y el portero no toman decisiones de disparo desde campo propio; los jugadores defensivos no fuerzan tiros lejanos poco realistas.
- Los jugadores atascados analizan el corredor de pase: si no hay vía segura, pueden conducir buscando espacio o despejar desde la zona defensiva. El motor evita reciclar repetidamente pases obstruidos.
- Centro del campo y extremos generan apoyos diferenciados a izquierda y derecha del portador; el delantero busca la zona de remate cuando el balón se acerca al área.
- Las estadísticas salen de la misma pelota y los mismos eventos. La versión no incorpora física 3D ni aprendizaje automático.
- Se conservan las plantillas revisadas y la detención visual de los cambios introducidas en 0.4.1.

Las reglas de decisión de MatchLab son aproximaciones futbolísticas propias, no los algoritmos de EA Sports FC.

## Versión 0.5.0 · Combinaciones y presión coordinada

- Nuevo módulo `src/combinations.js` con una intención compartida de tres futbolistas: iniciador, apoyo para pared y corredor al espacio. El corredor se mueve con el motor físico; el balón viaja por la trayectoria real, sin teletransportes. Cuando el apoyo recibe y la línea sigue libre, devuelve el balón hacia una posición alcanzable del tercero.
- La jugada se cancela si se pierde el balón, termina el tiempo de la intención, un jugador deja de estar disponible o aparece un defensor cerrando la devolución. Se comprueba fuera de juego antes de ejecutar el pase.
- La probabilidad de organizar paredes depende de la identidad táctica: tiki-taka más frecuente, ofensiva intermedia, defensiva poco frecuente. En presión alta un segundo defensor busca interceptar el pase probable en lugar de perseguir exactamente al mismo poseedor.
- Los receptores de pases en vuelo priorizan llegar al balón. Las instrucciones generales de posición ya no deben hacer que abandonen la recepción.
- La interfaz muestra **paredes iniciadas** y **completadas** en estadísticas; el historial relata las jugadas que se preparan y las que funcionan. El modo «Analizar IA» identifica la intención de correr o devolver.
- Se conserva el parche 0.4.1 de plantillas y sustituciones y el 0.4.2 de decisiones contextuales.

**Límites conocidos:** las paredes representan una primera coordinación ofensiva explícita, no un modelo táctico profundo de todos los jugadores. La precisión estadística de los partidos necesita continuar calibrándose y los esquemas de plantillas no se sincronizan en tiempo real.

## 0.5.1 — Primera etapa del motor colectivo 2D
- Cuatro fases compartidas según posesión y tiempo: ataque organizado, transición ofensiva, defensa organizada y transición defensiva. Los objetivos se calculan por tick, sin teletransportes.
- La presión tras pérdida incorpora hasta tres jugadores próximos para planes agresivos, mientras el resto repliega; la táctica defensiva prioriza un primer temporizador y protección central. Los centrales no persiguen indiscriminadamente.
- Tras recuperar, atacantes rompen al espacio, mediocampistas acompañan y el pivote protege. Las carreras respetan la línea de fuera de juego. En ataque organizado desde campo propio, pivote y centrales dan salida; en defensa organizada se ajusta la compactación.
- La barra táctica y «Analizar IA» muestran fases y zonas; las recuperaciones rápidas tras pérdida se cuentan solo si la posesión cambia realmente dentro de la ventana y a menos de 22 metros.
- Las jugadas a balón parado reinician el estado colectivo. Los ratings siguen siendo revisión 0.5.0, sin cambios de atributos.
- Próximos pasos: lectura predictiva de líneas de pase, coberturas y calibración con partidos reales. El motor es heurístico y no reproduce código propietario de EA.

## 0.5.5 — Recepciones reales, errores de pase e intercepciones espaciales
- El balón ya no se desvía automáticamente hacia un rival escogido por sorteo: solo puede interceptarlo un jugador que alcance su trayectoria real, incluida la llegada.
- El error de pase depende de distancia, técnica y presión; las trayectorias se recortan al cruzar una línea real del campo. Un pase no se cuenta como completado hasta que el receptor controla físicamente la pelota. Los controles difíciles pueden dejar balones divididos.
- La presión alta ya no aumenta la velocidad de carrera sin límite: máximo 6,7 m/s para futbolistas de campo. Se refuerza moderadamente el riesgo de robo a un portador acosado.
- **Auditoría reproducible:** `npm run audit` simula 60 partidos completos (12 por cada plan táctico), registra más de 25 indicadores por plan y valida invariantes. El despliegue ejecuta pruebas y auditoría antes de publicar. Resultados y límites: [Auditoría 0.5.5](docs/AUDIT-052.md).
- **Limitaciones que siguen abiertas:** fueras de juego y saques de banda demasiado escasos; pocas recuperaciones reales tras presión; ritmo bajo de pases; xG aún poco calibrado. No presentar esta versión como motor realista acabado.

## 0.5.5 — Parche de inteligencia espacial y controles imperfectos

- **Anticipación defensiva**: hasta dos coberturas de líneas de pase (tres en presión alta), asignadas según posiciones reales y amenazas. En vuelo, un defensor solo busca un punto de corte si todavía puede llegar a tiempo con su velocidad máxima; no hay teletransporte.
- **Controles fallidos y balón dividido**: un control defectuoso puede dejar el balón rodando, perder velocidad por fricción y salir del campo por una línea que realmente cruza. Se concede el saque al equipo contrario al último toque. El receptor que falla no puede recuperar el balón instantáneamente en el siguiente fotograma.
- **Desmarques y fuera de juego**: los delanteros pueden medir mal la línea durante una ruptura. El pasador tolera errores marginales de lectura, pero no elige grandes posiciones adelantadas.
- **Calibración del remate**: la probabilidad de gol condicionada a que el disparo vaya a puerta se calcula como xG / probabilidad de ir a puerta, evitando multiplicar por la precisión dos veces. Es una corrección matemática, no una calibración externa con datos profesionales.
- **Auditoría ampliada**: `npm run audit` informa de acierto de pases por longitud y presión, goles observados y esperados por intervalo de xG, recuperaciones por tipo, salidas reales de balón dividido y saques del rival. `tests/ball-053.test.js` cubre las nuevas reglas.

**Limitaciones:** las intercepciones siguen siendo escasas, los fueras de juego y saques de banda aún ocurren con frecuencia muy inferior a un partido real, y la velocidad del reloj no está calibrada con el ritmo real de pases. Los indicadores no demuestran realismo global. Ver [Auditoría 0.5.5](docs/AUDIT-053.md).


## MatchLab 0.5.5 — Control orientado y toma de decisiones

- Nueva capa independiente `src/tempo-control.js`: tiempos de decisión según presión, ubicación y tempo táctico.
- Tras una recepción completada, un futbolista de campo puede orientar el control a un espacio real: define un destino de conducción, **no teletransporta** al futbolista ni al balón.
- Nuevos desmarques de extremos y mediapuntas hacia carriles libres, limitados por la segunda línea defensiva, distancia alcanzable, presión rival y separación entre compañeros.
- Se reduce el tiempo de decisión tras recepción y la espera de conducción sin oposición, pero el reloj acelerado del motor sigue igual (18 s simulados / 1 s real).
- Los parámetros son experimentales y deben compararse con 0.5.3 mediante auditoría de 60 partidos. No se integran guardados de FUERA DE GUIÓN.
