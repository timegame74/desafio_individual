# Material de entrega

## 1. Guion del video (≈ 1 minuto, ~159 palabras)

Ritmo ágil. Si al grabar pasa de 60 s, quite la frase «Aquí vemos… gráfica de errores» o la de «Gracias».

| Tiempo | Qué se dice | Qué mostrar en pantalla |
|---|---|---|
| 0:00–0:10 | «Hola, soy **[MI NOMBRE COMPLETO]**, de Métodos Numéricos. En barrios de La Paz el agua llega por turnos y se guarda en un tanque comunitario. ¿Cuánto tarda en llenarse?» | Título de la app y sección «El problema». |
| 0:10–0:20 | «Lo modelo con la ecuación diferencial dV/dt igual a Q menos k por V, con V de cero igual a V cero. Q es el caudal que entra y k, el consumo.» | Zoom a la ecuación destacada y a las definiciones de V, Q, k. |
| 0:20–0:30 | «La solución analítica es la fórmula exacta. Heun y Runge-Kutta cuatro son métodos numéricos que aproximan paso a paso; Runge-Kutta cuatro es más preciso.» | Señalar la fórmula analítica de la app (o mostrar las fórmulas del informe). |
| 0:30–0:45 | «En mi aplicación ingreso los parámetros hipotéticos, el paso h y calculo. Aquí vemos las tres curvas casi superpuestas, la tabla con errores absoluto y relativo, y la gráfica de errores.» | Panel de parámetros (h = 2) → clic en «Calcular» → bajar a la gráfica de curvas → tabla → gráfica de errores. |
| 0:45–0:52 | «Con h igual a dos, el error máximo de Heun es casi trece litros; el de Runge-Kutta cuatro, apenas dos centésimas.» | Tabla «Error máximo por método» (12.87 L vs 0.026 L). |
| 0:52–1:00 | «El tanque llega al noventa por ciento en casi veintidós horas y a las veinticuatro tiene unos cuatro mil seiscientos litros. Gracias.» | Tarjetas de resultados (21,97 h y 4 591,77 L) y el texto de interpretación. |

## 2. Texto del envío

> **Asunto:** Desafío Métodos Numéricos – Tanque comunitario de agua en La Paz (Heun vs RK4)
>
> Estimado/a docente:
>
> Le comparto mi desafío individual de **Métodos Numéricos** (Ingeniería en Sistemas), titulado **«Tanque comunitario de agua en un barrio de La Paz: solución analítica vs. Heun vs. RK4»**.
>
> - Aplicación web: [URL_APP]
> - Repositorio GitHub (incluye informe en /docs): [URL_REPO]
> - Video de 1 minuto: [URL_VIDEO]
>
> Atentamente,
> **[MI NOMBRE COMPLETO]**
> Métodos Numéricos · Ingeniería en Sistemas · La Paz, Bolivia

## 3. Preguntas que el profesor podría hacerle (con respuestas cortas)

1. **¿Por qué esta EDO?** Es el modelo más simple de balance de masa: entra un caudal constante Q y sale una cantidad proporcional al volumen (k·V). Tiene solución analítica, lo que permite medir el error real de los métodos.
2. **¿Cómo resolvió la EDO?** Es lineal: V' + kV = Q. Factor integrante e^(kt) → (V·e^(kt))' = Q·e^(kt) → V = Q/k + C·e^(−kt); con V(0)=V₀, C = V₀ − Q/k.
3. **¿Cómo comprobó la solución?** Sustituyendo: V' = −k(V₀−Q/k)e^(−kt) y Q − kV da lo mismo; y V(0) = Q/k + V₀ − Q/k = V₀.
4. **¿Qué es el volumen de equilibrio?** Cuando dV/dt = 0: V_eq = Q/k = 5 000 L. Es hacia donde tiende V(t) (e^(−kt) → 0).
5. **¿Cómo obtuvo las 21,97 h?** Se resuelve V(t) = 0,9·V_eq: t = ln[(V_eq−V₀)/(0,1·V_eq)]/k = ln(9)/0,1 ≈ 21,97 h.
6. **¿Cómo funciona Heun?** Predice con Euler (Ṽ = Vₙ + h·f) y corrige promediando las pendientes inicial y final. Es el método del trapecio explícito; error global O(h²).
7. **¿Y RK4?** Promedia cuatro pendientes (k₁ y k₄ en los extremos, k₂ y k₃ en el medio, con peso 2). Error global O(h⁴), cuatro evaluaciones de f por paso.
8. **¿Qué es el error de truncamiento local vs. global?** Local es el error en un paso (Heun O(h³), RK4 O(h⁵)); global es el acumulado en todo el intervalo (O(h²) y O(h⁴)).
9. **¿Cómo verifica el orden de convergencia?** Con p = log₂(e(h)/e(h/2)): da ≈ 2,0–2,2 para Heun y ≈ 4,0–4,2 para RK4 (tabla e.2 del informe).
10. **¿Por qué RK4 es mejor si hace más cálculos?** Con h = 2, RK4 tiene error máximo 0,026 L frente a 12,87 L de Heun. Para igualar a RK4 con Heun necesitaría un h muchísimo menor, con más evaluaciones en total.
11. **¿Por qué el error de Heun primero crece y luego decrece?** El error local se acumula al inicio (cuando la curva tiene más curvatura), pero la EDO es estable (el término −kV amortigua los errores), así que el error global baja al acercarse al equilibrio.
12. **¿Cómo maneja el error relativo si el valor exacto es 0?** Se muestra «—» en lugar de dividir por cero (función `errRel`).
13. **¿Qué validaciones tiene la app?** Números válidos, h > 0, h ≤ T, rangos razonables de parámetros y máximo de 10 000 pasos, con mensajes claros.
14. **¿Cómo sabe que el código es correcto?** Hay 15 pruebas en Node que comparan el JavaScript contra los valores calculados en Python (a 1e-9), verifican que la solución cumple la EDO y que los órdenes de convergencia son ≈2 y ≈4.
15. **¿Qué pasa si T/h no es entero?** El último paso se acorta para terminar exactamente en T.
16. **¿Qué limitaciones tiene el modelo?** Parámetros hipotéticos; Q constante (en La Paz el suministro es intermitente); consumo proporcional al volumen; sin desborde. Sirve para entender el comportamiento cualitativo, no como predicción.
17. **¿De dónde salen los parámetros?** Son supuestos (Q = 500 L/h, k = 0,1 1/h, V₀ = 500 L; 40 familias × 75 L). No son mediciones.

## 4. Lo que usted debe hacer (yo no puedo)

1. **Reemplazar `[MI NOMBRE COMPLETO]`** en `index.html`, `README.md`, `docs/informe.md` y `docs/ENTREGA.md` (en `docs/generar_informe.py` también, si vuelve a generar el informe).
2. **Pegar el instructivo oficial** y comprobar que el informe cubra cada punto (no llegó el texto del instructivo; solo el marcador `[PEGAR AQUÍ…]`).
3. **Informe a PDF/Word:** abrir `docs/informe.md` en un editor Markdown (VS Code + extensión «Markdown PDF», Typora) o `pandoc docs/informe.md -o informe.pdf`; insertar las capturas de las gráficas (sección e.4).
4. **Publicar en GitHub y GitHub Pages:** pasos exactos en el README.
5. **Grabar el video** (1 min): grabador de pantalla (OBS, Xbox Game Bar con Win+G, o el del celular) y subirlo a YouTube (no listado) o Drive con enlace público.
6. **Enviar** el texto de la sección 2 con los tres enlaces reales.
