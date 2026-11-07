# Tanque comunitario de agua en un barrio de La Paz
## Modelado con EDO de primer orden: solución analítica vs. Heun vs. RK4

**Autor:** [Valencia Peralta Rafael Andres] · **Materia:** Métodos Numéricos · **Carrera:** Ingeniería en Sistemas (Informática) · La Paz, Bolivia · 6 de noviembre de 2026

> **Aviso:** todos los parámetros de este informe son **hipotéticos** y se usan solo con fines académicos. Los resultados no son predicciones comprobadas del comportamiento de un tanque real.

---

## a) Problema y contexto

**Nombre del desafío:** *Llenado de un tanque comunitario de agua en un barrio de ladera de La Paz.*

**Contexto.** En La Paz, muchos barrios de ladera reciben agua por turnos, con presiones variables por la pendiente y la altitud (la ciudad se extiende entre unos 3 200 y más de 4 000 m s. n. m.). Para amortiguar los cortes, los vecinos usan tanques comunitarios.

**Población beneficiaria (hipotética):** 40 familias de un barrio, con una reserva mínima deseada de 75 L por familia, es decir **V_min = 3000 L**.

**Relevancia.** Saber cuánto tarda el tanque en llenarse y qué volumen habrá al cabo de un día ayuda a decidir si el caudal disponible alcanza para sostener la reserva.

**Pregunta.** ¿En cuántas horas el tanque alcanza el 90 % de su volumen de equilibrio y cuál es el volumen a las 24 h? ¿Se cumple V ≥ V_min?

## b) Modelo matemático

- **Variable independiente:** t, tiempo (h).
- **Variable dependiente:** V(t), volumen de agua en el tanque (L).
- **Parámetros (hipotéticos):**

| Símbolo | Significado | Valor | Unidad |
|---|---|--:|---|
| Q | Caudal de ingreso (constante) | 500 | L/h |
| k | Tasa de consumo/pérdida | 0.1 | 1/h |
| V₀ | Volumen inicial | 500 | L |
| T | Tiempo final | 24 | h |
| N | Familias | 40 | familias |
| c | Consumo mínimo por familia | 75 | L/familia |

- **EDO:**  dV/dt = Q − k·V = f(t, V)
- **Condición inicial:** V(0) = V₀ = 500 L
- **Intervalo de simulación:** t ∈ [0, 24] h
- **Supuestos:** (1) Q es constante; (2) el consumo y las pérdidas son proporcionales al volumen almacenado; (3) el tanque no se desborda; (4) k constante. Son simplificaciones: el consumo real depende de la hora del día.
- **Volumen de equilibrio:** si dV/dt = 0 entonces V_eq = Q/k = 5000 L.

## c) Solución analítica

La EDO es lineal de primer orden: V' + kV = Q.

**Factor integrante:** μ(t) = e^(kt).
1. Multiplicamos: e^(kt)·V' + k·e^(kt)·V = Q·e^(kt), es decir (V·e^(kt))' = Q·e^(kt).
2. Integramos: V·e^(kt) = (Q/k)·e^(kt) + C.
3. Despejamos: V(t) = Q/k + C·e^(−kt).
4. Con V(0) = V₀: V₀ = Q/k + C, de donde C = V₀ − Q/k.

**Solución:**  **V(t) = Q/k + (V₀ − Q/k)·e^(−kt)**

**Comprobación por sustitución.**
- Derivada: V'(t) = −k·(V₀ − Q/k)·e^(−kt).
- Lado derecho: Q − k·V(t) = Q − Q − k·(V₀ − Q/k)·e^(−kt) = −k·(V₀ − Q/k)·e^(−kt). ✔ Coincide con V'(t).
- Condición inicial: V(0) = Q/k + (V₀ − Q/k)·1 = V₀. ✔
- (Verificación adicional con sympy: residuo de la EDO = 0 y V(0) − V₀ = 0.)

