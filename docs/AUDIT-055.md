# MatchLab 0.5.5 — Auditoría de ocasiones, paredes y recuperación del balón

## Protocolo y reproducibilidad

- 60 partidos completos, 12 por cada plan táctico local, Barcelona vs Getafe, visitante equilibrado, semillas `seed*157`.
- Mismos clubes y semillas que 0.5.4, pero decisiones y sorteos cambian: no hay acciones individualmente emparejadas.
- Las cifras son **por equipo local y partido** salvo porcentajes. No constituyen calibración frente a ligas reales.
- 90 pruebas de Node (incluidas 6 nuevas respecto a 0.5.4) y auditoría automatizada. Se revisaron balances de equipos de distinta calidad y límites de velocidad.

## Tabla comparativa: 0.5.4 → 0.5.5

| Plan local | Pases | Precisión | Remates | Goles | xG |
|---|---:|---:|---:|---:|---:|
| Presión alta | 88,0 → **147,1** | 87,6% → 83,3% | 8,0 → **13,5** | 1,3 → 2,6 | 1,66 → 2,88 |
| Defensiva | 117,3 → **202,4** | 90,5% → 91,6% | 4,9 → **7,0** | 0,9 → 1,8 | 0,92 → 1,42 |
| Equilibrada | 100,0 → **165,5** | 89,7% → 88,3% | 6,9 → **11,2** | 1,2 → 2,2 | 1,42 → 2,26 |
| Tiki-taka | 133,1 → **187,3** | 88,2% → 87,7% | 5,8 → **11,5** | 1,3 → 2,3 | 1,21 → 2,50 |
| Ofensiva | 69,1 → **134,5** | 87,0% → 82,3% | 7,7 → **13,3** | 1,3 → 3,1 | 1,75 → 2,84 |

### Paredes y entradas al último tercio

| Plan local | Paredes iniciadas/partido | Paredes completadas | Pases hacia último tercio/partido | % completados en último tercio | Tiros tras un pase reciente |
|---|---:|---:|---:|---:|---:|
| Presión alta | 4,5 | 48,1% | 65,9 | 81,2% | 11,3 |
| Defensiva | 3,9 | 42,6% | 79,9 | 95,0% | 6,2 |
| Equilibrada | 6,3 | 42,7% | 75,8 | 87,9% | 8,6 |
| Tiki-taka | 9,9 | 41,2% | 61,3 | 87,4% | 9,3 |
| Ofensiva | 5,7 | 32,4% | 68,3 | 82,7% | 10,3 |

Definiciones: «pase hacia último tercio» significa receptor previsto a 35 m o menos de la portería rival, no necesariamente pase progresivo. «Tiro tras pase reciente» exige remate del receptor original en menos de 40 s del **reloj acelerado de partido**. No atribuye automáticamente una asistencia.

### Motivos de cancelación de paredes, suma de 12 partidos por táctica

| Plan | Bloqueo del segundo pase | Recepción fallida | Pérdida de balón | Reinicio | Caducidad |
|---|---:|---:|---:|---:|---:|
| Presión alta | 17 | 10 | 0 | 1 | 0 |
| Defensiva | 21 | 5 | 1 | 0 | 0 |
| Equilibrada | 30 | 12 | 0 | 1 | 0 |
| Tiki-taka | 56 | 14 | 0 | 0 | 0 |
| Ofensiva | 31 | 15 | 0 | 0 | 0 |

Las sumas cierran: cada pared iniciada termina completada o cancelada exactamente una vez. El problema principal sigue siendo la geometría y el cierre defensivo de líneas de retorno, no la caducidad arbitraria.

### Distribución de tiempo entre fases físicas

| Plan local | Reanudación | Balón en vuelo | Balón dividido | Poseedor | Balón libre sin poseedor |
|---|---:|---:|---:|---:|---:|
| Presión alta | 11,2% | 48,9% | 9,6% | 29,1% | **1,2%** |
| Defensiva | 7,7% | 47,1% | 5,4% | 38,4% | **1,3%** |
| Equilibrada | 9,6% | 49,1% | 7,9% | 31,8% | **1,7%** |
| Tiki-taka | 10,0% | 49,3% | 5,9% | 34,2% | **0,7%** |
| Ofensiva | 11,1% | 49,3% | 9,1% | 29,2% | **1,2%** |

La detección del exceso de posesión muerta fue clave: una versión intermedia de 0.5.5, sin persecución física del balón libre parado, acumulaba aproximadamente 22–50% del tiempo sin poseedor. La versión final reduce ese indicador sin teleportar jugadores ni balón. Se ha añadido una aserción de menos del 10% para futuras versiones.

## Evaluación: mejorías y problemas no resueltos

**Mejoras demostradas por esta batería:**
- Paredes tiki-taka: 28,1% → **41,2%** de éxito (si bien aún se abortan demasiadas por bloqueo).
- Remates tiki-taka: 5,8 → **11,5** por equipo y partido. Los ataques ya llegan con más frecuencia a la conclusión.
- El balón inmóvil sin dueño ya no concentra una gran parte del partido; las recuperaciones se realizan desplazándose en 2D.
- En la auditoría: **0 intercepciones magnéticas**, **0 muestras de futbolistas fuera de los límites**, ningún bloqueo prolongado del poseedor.
- El test agregado de equipos fuertes frente a débiles vuelve a pasar, después de limitar la nueva persecución activa a balones detenidos sin poseedor.

**Problemas reales:**
- **La táctica defensiva registra 202,4 pases**, más que tiki-taka (187,3). Hay un problema de identidad táctica: conserva posesión con demasiada frecuencia a pesar de su planteamiento.
- Los tiros llegan con más regularidad, pero la distribución de xG/goles en solo 12 encuentros por táctica es ruidosa y no calibra resultados profesionales.
- El balón pasa cerca de la mitad del tiempo visual en vuelo (47–49%), mostrando la tensión entre reloj de 18× y velocidad física. Se necesita ajustar la escala temporal antes de evaluar el realismo de distancias.
- El porcentaje de paredes completadas sigue por debajo de la mitad; no debe elevarse artificialmente mediante animaciones falsas.
- Fueras de juego, saques de banda e intercepciones todavía requieren calibración. No se ha validado el simulador en móvil en este parche.

## Próximo parche recomendado: 0.5.6

1. Diferenciar modelos de progresión y conservación por estilo, evitando que una defensa organizada acapare más pases que tiki-taka.
2. Desglosar velocidad de progresión, altura de posesión, distancia recorrida y número real de recuperaciones por segundo visual.
3. Mejorar controles y reacciones del defensor sin fingir intercepciones.
4. Conservar las pruebas de continuidad y consistencia de estadísticas y comparar sobre una muestra mayor con clubes diferentes.
5. Mantener MatchLab **aislado del simulador de carrera** hasta alcanzar criterios de realismo aceptables.

## Ejecutar

```bash
npm test
npm run audit
```
