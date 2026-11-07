# Tanque comunitario de agua en un barrio de La Paz
**Desafío de Métodos Numéricos: solución analítica vs. Heun vs. RK4**

> Todos los parámetros son **hipotéticos**. Los resultados no son predicciones comprobadas de un tanque real.

## Descripción del problema
En muchos barrios de ladera de La Paz el agua llega por turnos y se almacena en un tanque comunitario. Se modela el volumen de agua V(t) con ingreso constante y consumo/pérdida proporcional al volumen. Pregunta: ¿en cuántas horas el tanque alcanza el 90 % de su volumen de equilibrio y cuál es el volumen a las 24 h? Meta: mantener V ≥ 3 000 L (40 familias × 75 L).

## Modelo
- **EDO:** `dV/dt = Q − k·V`
- **Condición inicial:** `V(0) = V₀`
- V (L), t (h), Q (L/h), k (1/h).
- Valores por defecto (hipotéticos): Q = 500 L/h, k = 0.1 1/h, V₀ = 500 L, T = 24 h.

## Solución analítica
Por factor integrante `μ = e^(kt)`:

```
V(t) = Q/k + (V₀ − Q/k)·e^(−kt)
```

Equilibrio: V_eq = Q/k = 5 000 L. Con los valores por defecto: t₉₀ = ln(9)/k ≈ 21.97 h y V(24) ≈ 4 591.77 L.

## Métodos numéricos
- **Heun:** `Ṽ = Vₙ + h·f(Vₙ)`, `Vₙ₊₁ = Vₙ + (h/2)[f(Vₙ) + f(Ṽ)]` → orden 2.
- **RK4:** `Vₙ₊₁ = Vₙ + (h/6)(k₁ + 2k₂ + 2k₃ + k₄)` → orden 4.

## Estructura del proyecto
```
index.html          Interfaz (HTML)
style.css           Estilos (responsive)
script.js           Núcleo numérico + interfaz (Chart.js por CDN)
docs/informe.md     Informe (secciones a–f)
docs/generar_informe.py   Calcula los números del informe y resultados.json
docs/resultados.json      Valores de referencia calculados en Python
docs/ENTREGA.md     Guion del video, texto de envío, preguntas del profesor
tests/test.js       Pruebas rápidas (Node)
```

## Ejecutar localmente
No requiere instalación. Opciones:
```bash
# Opción 1: abrir index.html con doble clic (necesita internet para Chart.js por CDN)
# Opción 2: servidor local
python3 -m http.server 8000      # luego abrir http://localhost:8000
```

## Pruebas
```bash
node tests/test.js               # compara JavaScript contra los valores calculados en Python
python3 docs/generar_informe.py  # regenera informe.md y resultados.json
```

## Desplegar en GitHub Pages (paso a paso)
1. Cree un repositorio **público** vacío en github.com (por ejemplo `tanque-agua-la-paz`), sin README ni .gitignore.
2. En la carpeta del proyecto ejecute:
   ```bash
   git init
   git add .
   git commit -m "Desafío Métodos Numéricos: tanque de agua, Heun vs RK4"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/tanque-agua-la-paz.git
   git push -u origin main
   ```
3. En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**.
4. Espere 1–2 minutos. La app quedará en `https://TU_USUARIO.github.io/tanque-agua-la-paz/`.

## Autor
**[Valencia Peralta Rafael Andres]** · Materia: Métodos Numéricos · Ingeniería en Sistemas (Informática) · La Paz, Bolivia
