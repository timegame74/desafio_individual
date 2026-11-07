#!/usr/bin/env python3
"""Calcula TODOS los numeros del informe y genera:
   - docs/resultados.json  (referencia que usan las pruebas de Node)
   - docs/informe.md       (informe con tablas calculadas por este script)
Uso:  python3 docs/generar_informe.py
"""
import json, math, os

# ---------- Parametros HIPOTETICOS ----------
Q, K, V0, T = 500.0, 0.10, 500.0, 24.0
N_FAM, C_FAM = 40, 75.0
VMIN = N_FAM * C_FAM
VEQ = Q / K
HS = [4, 2, 1, 0.5, 0.25]

f = lambda v: Q - K * v
exacta = lambda t: VEQ + (V0 - VEQ) * math.exp(-K * t)

def simular(h):
    n = round(T / h)
    ts = [i * h for i in range(n + 1)]
    vh, vr = [V0], [V0]
    for _ in range(n):
        y = vh[-1]; yt = y + h * f(y)
        vh.append(y + h / 2 * (f(y) + f(yt)))
        y = vr[-1]
        k1 = f(y); k2 = f(y + h / 2 * k1); k3 = f(y + h / 2 * k2); k4 = f(y + h * k3)
        vr.append(y + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4))
    ex = [exacta(t) for t in ts]
    return ts, ex, vh, vr

def rel(e, a):
    return None if abs(e) < 1e-12 else abs(e - a) / abs(e) * 100

T90 = math.log((VEQ - V0) / (0.1 * VEQ)) / K
TMIN = math.log((VEQ - V0) / (VEQ - VMIN)) / K

res, resumen = {}, {}
for h in HS:
    ts, ex, vh, vr = simular(h)
    res[str(h)] = {"t": ts, "exacta": ex, "heun": vh, "rk4": vr}
    resumen[h] = (max(abs(a - b) for a, b in zip(ex, vh)),
                  max(abs(a - b) for a, b in zip(ex, vr)))

with open(os.path.join(os.path.dirname(__file__), "resultados.json"), "w") as fh:
    json.dump({"params": {"Q": Q, "k": K, "V0": V0, "T": T}, "Veq": VEQ, "t90": T90,
               "V24": exacta(24), "tVmin": TMIN, "series": res}, fh, indent=1)

def tabla_iter(h):
    ts, ex, vh, vr = simular(h)
    L = ["| i | t (h) | V exacta (L) | V Heun (L) | V RK4 (L) | Err. abs. Heun | Err. rel. Heun (%) | Err. abs. RK4 | Err. rel. RK4 (%) |",
         "|--:|--:|--:|--:|--:|--:|--:|--:|--:|"]
    for i, (t, e, a, b) in enumerate(zip(ts, ex, vh, vr)):
        rh, rr = rel(e, a), rel(e, b)
        L.append(f"| {i} | {t:g} | {e:.4f} | {a:.4f} | {b:.4f} | {abs(e-a):.6f} | "
                 f"{'—' if rh is None else f'{rh:.6f}'} | {abs(e-b):.8f} | {'—' if rr is None else f'{rr:.8f}'} |")
    return "\n".join(L)

def tabla_resumen():
    L = ["| h (h) | Pasos | Error máx. Heun (L) | Orden obs. Heun | Error máx. RK4 (L) | Orden obs. RK4 |",
         "|--:|--:|--:|--:|--:|--:|"]
    prev = None
    for h in HS:
        eh, er = resumen[h]
        if prev:
            oh = math.log2(prev[0] / eh); orr = math.log2(prev[1] / er)
            ohs, ors = f"{oh:.2f}", f"{orr:.2f}"
        else:
            ohs = ors = "—"
        L.append(f"| {h:g} | {round(T/h)} | {eh:.6e} | {ohs} | {er:.6e} | {ors} |")
        prev = (eh, er)
    return "\n".join(L)

ts2, ex2, vh2, vr2 = simular(2)
ts5, ex5, vh5, vr5 = simular(0.5)

