# MatchLab 0.5.6 — Auditoría de ritmo, disputas colectivas y decisiones del entrenador

## Protocolo

- 60 partidos 11 contra 11 completos: 12 semillas por plan local, Barcelona–Getafe, visitante equilibrado; `seed*157`.
- Valores del local por partido salvo porcentajes. Se usan las mismas semillas que en 0.5.5, **pero los eventos no son comparables jugada a jugada** al cambiar las decisiones y los sorteos.
- 98 pruebas unitarias e integradas completadas. Se verifican límites del campo, duración, pase completo, atribución de goles, combinaciones, carreras, sustituciones, duelos físicos y ausencia de intercepción prefijada.
- Modo de referencia: `MATCH_CLOCK_SCALE=13.5`, equivalente a 45 minutos simulados por 200 segundos reales (3 min 20 s/parte, sin tiempo de pausa manual).

## Comparación 0.5.5 → 0.5.6

| Plan local | Pases/partido | Precisión | Remates/partido | Goles/partido | xG/partido |
|---|---:|---:|---:|---:|---:|
| Presión alta | 147,1 → **186,7** | 83,3% → 82,4% | 13,5 → **16,3** | 2,6 → 2,9 | 2,88 → 3,54 |
| Defensiva | 202,4 → **201,0** | 91,6% → 87,9% | 7,0 → **8,5** | 1,8 → 1,9 | 1,42 → 1,64 |
| Equilibrada | 165,5 → **185,7** | 88,3% → 85,8% | 11,2 → **13,4** | 2,2 → 1,8 | 2,26 → 2,83 |
| Tiki-taka | 187,3 → **227,6** | 87,7% → 84,8% | 11,5 → 10,9 | 2,3 → 1,9 | 2,50 → 2,15 |
| Ofensiva | 134,5 → **164,0** | 82,3% → 79,3% | 13,3 → **16,5** | 3,1 → 3,3 | 2,84 → 3,50 |

**Interpretación:** no todos los resultados mejoran. El tiki-taka realiza más pases pero **baja ligeramente en remates y xG** respecto a 0.5.5. Los 12 partidos de cada plan no permiten afirmar que los goles observados constituyan una mejora estadísticamente significativa.

## Medidas nuevas

| Plan | Minutos reales por parte (1×) | Balones libres recuperados/partido | Recuperaciones disputadas (rivales en contacto)/partido | Aspirantes asignados por muestra de balón dividido | Sustituciones local/visitante |
|---|---:|---:|---:|---:|---|
| Presión alta | 3,34 | 23,8 | 0,6 | 3,11 | 2,3 / 1,0 |
| Defensiva | 3,36 | 17,6 | 0,2 | 3,09 | 1,7 / 1,1 |
| Equilibrada | 3,36 | 18,8 | 1,1 | 3,13 | 1,9 / 1,0 |
| Tiki-taka | 3,35 | 25,6 | 0,5 | 3,09 | 1,9 / 0,8 |
| Ofensiva | 3,35 | 23,2 | 1,2 | 3,10 | 2,8 / 1,3 |

**Definiciones:** «recuperación disputada» cuenta casos donde ambos equipos tenían al menos un futbolista físicamente en el radio de 1,40 m en el instante del control. Los otros jugadores siguen pudiendo presionar la jugada y disputar rechaces. «Aspirantes asignados» se calcula promediando muestras durante balón dividido y puede incluir el primer fotograma, anterior a la actualización de asignaciones; cada equipo puede asignar dos perseguidores y un tercer hombre que protege la segunda jugada.

Las ventanas de sustitución medias por local/visitante se sitúan aproximadamente entre 1,08 y 1,67 por equipo. Las reglas automáticas verifican un máximo de 5 cambios, 3 ventanas en juego y descanso libre. No se obliga a realizar cambios simultáneos por ambos equipos. Los banquillos, de momento, son ejemplos de 4–5 reservas y no están validados como convocatorias reales.

## Comportamientos implementados

1. **Ritmo:** se desacopla el avance del reloj a un factor 13,5× y se amplía el tiempo de decisión en situación sin presión. Un control orientado no se convierte inmediatamente en otro pase obligado.
2. **Disputas y coberturas:** dos jugadores de cada equipo persiguen dinámicamente el balón móvil o parado y un tercero protege el rechace. Se recalculan trayectorias, con velocidad física limitada. El ganador nunca se decide antes de estar a 1,40 m o menos de la pelota.
3. **Intercepciones:** se corrige el campo técnico de entrada (`tackle`), pero cada defensor solo puede intentar interceptar una vez por pase y únicamente cuando atraviesa su espacio físico. Esto resuelve una regresión inicial que hacía caer de forma excesiva la precisión.
4. **Fatiga y entrenador:** el cansancio ya no cae al mínimo antes del descanso. Cada equipo evalúa si conviene sustituir según estado físico, amonestaciones y marcador. Las sustituciones se hacen en interrupciones y se respetan límites y ventanas.
5. **Final de periodo:** se amplía la tolerancia acotada para completar jugadas de peligro. Un remate en vuelo o un penalti pendiente no se interrumpe por el silbato automático.

## Seguridad física / regresiones

- 98/98 pruebas automáticas aprobadas.
- 60/60 partidos completos, sin futbolistas fuera de los límites.
- **0 intercepciones prefijadas o magnéticas** según el indicador de auditoría.
- Ningún contacto ganador a más de **1,40 m** del balón.
- El juego mantiene menos de 10% de fotogramas de balón libre inmóvil sin poseedor; en esta tanda se aproxima a cero.
- El algoritmo mantiene el límite de velocidad de los desplazamientos de perseguidores y no teletransporta a los jugadores durante juego activo.

## Riesgos pendientes

- Los contactos simultáneos en radios estrechos son escasos (0,2–1,2 por partido): la coordinación visual de varios recuperadores debe revisarse manualmente con capturas/vídeos.
- La identidad defensiva aún incluye 201 pases locales por partido: diferencia demasiado pequeña frente a los 227,6 del tiki-taka.
- La simulación mantiene el reloj acelerado: velocidad física, posesión de balón y tiempo de partido **no son equivalentes** a un juego de fútbol continuo de 90 minutos.
- No hay simulación completa de árbitro, ley de la ventaja, descuentos por incidentes, lesión, calendario de convocatorias o disparos con efecto estadístico. No se afirma haberlos implementado.
- La base de datos de atributos reales/inventados y los remates con rosca siguen pendientes de su propia fase de diseño y validación.

## Próxima fase

Priorizar **simulación visual de disputas y controles**, identidad defensiva frente a tiki-taka, árbitro con ventaja, datos reales/inventados y disparos con efecto. No integrar todavía directamente en FUERA DE GUIÓN.

## Reproducción

```bash
npm test
npm run audit
```
