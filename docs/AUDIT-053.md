# MatchLab 0.5.3 — Auditoría de inteligencia espacial y control

## Protocolo

60 partidos completos con 0.5.3 (12 semillas por cada plan local), Barcelona–Getafe, plan visitante equilibrado. Comparación con los 60 partidos documentados de 0.5.2 bajo las mismas semillas, pero el orden de los sorteos cambia: **no son jugadas emparejadas**. Los indicadores de la tabla son por equipo local y partido, excepto porcentajes. Los datos no son una calibración frente a fútbol real.

## Diferencias introducidas

- Dos/tres defensores pueden proteger líneas de pase concretas según la posición de los receptores; durante un vuelo solo anticipan puntos alcanzables en el tiempo disponible.
- Un control defectuoso puede producir un balón suelto que se desplaza y frena, con salida por la primera línea que cruza y saque al rival del último tocador. No se teletransporta el balón ni se inventa un saque sin cruce físico.
- Los atacantes pueden superar ligeramente la línea de fuera de juego al medir mal una ruptura. Los pasadores pueden no advertir un adelantamiento marginal, aunque siguen descartando posiciones claramente ilegales.
- El resultado de un disparo respeta la definición de xG como **probabilidad incondicional** de marcar: si la precisión a puerta es `p`, la probabilidad condicional de gol entre tiros a puerta es `xG/p` (limitada a 0,94). Antes se multiplicaba por la precisión dos veces.

## Resultados: 0.5.2 → 0.5.3

| Plan local | Pases/partido | % completados | Remates/partido | Goles/partido | xG/partido |
|---|---:|---:|---:|---:|---:|
| Presión alta | 80,3 → 80,9 | 85,1 → 87,3 | 9,8 → 8,3 | 1,33 → 1,8 | 2,15 → 1,6 |
| Defensiva | 118,8 → 122,9 | 88,8 → 91,1 | 7,0 → 4,2 | 1,33 → 1,1 | 1,68 → 0,8 |
| Equilibrada | 90,5 → 86,0 | 85,9 → 88,4 | 10,6 → 6,6 | 1,42 → 1,1 | 2,21 → 1,2 |
| Tiki-taka | 100,9 → 110,5 | 87,0 → 88,4 | 11,5 → 6,9 | 1,58 → 2,2 | 2,86 → 1,6 |
| Ofensiva | 84,0 → 69,2 | 83,4 → 87,3 | 11,2 → 7,4 | 2,08 → 1,7 | 2,43 → 1,5 |

Los cambios de volumen y goles no son necesariamente mejoras: las defensas y los balones divididos interrumpen ataques. **En particular, la caída de remates de varios planes es una regresión táctica que debe investigarse**, no ocultarse.

## Comportamiento que sigue lejos del fútbol real

| Indicador en 60 partidos | Observación |
|---|---|
| Fueras de juego del local | 3 en 60 partidos, frente a 0 en la auditoría anterior |
| Saques de banda del local | 3 en 60 partidos, frente a 0 |
| Intercepciones del local | Entre 1,1 y 1,8 por partido según táctica; siguen muy escasas |
| Pases del local | Entre 69 y 123 por partido; ritmo claramente insuficiente |
| Goles / xG del local | Entre 0,90 y 1,39 según plan, muy inestable con 12 partidos |
| Balones divididos del local | Entre 8,3 y 12 por partido |
| Tiempo máximo inmóvil del portador | 0,8–0,96 s |

La comparación de fuera de juego y bandas indica que ahora **pueden suceder de manera orgánica**, no que su frecuencia sea ya realista. Los partidos siguen sin tener controles orientados complejos, rebotes de balón con varias superficies, visión táctica humana ni aprendizaje automático.

## Auditoría automatizada adicional

`npm run audit` conserva las métricas anteriores y añade:

- Tasa de pases completados por **distancia** (corto ≤15 m, medio 15–30 m, largo >30 m) y **presión sobre el pasador** (rival a menos de 3 m, de 3 a 7 m o más de 7 m).
- Calibración de goles observados frente a xG sumado por **bandas de probabilidad de tiro** (baja, media y alta).
- Fueras de juego señalados al lanzar el pase frente a los finalmente sancionados, saques de banda del rival, salidas tras control defectuoso, intercepciones de vuelo y robos terrestres por separado.
- Posiciones físicas, distancia entre compañeros, anchura del bloque, posesión, progresión, combinaciones, fatiga implícita en velocidad y continuidad de la simulación.
- Aserciones de 60 partidos terminados, jugadores dentro del campo, ningún robo magnético, pases completados ≤ intentados, y portadores sin bloqueo prolongado.

**Próximos objetivos medibles:** reducir el retroceso en remates sin devolver intercepciones mágicas; aumentar anticipación real; introducir controles orientados y saques más frecuentes; y rediseñar el factor de tiempo del reloj para que el ritmo de pases y las distancias recorridas sean compatibles.

## Reproducibilidad

```bash
npm test
npm run audit
```

El workflow de GitHub Pages ejecuta ambos comandos antes de publicar. El informe representa una auditoría de regresión del motor, no una validación estadística contra datos externos.