**Con los parámetros:** V(t) = 5000 − 4500·e^(−0.1·t).

**Respuestas analíticas:**
- Tiempo al 90 % de V_eq (= 4500 L): despejando, t₉₀ = ln[(V_eq − V₀)/(0.1·V_eq)]/k = ln(9)/0.1 = **21.9722 h**.
- Volumen a las 24 h: V(24) = **4591.7692 L**.
- Tiempo para alcanzar V_min = 3000 L: t = ln[(V_eq − V₀)/(V_eq − V_min)]/k = **8.1093 h**.

## d) Métodos numéricos

Con f(t, V) = Q − k·V, el mismo V₀, intervalo [0, 24] y mismo paso h para ambos métodos:

**Heun (RK2, predictor–corrector):**
- Predictor: Ṽ = Vₙ + h·f(tₙ, Vₙ)
- Corrector: Vₙ₊₁ = Vₙ + (h/2)·[f(tₙ, Vₙ) + f(tₙ₊₁, Ṽ)]
- Error global O(h²).

**RK4 clásico:**
- k₁ = f(tₙ, Vₙ)
- k₂ = f(tₙ + h/2, Vₙ + (h/2)·k₁)
- k₃ = f(tₙ + h/2, Vₙ + (h/2)·k₂)
- k₄ = f(tₙ + h, Vₙ + h·k₃)
- Vₙ₊₁ = Vₙ + (h/6)(k₁ + 2k₂ + 2k₃ + k₄)
- Error global O(h⁴).

**Errores:** absoluto = |V_exacta − V_numérica|; relativo (%) = 100·|V_exacta − V_numérica| / |V_exacta| (se omite si V_exacta = 0).

## e) Análisis comparativo

### e.1 Tabla por iteración, h = 2 h (12 pasos)

| i | t (h) | V exacta (L) | V Heun (L) | V RK4 (L) | Err. abs. Heun | Err. rel. Heun (%) | Err. abs. RK4 | Err. rel. RK4 (%) |
|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| 0 | 0 | 500.0000 | 500.0000 | 500.0000 | 0.000000 | 0.000000 | 0.00000000 | 0.00000000 |
| 1 | 2 | 1315.7116 | 1310.0000 | 1315.7000 | 5.711611 | 0.434108 | 0.01161115 | 0.00088250 |
| 2 | 4 | 1983.5598 | 1974.2000 | 1983.5408 | 9.359793 | 0.471868 | 0.01901284 | 0.00095852 |
| 3 | 6 | 2530.3476 | 2518.8440 | 2530.3243 | 11.503638 | 0.454627 | 0.02334963 | 0.00092278 |
| 4 | 8 | 2978.0197 | 2965.4521 | 2977.9942 | 12.567581 | 0.422011 | 0.02548946 | 0.00085592 |
| 5 | 10 | 3344.5425 | 3331.6707 | 3344.5164 | 12.871809 | 0.384860 | 0.02608629 | 0.00077997 |
| 6 | 12 | 3644.6260 | 3631.9700 | 3644.6004 | 12.656068 | 0.347253 | 0.02562922 | 0.00070321 |
| 7 | 14 | 3890.3137 | 3878.2154 | 3890.2892 | 12.098280 | 0.310985 | 0.02448071 | 0.00062927 |
| 8 | 16 | 4091.4657 | 4080.1366 | 4091.4428 | 11.329055 | 0.276895 | 0.02290645 | 0.00055986 |
| 9 | 18 | 4256.1550 | 4245.7120 | 4256.1339 | 10.442980 | 0.245362 | 0.02109852 | 0.00049572 |
| 10 | 20 | 4390.9912 | 4381.4839 | 4390.9720 | 9.507366 | 0.216520 | 0.01919337 | 0.00043711 |
| 11 | 22 | 4501.3858 | 4492.8168 | 4501.3685 | 8.569023 | 0.190364 | 0.01728565 | 0.00038401 |
| 12 | 24 | 4591.7692 | 4584.1097 | 4591.7538 | 7.659463 | 0.166809 | 0.01543889 | 0.00033623 |

