# MatchLab 0.5.2: auditoría de 120 partidos (2D)

**Método:** 60 partidos con 0.5.1 y 60 con 0.5.2. Barcelona contra Getafe, visitante equilibrado, cinco planes locales, 12 semillas por plan (157 a 1884, paso 157). Las versiones consumen aleatoriedad de forma diferente: se comparan distribuciones, no secuencias idénticas. No hay calibración con partidos reales.

## Comparación (por equipo y partido)

| Plan | Pases completados 0.5.1 → 0.5.2 | Balones divididos | Intercepciones | Recuperaciones | Pases intentados |
|---|---:|---:|---:|---:|---:|
| Presión alta | 92,9 % → 85,1 % | 0 → 11,6 | 16,8 → 1,8 | 16,8 → 4,8 | 132,4 → 80,3 |
| Defensiva | 93,6 % → 88,8 % | 0 → 12,8 | 11,2 → 1,2 | 11,2 → 4,0 | 138,9 → 118,8 |
| Equilibrada | 93,1 % → 85,9 % | 0 → 12,4 | 14,0 → 0,8 | 14,0 → 4,3 | 136,1 → 90,5 |
| Tiki-taka | 92,8 % → 87,0 % | 0 → 13,0 | 15,3 → 1,2 | 15,3 → 5,5 | 149,2 → 100,9 |
| Ofensiva | 91,6 % → 83,4 % | 0 → 13,6 | 18,5 → 1,3 | 18,5 → 5,3 | 115,3 → 84,0 |

**Interpretación:** se elimina la intercepción magnética que redirigía pases al rival y se cuentan controles reales, no solo trayectorias finalizadas. Las intercepciones y recuperaciones caen demasiado: ahora hace falta una defensa que anticipe la trayectoria. No se debe confundir «menos intercepciones» con una defensa mejor.

## Más indicadores de 0.5.2

| Métrica | Presión | Defensiva | Equilibrada | Tiki-taka | Ofensiva |
|---|---:|---:|---:|---:|---:|
| Remates | 9,83 | 7,00 | 10,58 | 11,50 | 11,17 |
| Goles | 1,33 | 1,33 | 1,42 | 1,58 | 2,08 |
| xG | 2,15 | 1,68 | 2,21 | 2,86 | 2,43 |
| Goles/xG | 0,62 | 0,79 | 0,64 | 0,55 | 0,86 |
| Pases progresivos (%) | 28,9 | 20,8 | 25,3 | 23,1 | 28,1 |
| Pases hacia atrás (%) | 28,3 | 37,3 | 27,3 | 27,3 | 25,7 |
| Pases cortos (%) | 31,5 | 50,6 | 31,3 | 50,5 | 28,4 |
| Distancia media de pase (m) | 21,4 | 17,6 | 21,2 | 16,9 | 22,4 |
| Posesión (%) | 48,7 | 67,3 | 51,8 | 55,8 | 48,6 |
| Recuperaciones por contrapresión (%) | 6,9 | 0 | 0 | 3,0 | 1,6 |
| Córners | 3,1 | 1,4 | 3,2 | 3,4 | 2,9 |
| Fueras de juego | 0 | 0 | 0 | 0 | 0 |
| Saques de banda | 0 | 0 | 0 | 0 | 0 |
| Faltas | 0,7 | 0,2 | 0,4 | 0,3 | 1,3 |
| Paredes iniciadas | 2,6 | 1,9 | 2,2 | 6,9 | 3,0 |
| Paredes completadas (%) | 61,3 | 39,1 | 53,8 | 49,4 | 47,2 |
| Anchura defensiva (m) | 42,7 | 40,3 | 45,4 | 47,9 | 45,8 |
| Compañeros a menos de 3 m (pares por muestra) | 0,15 | 0,20 | 0,14 | 0,17 | 0,14 |
| Máximo tiempo inmóvil con balón (s) | 0,80 | 0,96 | 1,12 | 0,80 | 0,80 |

**Invariantes comprobadas:** 60/60 partidos terminados, cero jugadores fuera del campo, cero intercepciones magnéticas, cero pases completados sin contabilizar intentos y ningún portador quieto más de 2,3 s.

## Defectos aún abiertos

- **Fueras de juego y saques de banda: cero** en esta muestra. La geometría de salida de un pase está implementada, pero las decisiones de pase y los desmarques todavía evitan casi todas las situaciones. Hay que simular anticipación imperfecta, controles orientados y desvíos, no inventar eventos aleatorios.
- **Pocas recuperaciones:** falta predicción de trayectorias y ayudas defensivas. El antiguo sistema regalaba intercepciones.
- **Pocos pases por encuentro:** 80–119 por equipo, en parte porque el reloj avanza 18 veces más rápido que la simulación espacial.
- **xG sobreestimado respecto a goles:** ratios entre 0,55 y 0,86. Falta corregir la probabilidad condicionada de remate a puerta.
- Solo se han comparado dos clubes; los resultados no demuestran realismo universal.

## Reproducir

`npm test` valida el motor y `npm run audit` simula 60 encuentros, emite JSON con más de 25 métricas por táctica y verifica invariantes antes del despliegue.
