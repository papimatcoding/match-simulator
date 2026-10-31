# MatchLab 0.5.7 — Auditoría de ventaja, remates con efecto y defensa inteligente

## Protocolo

Se ejecutaron **60 partidos completos** (12 por plan táctico, Barcelona-Getafe, visitante equilibrado, semillas `seed*157`) y **109 pruebas automáticas** (108 pruebas de lógica + una de carga del módulo Canvas). Se ejecutaron todos los partidos 2D a la misma escala `13.5×` de reloj (aprox. 3 min 20 s por parte a velocidad 1×). Los clubes y semillas coinciden con 0.5.6, pero los resultados **no representan parejas de jugadas idénticas**.

### Comparación 0.5.6 → 0.5.7, equipo local por partido

| Plan | Pases | Precisión | Remates | xG | Goles |
|---|---:|---:|---:|---:|---:|
| Presión alta | 186,7 → **181,3** | 82,4% → 80,9% | 16,3 → **14,5** | 3,54 → 2,70 | 2,9 → 3,3 |
| Defensiva | 201,0 → **210,6** | 87,9% → 88,9% | 8,5 → **5,8** | 1,64 → 1,10 | 1,9 → 0,9 |
| Equilibrada | 185,7 → **188,6** | 85,8% → 86,6% | 13,4 → **10,8** | 2,83 → 2,08 | 1,8 → 2,3 |
| Tiki-taka | 227,6 → **226,9** | 84,8% → 84,0% | 10,9 → **11,8** | 2,15 → 2,34 | 1,9 → 2,3 |
| Ofensiva | 164,0 → **160,7** | 79,3% → 75,7% | 16,5 → **14,8** | 3,50 → 3,26 | 3,3 → 3,6 |

**Balance sincero:** no supone un aumento de ocasiones para todos los planes. La defensa reduce el remate, pero en presión alta y equilibrada se pierden tiros. La ofensiva pierde algunos pases y porcentaje de acierto; el tiki-taka mejora discretamente el número de ocasiones. Hay que validar si estos niveles se aproximan a fútbol real con una muestra más diversa.

### Nuevas medidas

| Plan | Ventajas ofrecidas/partido | Aprovechadas | Vuelta a falta | Remates con rosca | Remates potentes | Coberturas activas por muestra de posesión rival |
|---|---:|---:|---:|---:|---:|---:|
| Presión alta | 1,00 | 0,92 | 0,08 | 7,25 | 1,33 | 0,51 |
| Defensiva | 0,25 | 0,25 | 0,00 | 2,67 | 0,42 | 0,60 |
| Equilibrada | 0,75 | 0,58 | 0,17 | 5,33 | 1,00 | 0,54 |
| Tiki-taka | 1,17 | 0,92 | 0,25 | 4,67 | 1,17 | 0,48 |
| Ofensiva | 0,75 | 0,58 | 0,17 | 5,25 | 1,67 | 0,53 |

**Definiciones:** «ventaja aprovechada» es continuidad de posesión, pase completado, progresión o remate antes de perderla. «Vuelta a falta» recupera el punto original antes de tres segundos reales. Los porcentajes deben interpretarse con prudencia: 12 partidos por táctica generan pocos casos de ventaja. «Coberturas activas» es el promedio de defensores extra que tienen asignación de cierre de pase cuando el equipo local defiende; otros jugadores continúan ejerciendo presión y coberturas mediante módulos anteriores.

## Qué hemos añadido realmente

1. **Árbitro — Ley 5 (IFAB 2026/27):** regla contextual de ventaja cuando el portador controla el balón y tiene salida prometedora; se vuelve a la falta original si se pierde antes de consolidarla. Se mantiene la señalización directa de penaltis y faltas con roja. Las amarillas por una infracción con ventaja se difieren a la siguiente interrupción. Referencia oficial: https://www.theifab.com/laws/latest/the-referee/
2. **Remates tipificados:** se distinguen disparo colocado con efecto, potente, directo y cabezazo. Las probabilidades de elegir cada acción dependen de técnica, efecto, potencia, compostura, ángulo, distancia y presión. La selección no garantiza gol; el xG sigue procediendo del módulo probabilístico.
3. **Trayectoria visible:** el balón sigue una curva geométrica 2D durante el vuelo; la trayectoria conserva exactamente los puntos de salida y llegada. Se muestra una estela y una altura visual simulada. Los tiros parados mantienen su punto antes de la línea, evitando guardametas que salvan desde dentro de la portería.
4. **Identidad de jugadores:** nuevo esquema de definición, potencia, efecto, técnica y compostura, utilizado tanto para futbolistas de equipos actuales como para jugadores personalizados o héroe. **Los valores de los jugadores reales siguen estimados por el motor** y no son una base estadística profesional verificada; se evita fingir ratings oficiales.
5. **Inteligencia defensiva:** hasta dos asignaciones simultáneas de cobertura de pase, marcadores distintos y un objetivo objetivo entre poseedor y receptor, solo en ataques suficientemente cercanos al área. El movimiento se hace mediante el sistema físico ordinario. Una versión inicial bloqueaba demasiado las jugadas; se rebajó su peso y rango de activación.

## Limitaciones y recomendaciones

- La distribución final sigue teniendo bastante rosca: un 40–50% de los tiros según el plan. Es una representación experimental; hay que calibrarla con tipos de remate de partidos reales.
- El modelo no representa correctamente aún la altura de los travesaños, la colocación espacial exacta del cuerpo del portero o rebotes de balón elevado.
- La base de datos no es todavía una hoja Excel/Sheets ni contiene estadísticas profesionales licenciadas o actualizadas; el siguiente paso será un repositorio de perfiles con fuentes y datos de procedencia, sin inventar atributos para futbolistas reales.
- La ventaja se aproxima a la norma 2026/27, pero no simula toda la normativa de arbitraje, VAR, lesiones, protocolo de descuento ni sanciones disciplinarias especiales.
- El tiki-taka conserva un problema de conversión de paredes (28,9% frente a 36,4% en 0.5.6), y el planteamiento defensivo todavía realiza demasiados pases (210,6).
- Los resultados de 60 partidos y 109 tests no sustituyen una revisión visual en navegador real o con varios usuarios.

## Ejecución

```bash
npm test
npm run audit
```

Todos los cambios quedan en el **motor independiente MatchLab 2D**. No se alteran los guardados ni la lógica de carrera de FUERA DE GUIÓN.