### e.2 Resumen de error máximo por método y por tamaño de paso

| h (h) | Pasos | Error máx. Heun (L) | Orden obs. Heun | Error máx. RK4 (L) | Orden obs. RK4 |
|--:|--:|--:|--:|--:|--:|
| 4 | 6 | 5.957005e+01 | — | 4.850539e-01 | — |
| 2 | 12 | 1.287181e+01 | 2.21 | 2.608629e-02 | 4.22 |
| 1 | 24 | 2.976946e+00 | 2.11 | 1.499585e-03 | 4.12 |
| 0.5 | 48 | 7.163123e-01 | 2.06 | 8.989244e-05 | 4.06 |
| 0.25 | 96 | 1.757185e-01 | 2.03 | 5.502338e-06 | 4.03 |

*Orden observado* p = log₂(error(2h)/error(h)) al reducir h a la mitad. Heun se acerca a 2 y RK4 a 4, como predice la teoría (en h grandes el orden de RK4 se aleja un poco porque aún no está en régimen asintótico).

### e.3 Comparación h = 2 vs h = 0.5 en t = 24 h

| h | V exacta (L) | V Heun (L) | V RK4 (L) |
|--:|--:|--:|--:|
| 2 | 4591.7692 | 4584.1097 | 4591.7538 |
| 0.5 | 4591.7692 | 4591.3451 | 4591.7692 |

### e.4 Gráficas

Las gráficas de las tres curvas y de los errores se generan en la aplicación web (secciones «Gráfica de las tres curvas» y «Gráfica de errores absolutos»). Para el informe, tome capturas de pantalla de la app con h = 2 y con h = 0.5 e insértelas aquí.

*(Insertar captura 1: curvas exacta/Heun/RK4 · captura 2: errores absolutos)*

## f) Interpretación y conclusiones

**En lenguaje sencillo.** El tanque se llena rápido al principio y cada vez más despacio, porque cuanto más agua hay, más se consume o se pierde. Con los datos supuestos, el nivel estable sería 5000 L. El tanque llegaría al 90 % de ese nivel (4 500 L) en unas **21.97 horas** y a las 24 h tendría aproximadamente **4591.8 L**. La reserva mínima de 3000 L para 40 familias se alcanzaría tras unas **8.1 horas** y se mantendría después.

**Método con menor error.** RK4 resultó mucho más exacto que Heun con el mismo paso: con h = 2, el error máximo fue 0.0261 L (RK4) frente a 12.8718 L (Heun); con h = 0.5, 8.99e-05 L frente a 0.7163 L. RK4 cuesta cuatro evaluaciones de f por paso frente a dos de Heun, pero la mejora en precisión compensa ese costo.

**Limitaciones.** (1) Parámetros hipotéticos, no medidos. (2) Q constante: en La Paz el suministro suele ser intermitente. (3) Consumo proporcional al volumen: en la realidad depende de la hora y de la cantidad de personas. (4) Se ignora el desborde por capacidad máxima del tanque. (5) Es un modelo de un solo compartimiento. Los resultados sirven para entender el comportamiento cualitativo, no como predicción comprobada.

---

## Anexo A. Tabla por iteración con h = 0.5 h (48 pasos)