informe = f"""# Tanque comunitario de agua en un barrio de La Paz
## Modelado con EDO de primer orden: solución analítica vs. Heun vs. RK4

**Autor:** [MI NOMBRE COMPLETO] · **Materia:** Métodos Numéricos · **Carrera:** Ingeniería en Sistemas (Informática) · La Paz, Bolivia · 6 de noviembre de 2026

> **Aviso:** todos los parámetros de este informe son **hipotéticos** y se usan solo con fines académicos. Los resultados no son predicciones comprobadas del comportamiento de un tanque real.

---

## a) Problema y contexto

**Nombre del desafío:** *Llenado de un tanque comunitario de agua en un barrio de ladera de La Paz.*

**Contexto.** En La Paz, muchos barrios de ladera reciben agua por turnos, con presiones variables por la pendiente y la altitud (la ciudad se extiende entre unos 3 200 y más de 4 000 m s. n. m.). Para amortiguar los cortes, los vecinos usan tanques comunitarios.

**Población beneficiaria (hipotética):** {N_FAM} familias de un barrio, con una reserva mínima deseada de {C_FAM:g} L por familia, es decir **V_min = {VMIN:g} L**.

**Relevancia.** Saber cuánto tarda el tanque en llenarse y qué volumen habrá al cabo de un día ayuda a decidir si el caudal disponible alcanza para sostener la reserva.

**Pregunta.** ¿En cuántas horas el tanque alcanza el 90 % de su volumen de equilibrio y cuál es el volumen a las 24 h? ¿Se cumple V ≥ V_min?

## b) Modelo matemático

- **Variable independiente:** t, tiempo (h).
- **Variable dependiente:** V(t), volumen de agua en el tanque (L).
- **Parámetros (hipotéticos):**

| Símbolo | Significado | Valor | Unidad |
|---|---|--:|---|
| Q | Caudal de ingreso (constante) | {Q:g} | L/h |
| k | Tasa de consumo/pérdida | {K:g} | 1/h |
| V₀ | Volumen inicial | {V0:g} | L |
| T | Tiempo final | {T:g} | h |
| N | Familias | {N_FAM} | familias |
| c | Consumo mínimo por familia | {C_FAM:g} | L/familia |

- **EDO:**  dV/dt = Q − k·V = f(t, V)
- **Condición inicial:** V(0) = V₀ = {V0:g} L
- **Intervalo de simulación:** t ∈ [0, {T:g}] h
- **Supuestos:** (1) Q es constante; (2) el consumo y las pérdidas son proporcionales al volumen almacenado; (3) el tanque no se desborda; (4) k constante. Son simplificaciones: el consumo real depende de la hora del día.
- **Volumen de equilibrio:** si dV/dt = 0 entonces V_eq = Q/k = {VEQ:g} L.

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

**Con los parámetros:** V(t) = {VEQ:g} − {VEQ - V0:g}·e^(−{K:g}·t).

**Respuestas analíticas:**
- Tiempo al 90 % de V_eq (= {0.9*VEQ:g} L): despejando, t₉₀ = ln[(V_eq − V₀)/(0.1·V_eq)]/k = ln(9)/{K:g} = **{T90:.4f} h**.
- Volumen a las 24 h: V(24) = **{exacta(24):.4f} L**.
- Tiempo para alcanzar V_min = {VMIN:g} L: t = ln[(V_eq − V₀)/(V_eq − V_min)]/k = **{TMIN:.4f} h**.

## d) Métodos numéricos

Con f(t, V) = Q − k·V, el mismo V₀, intervalo [0, {T:g}] y mismo paso h para ambos métodos:

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

{tabla_iter(2)}

### e.2 Resumen de error máximo por método y por tamaño de paso

{tabla_resumen()}

*Orden observado* p = log₂(error(2h)/error(h)) al reducir h a la mitad. Heun se acerca a 2 y RK4 a 4, como predice la teoría (en h grandes el orden de RK4 se aleja un poco porque aún no está en régimen asintótico).

### e.3 Comparación h = 2 vs h = 0.5 en t = 24 h

| h | V exacta (L) | V Heun (L) | V RK4 (L) |
|--:|--:|--:|--:|
| 2 | {ex2[-1]:.4f} | {vh2[-1]:.4f} | {vr2[-1]:.4f} |
| 0.5 | {ex5[-1]:.4f} | {vh5[-1]:.4f} | {vr5[-1]:.4f} |

### e.4 Gráficas

Las gráficas de las tres curvas y de los errores se generan en la aplicación web (secciones «Gráfica de las tres curvas» y «Gráfica de errores absolutos»). Para el informe, tome capturas de pantalla de la app con h = 2 y con h = 0.5 e insértelas aquí.

*(Insertar captura 1: curvas exacta/Heun/RK4 · captura 2: errores absolutos)*

## f) Interpretación y conclusiones

**En lenguaje sencillo.** El tanque se llena rápido al principio y cada vez más despacio, porque cuanto más agua hay, más se consume o se pierde. Con los datos supuestos, el nivel estable sería {VEQ:g} L. El tanque llegaría al 90 % de ese nivel (4 500 L) en unas **{T90:.2f} horas** y a las 24 h tendría aproximadamente **{exacta(24):.1f} L**. La reserva mínima de {VMIN:g} L para {N_FAM} familias se alcanzaría tras unas **{TMIN:.1f} horas** y se mantendría después.

**Método con menor error.** RK4 resultó mucho más exacto que Heun con el mismo paso: con h = 2, el error máximo fue {resumen[2][1]:.4f} L (RK4) frente a {resumen[2][0]:.4f} L (Heun); con h = 0.5, {resumen[0.5][1]:.2e} L frente a {resumen[0.5][0]:.4f} L. RK4 cuesta cuatro evaluaciones de f por paso frente a dos de Heun, pero la mejora en precisión compensa ese costo.

**Limitaciones.** (1) Parámetros hipotéticos, no medidos. (2) Q constante: en La Paz el suministro suele ser intermitente. (3) Consumo proporcional al volumen: en la realidad depende de la hora y de la cantidad de personas. (4) Se ignora el desborde por capacidad máxima del tanque. (5) Es un modelo de un solo compartimiento. Los resultados sirven para entender el comportamiento cualitativo, no como predicción comprobada.

---

## Anexo A. Tabla por iteración con h = 0.5 h (48 pasos)

{tabla_iter(0.5)}
"""

with open(os.path.join(os.path.dirname(__file__), "informe.md"), "w", encoding="utf-8") as fh:
    fh.write(informe)
print("OK: informe.md y resultados.json generados")
print(f"t90={T90:.6f}  V24={exacta(24):.6f}  tVmin={TMIN:.6f}")
