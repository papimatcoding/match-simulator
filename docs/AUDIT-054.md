# MatchLab 0.5.4 — Auditoría de control orientado y ritmo de partido

## Protocolo

60 partidos completos en el motor 0.5.4; 12 partidos por plan táctico local, Barcelona contra Getafe con plan visitante equilibrado. Semillas idénticas a la auditoría 0.5.3, pero la secuencia de decisiones y sorteos cambia al modificar los tiempos de reacción; **no son jugadas apareadas**. Valores por equipo local y partido salvo porcentajes. No son una calibración con estadísticas reales.

Se ejecutaron **84 pruebas de motor** (incluidas 7 nuevas) y la auditoría automatizada de 60 encuentros. Todas las pruebas terminaron correctamente en GitHub Actions tras corregir cuatro aserciones de versionado de recursos.

## Indicadores comparados — 0.5.3 → 0.5.4

| Táctica local | Pases/partido | Remates/partido | Goles/partido | xG/partido | Precisión pase |
|---|---:|---:|---:|---:|---:|
| Presión alta | 80,9 → **88,0** | 8,3 → 8,0 | 1,8 → 1,3 | 1,60 → 1,66 | 87,3% → 87,6% |
| Defensiva | 122,9 → **117,3** | 4,2 → 4,9 | 1,1 → 0,9 | 0,80 → 0,92 | 91,1% → 90,5% |
| Equilibrada | 86,0 → **100,0** | 6,6 → 6,9 | 1,1 → 1,2 | 1,20 → 1,42 | 88,4% → 89,7% |
| Tiki-taka | 110,5 → **133,1** | 6,9 → 5,8 | 2,2 → 1,3 | 1,60 → 1,21 | 88,4% → 88,2% |
| Ofensiva | 69,2 → **69,1** | 7,4 → 7,7 | 1,7 → 1,3 | 1,50 → 1,75 | 87,3% → 87,0% |

### Métricas nuevas

| Táctica | Controles orientados/partido | Corredores útiles por muestra en ataque | Máximo tiempo inmóvil del poseedor | Paredes intentadas/partido | % paredes completadas |
|---|---:|---:|---:|---:|---:|
| Presión alta | 71,9 | 0,75 | 0,48 s | 3,4 | 43,9% |
| Defensiva | 104,0 | 1,00 | 0,40 s | 2,6 | 41,9% |
| Equilibrada | 85,4 | 0,68 | 0,24 s | 4,5 | 48,1% |
| Tiki-taka | 113,8 | 0,36 | 0,24 s | 7,4 | 28,1% |
| Ofensiva | 53,8 | 0,68 | 0,24 s | 3,1 | 45,9% |

**Definiciones:** el control orientado es una recepción completada que genera un destino físico de conducción. La muestra de corredores es el número medio de compañeros con intención «Atacar carril libre» o «Aparecer entre líneas» cuando el local posee el balón. No es un conteo de desmarques únicos: un jugador puede aparecer en varias muestras.

### Lecturas adicionales

| Táctica | Progresivos (%) | Retrocesos (%) | Distancia media pase | Tiros por partido | Intercepciones/partido | Balones divididos/partido |
|---|---:|---:|---:|---:|---:|---:|
| Presión alta | 30,6 | 30,2 | 20,2 m | 8,0 | 1,3 | 10,3 |
| Defensiva | 24,8 | 34,3 | 16,7 m | 4,9 | 0,7 | 10,8 |
| Equilibrada | 28,1 | 31,5 | 19,3 m | 6,9 | 1,0 | 9,8 |
| Tiki-taka | 22,2 | 27,7 | 16,3 m | 5,8 | 1,1 | 14,8 |
| Ofensiva | 29,2 | 29,0 | 21,5 m | 7,7 | 1,3 | 8,8 |

La auditoría completa incluye completados según longitud y presión, posesión, anchura defensiva, amontonamiento, xG por rango de probabilidad, salidas por línea de fondo/banda, faltas, saques, continuidad, defensas que interceptan en vuelo y robos a ras de suelo.

## Conclusiones y regresiones detectadas

- **Mejora comprobable:** ritmo de pase moderadamente mayor en equilibrada y tiki-taka y portador menos estático; los controles orientados aparecen de forma natural.
- **Sin mejora suficiente:** todavía solo hay 69–133 pases y 5–8 remates por equipo local/partido. El déficit de volumen respecto al fútbol real sigue sin corregirse.
- **Regresión parcial:** tiki-taka genera menos remates (6,9 → 5,8), menos xG (1,60 → 1,21) y solo completa el 28,1% de las paredes, pese a intentar más. Requiere revisión antes de considerar competitivo al motor.
- **Defensiva:** pierde algo de volumen de pase frente a 0.5.3, aunque incrementa ligeramente tiros. No debe describirse como progreso universal.
- **Fuera de juego y banda:** continuan apareciendo con frecuencia irrealmente baja, incluso cuando la geometría permite sancionarlos. Exigen rediseño de reglas y movimiento.
- **Métricas robustas:** cero muestras de futbolistas fuera del campo y cero pases magnéticos según las aserciones de auditoría; proporción de pases completados dentro de límites de regresión.

## Próximo parche recomendado (0.5.5)

1. Analizar trayectorias de jugadas de tiki-taka y cancelaciones de paredes; corregir la selección del tercer hombre por alcanzabilidad y orientación antes de elevar aleatoriamente el éxito.
2. Medir tiempo efectivo de posesión, reinicios, balón dividido y conducción para explicar por qué el ritmo sigue siendo tan bajo.
3. Diferenciar recepción al pie, al espacio y atrás de la defensa; registrar cuántas terminan en último tercio y en remate.
4. Repetir las 60 semillas y contrastar especialmente pases, remates, xG, progresión, pérdidas y proporción de goles sobre xG.
5. Mantener el simulador **2D** y aislado de FUERA DE GUIÓN hasta alcanzar estabilidad estadística y revisión visual.

## Ejecución

```bash
npm test
npm run audit
```
