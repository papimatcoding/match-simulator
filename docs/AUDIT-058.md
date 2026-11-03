# MatchLab 0.5.8 — Auditoría del parche de jugabilidad

**Objetivo del cambio:** mejorar las críticas detectadas al jugar: remates demasiado lejanos, roscas exageradas, córneres sin causa visible, defensores que no alcanzan al portador, posesiones pasivas y partidos demasiado largos. Añadir familiaridad **por jugador y por rol**, sin asociarla automáticamente al OVR.

## Protocolo

118 pruebas automáticas completas. 60 partidos de 11 contra 11 reproducibles: 12 semillas Barcelona–Getafe por táctica local, visitante equilibrada, semillas `seed*157`. La misma muestra permite comparar orientaciones, pero el cambio de escala a 2 minutos por parte no preserva las mismas jugadas individuales de la 0.5.7.

`MATCH_CLOCK_SCALE = 22.5`: 45 minutos ficticios por cada 120 segundos reales a velocidad 1×.

| Plan del local | Duración real por parte | Pases/partido | % completados | % atrás | Conducciones/partido | Metros progresados conduciendo | Remates/partido | Goles/partido | Córneres/partido |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Presión alta | 2,01 min | 80,9 | 67,1% | 18,2% | 28,3 | 173,4 | 9,8 | 2,2 | 0,7 |
| Defensiva | 2,02 min | 69,3 | 73,4% | 19,6% | 28,6 | 202,8 | 6,9 | 0,9 | 0,3 |
| Equilibrada | 2,01 min | 81,6 | 65,5% | 20,3% | 27,3 | 182,8 | 7,8 | 2,5 | 0,8 |
| Tiki-taka | 2,01 min | 90,3 | 71,5% | 18,0% | 25,9 | 171,7 | 9,4 | 2,5 | 0,7 |
| Ofensiva | 2,01 min | 81,1 | 63,2% | 17,9% | 23,7 | 146,7 | 10,4 | 1,6 | 0,6 |

**Interpretación:** los partidos son más cortos, pero la cantidad absoluta de pases se reduce. Esto no equivale a una simulación de posesión estadísticamente real de 90 minutos; son unos 4 minutos de representación visual comprimida. El tiro y el pase dependen de contexto espacial, pero hay compromisos para preservar el ritmo. El plan ofensivo solo completa el 63,2% de pases, debido a decisiones más verticales, y ese dato merece futura calibración.

## Resultados y comprobaciones

- **Conducción:** entre 23,7 y 28,6 decisiones de carrera con balón por partido local, con 146–203 metros de avance registrable. Se elige más frecuentemente ante compañeros que solo ofrecen pases atrás y cuando existe un carril físicamente libre.
- **Presión:** el primer defensor tiene como objetivo el rango de contacto real, no permanecer a 2–5 metros permanentemente. Robos limitados por distancia, velocidad y atributos técnicos; se ajustó su frecuencia tras detectar pérdidas excesivas.
- **Tiros lejanos:** 0 remates irreales de distancia mayor a 27 metros sin ser faltas directas ni penaltis en los 60 partidos. Los cabezazos tras córner ya no se fuerzan si el receptor está fuera del área de remate.
- **Córneres:** 0 infracciones registradas de último toque en los córneres por desvío de portero. Un tiro fuera sin toque defensivo produce saque de puerta, nunca un córner aleatorio. Una parada controlada genera posesión del portero. Sigue siendo un sistema discreto: todavía hay muy pocos córneres por encuentro y faltan desvíos de defensas más elaborados.
- **Roscas:** reducida la curvatura lateral máxima del balón a aproximadamente 0,97 m, en lugar de 2,65 m. La curva conserva principio y final exactos y no aumenta automáticamente la probabilidad de gol.
- **Roles +/++:** `roleFamiliarity` es un mapa por jugador y rol exacto. Por ejemplo, un extremo interior puede tener + y extremo abierto Base. Un jugador con 99 OVR puede tener Base en otro rol; ningún atributo concede automáticamente +/++. Se añade **Cazagoles** como nueva opción para delantero. Los perfiles iniciales son **estimaciones editoriales sintéticas**, no una importación verificable de datos de FC 27.

## Resultados generales

118/118 pruebas aprobadas; 60/60 encuentros completos con pasos físicos legales y auditoría de balón dividido. Se mantiene compatibilidad del motor 2D con los módulos importados por FUERA DE GUIÓN 11.

## Límites conocidos

La distribución de remates con rosca todavía es experimental (aproximadamente 4–6 por encuentro local), incluso después de reducir la curva visual. El total de córneres es inferior al fútbol profesional; no se deben añadir por sorteo para maquillarlo. El partido no dispone todavía de todas las reglas avanzadas, bases de datos verificadas de futbolistas reales ni inteligencia de desmarque equivalente a una simulación profesional.

La carrera **FUERA DE GUIÓN 11** utiliza esta versión del motor a través de módulos locales y mantiene los guardados antiguos; el trabajo en ambos repositorios se valida de forma independiente.

## Reproducción

```sh
npm test
npm run audit
```