| i | t (h) | V exacta (L) | V Heun (L) | V RK4 (L) | Err. abs. Heun | Err. rel. Heun (%) | Err. abs. RK4 | Err. rel. RK4 (%) |
|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| 0 | 0 | 500.0000 | 500.0000 | 500.0000 | 0.000000 | 0.000000 | 0.00000000 | 0.00000000 |
| 1 | 0.5 | 719.4676 | 719.3750 | 719.4676 | 0.092590 | 0.012869 | 0.00001162 | 0.00000162 |
| 2 | 1 | 928.2316 | 928.0555 | 928.2316 | 0.176150 | 0.018977 | 0.00002211 | 0.00000238 |
| 3 | 1.5 | 1126.8141 | 1126.5628 | 1126.8141 | 0.251341 | 0.022305 | 0.00003155 | 0.00000280 |
| 4 | 2 | 1315.7116 | 1315.3928 | 1315.7116 | 0.318781 | 0.024229 | 0.00004001 | 0.00000304 |
| 5 | 2.5 | 1495.3965 | 1495.0174 | 1495.3964 | 0.379047 | 0.025348 | 0.00004758 | 0.00000318 |
| 6 | 3 | 1666.3180 | 1665.8853 | 1666.3180 | 0.432677 | 0.025966 | 0.00005431 | 0.00000326 |
| 7 | 3.5 | 1828.9036 | 1828.4234 | 1828.9035 | 0.480176 | 0.026255 | 0.00006027 | 0.00000330 |
| 8 | 4 | 1983.5598 | 1983.0378 | 1983.5597 | 0.522015 | 0.026317 | 0.00006552 | 0.00000330 |
| 9 | 4.5 | 2130.6733 | 2130.1147 | 2130.6732 | 0.558631 | 0.026219 | 0.00007011 | 0.00000329 |
| 10 | 5 | 2270.6120 | 2270.0216 | 2270.6120 | 0.590436 | 0.026003 | 0.00007410 | 0.00000326 |
| 11 | 5.5 | 2403.7259 | 2403.1080 | 2403.7258 | 0.617811 | 0.025702 | 0.00007754 | 0.00000323 |
| 12 | 6 | 2530.3476 | 2529.7065 | 2530.3476 | 0.641112 | 0.025337 | 0.00008046 | 0.00000318 |
| 13 | 6.5 | 2650.7940 | 2650.1333 | 2650.7939 | 0.660672 | 0.024924 | 0.00008292 | 0.00000313 |
| 14 | 7 | 2765.3661 | 2764.6893 | 2765.3660 | 0.676800 | 0.024474 | 0.00008494 | 0.00000307 |
| 15 | 7.5 | 2874.3505 | 2873.6607 | 2874.3504 | 0.689785 | 0.023998 | 0.00008657 | 0.00000301 |
| 16 | 8 | 2978.0197 | 2977.3198 | 2978.0196 | 0.699894 | 0.023502 | 0.00008784 | 0.00000295 |
| 17 | 8.5 | 3076.6328 | 3075.9254 | 3076.6327 | 0.707378 | 0.022992 | 0.00008877 | 0.00000289 |
| 18 | 9 | 3170.4365 | 3169.7241 | 3170.4364 | 0.712467 | 0.022472 | 0.00008941 | 0.00000282 |
| 19 | 9.5 | 3259.6654 | 3258.9500 | 3259.6653 | 0.715379 | 0.021946 | 0.00008978 | 0.00000275 |
| 20 | 10 | 3344.5425 | 3343.8262 | 3344.5424 | 0.716312 | 0.021417 | 0.00008989 | 0.00000269 |
| 21 | 10.5 | 3425.2801 | 3424.5647 | 3425.2800 | 0.715454 | 0.020887 | 0.00008978 | 0.00000262 |
| 22 | 11 | 3502.0801 | 3501.3671 | 3502.0800 | 0.712976 | 0.020359 | 0.00008947 | 0.00000255 |
| 23 | 11.5 | 3575.1345 | 3574.4255 | 3575.1344 | 0.709039 | 0.019833 | 0.00008898 | 0.00000249 |
| 24 | 12 | 3644.6260 | 3643.9223 | 3644.6260 | 0.703791 | 0.019310 | 0.00008832 | 0.00000242 |
| 25 | 12.5 | 3710.7284 | 3710.0310 | 3710.7283 | 0.697368 | 0.018793 | 0.00008751 | 0.00000236 |
| 26 | 13 | 3773.6069 | 3772.9170 | 3773.6068 | 0.689899 | 0.018282 | 0.00008657 | 0.00000229 |
| 27 | 13.5 | 3833.4188 | 3832.7373 | 3833.4187 | 0.681500 | 0.017778 | 0.00008552 | 0.00000223 |
| 28 | 14 | 3890.3137 | 3889.6414 | 3890.3136 | 0.672280 | 0.017281 | 0.00008436 | 0.00000217 |
| 29 | 14.5 | 3944.4337 | 3943.7714 | 3944.4336 | 0.662339 | 0.016792 | 0.00008311 | 0.00000211 |
| 30 | 15 | 3995.9143 | 3995.2625 | 3995.9142 | 0.651769 | 0.016311 | 0.00008178 | 0.00000205 |
| 31 | 15.5 | 4044.8841 | 4044.2435 | 4044.8840 | 0.640654 | 0.015839 | 0.00008039 | 0.00000199 |
| 32 | 16 | 4091.4657 | 4090.8366 | 4091.4656 | 0.629074 | 0.015375 | 0.00007893 | 0.00000193 |
| 33 | 16.5 | 4135.7754 | 4135.1583 | 4135.7753 | 0.617101 | 0.014921 | 0.00007743 | 0.00000187 |
| 34 | 17 | 4177.9241 | 4177.3193 | 4177.9241 | 0.604799 | 0.014476 | 0.00007589 | 0.00000182 |
| 35 | 17.5 | 4218.0173 | 4217.4250 | 4218.0172 | 0.592229 | 0.014040 | 0.00007431 | 0.00000176 |
| 36 | 18 | 4256.1550 | 4255.5756 | 4256.1549 | 0.579448 | 0.013614 | 0.00007270 | 0.00000171 |
| 37 | 18.5 | 4292.4328 | 4291.8662 | 4292.4327 | 0.566505 | 0.013198 | 0.00007108 | 0.00000166 |
| 38 | 19 | 4326.9412 | 4326.3878 | 4326.9411 | 0.553446 | 0.012791 | 0.00006944 | 0.00000160 |
| 39 | 19.5 | 4359.7667 | 4359.2264 | 4359.7666 | 0.540314 | 0.012393 | 0.00006779 | 0.00000155 |
| 40 | 20 | 4390.9912 | 4390.4641 | 4390.9912 | 0.527147 | 0.012005 | 0.00006614 | 0.00000151 |
| 41 | 20.5 | 4420.6929 | 4420.1790 | 4420.6929 | 0.513979 | 0.011627 | 0.00006449 | 0.00000146 |
| 42 | 21 | 4448.9461 | 4448.4452 | 4448.9460 | 0.500842 | 0.011258 | 0.00006284 | 0.00000141 |
| 43 | 21.5 | 4475.8213 | 4475.3335 | 4475.8212 | 0.487765 | 0.010898 | 0.00006120 | 0.00000137 |
| 44 | 22 | 4501.3858 | 4500.9110 | 4501.3857 | 0.474771 | 0.010547 | 0.00005957 | 0.00000132 |
| 45 | 22.5 | 4525.7035 | 4525.2416 | 4525.7034 | 0.461885 | 0.010206 | 0.00005795 | 0.00000128 |
| 46 | 23 | 4548.8352 | 4548.3861 | 4548.8351 | 0.449127 | 0.009873 | 0.00005635 | 0.00000124 |
| 47 | 23.5 | 4570.8388 | 4570.4023 | 4570.8387 | 0.436515 | 0.009550 | 0.00005476 | 0.00000120 |
| 48 | 24 | 4591.7692 | 4591.3451 | 4591.7692 | 0.424065 | 0.009235 | 0.00005320 | 0.00000116 |
