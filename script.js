/* Tanque comunitario de agua - La Paz, Bolivia
 * Modelo: dV/dt = Q - k*V,  V(0) = V0   (parametros HIPOTETICOS)
 * Metodos: solucion analitica, Heun (RK2) y RK4 clasico.
 * Este archivo contiene (1) el nucleo numerico, reutilizado por las pruebas en Node,
 * y (2) la interfaz de usuario, que solo se ejecuta en el navegador.
 */

/* ===================== NUCLEO NUMERICO ===================== */
const MAX_PASOS = 10000;

function f(V, p) { return p.Q - p.k * V; }

function exacta(t, p) {
  const Veq = p.Q / p.k;
  return Veq + (p.V0 - Veq) * Math.exp(-p.k * t);
}

function pasoHeun(V, h, p) {
  const k1 = f(V, p);
  const vTilde = V + h * k1;                 // predictor (Euler)
  return V + (h / 2) * (k1 + f(vTilde, p));  // corrector (trapecio)
}

function pasoRK4(V, h, p) {
  const k1 = f(V, p);
  const k2 = f(V + (h / 2) * k1, p);
  const k3 = f(V + (h / 2) * k2, p);
  const k4 = f(V + h * k3, p);
  return V + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
}

/* Valida entradas; devuelve lista de mensajes de error (vacia si todo bien). */
function validar(p) {
  const errores = [];
  const campos = [
    ['V0', 'Volumen inicial V₀', 0, 1e6],
    ['Q', 'Caudal de ingreso Q', 0, 1e5],
    ['k', 'Tasa de consumo k', 0.001, 5],
    ['T', 'Tiempo final T', 1, 1000],
    ['N', 'Número de familias N', 1, 10000],
    ['c', 'Consumo mínimo por familia', 0, 10000],
  ];
  for (const [clave, nombre, min, max] of campos) {
    const v = p[clave];
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      errores.push(`${nombre}: ingrese un número válido.`);
    } else if (v < min || v > max) {
      errores.push(`${nombre}: debe estar entre ${min} y ${max}.`);
    }
  }
  if (typeof p.h !== 'number' || !Number.isFinite(p.h)) {
    errores.push('Paso h: ingrese un número válido.');
  } else if (p.h <= 0) {
    errores.push('Paso h: debe ser mayor que 0.');
  } else if (Number.isFinite(p.T) && p.h > p.T) {
    errores.push('Paso h: no puede ser mayor que el tiempo final T.');
  } else if (Number.isFinite(p.T) && Math.ceil(p.T / p.h - 1e-9) > MAX_PASOS) {
    errores.push(`Con estos valores se necesitan ${Math.ceil(p.T / p.h)} pasos; el máximo permitido es ${MAX_PASOS}. Aumente h o reduzca T.`);
  }
  return errores;
}

/* Error relativo en %; null si el valor exacto es 0 (division por cero). */
function errRel(exact, aprox) {
  if (Math.abs(exact) < 1e-12) return null;
  return Math.abs(exact - aprox) / Math.abs(exact) * 100;
}

/* Simula con la misma malla para ambos metodos. Si T/h no es entero,
 * el ultimo paso se acorta para terminar exactamente en T. */
function simular(p) {
  const n = Math.ceil(p.T / p.h - 1e-9);
  const filas = [];
  let vh = p.V0, vr = p.V0;
  let tPrev = 0;
  for (let i = 0; i <= n; i++) {
    const t = Math.min(i * p.h, p.T);
    if (i > 0) {
      const hh = t - tPrev;
      vh = pasoHeun(vh, hh, p);
      vr = pasoRK4(vr, hh, p);
    }
    const ex = exacta(t, p);
    filas.push({
      i, t, exacta: ex, heun: vh, rk4: vr,
      eAbsHeun: Math.abs(ex - vh), eAbsRK4: Math.abs(ex - vr),
      eRelHeun: errRel(ex, vh), eRelRK4: errRel(ex, vr),
    });
    tPrev = t;
  }
  const maxErr = (clave) => Math.max(...filas.map(r => r[clave]));
  const maxRel = (clave) => {
    const v = filas.map(r => r[clave]).filter(x => x !== null);
    return v.length ? Math.max(...v) : null;
  };
  return {
    filas,
    n,
    maxAbsHeun: maxErr('eAbsHeun'), maxAbsRK4: maxErr('eAbsRK4'),
    maxRelHeun: maxRel('eRelHeun'), maxRelRK4: maxRel('eRelRK4'),
  };
}

/* Tiempo (h) para alcanzar un volumen objetivo W (analitico). null si no se alcanza. */
function tiempoHasta(W, p) {
  const Veq = p.Q / p.k;
  const num = Veq - p.V0, den = Veq - W;
  if (num === 0) return W === p.V0 ? 0 : null;
  const r = num / den;
  if (!(r > 0) || !Number.isFinite(r)) return null;
  const t = Math.log(r) / p.k;
  return t >= 0 ? t : null;
}

/* Tiempo al 90 % del equilibrio. null si Veq = 0 o V0 ya esta en/sobre ese nivel. */
function t90(p) {
  const Veq = p.Q / p.k;
  if (Veq <= 0 || p.V0 >= 0.9 * Veq) return null;
  return tiempoHasta(0.9 * Veq, p);
}

/* ===================== FORMATO E INTERPRETACION ===================== */
function fmt(x, d = 2) {
  if (x === null || x === undefined) return '—';
  if (x !== 0 && Math.abs(x) < 1e-3) return x.toExponential(2);
  return x.toLocaleString('es-BO', { minimumFractionDigits: d, maximumFractionDigits: d });
}

function interpretar(res, p) {
  const Veq = p.Q / p.k;
  const Vmin = p.N * p.c;
  const fin = res.filas[res.filas.length - 1];
  const out = [];
  out.push(`Con los datos ingresados (hipotéticos), el tanque tendería a estabilizarse en ${fmt(Veq, 0)} litros (V = Q/k). Al cabo de ${fmt(p.T, 0)} horas el modelo exacto da ${fmt(fin.exacta)} L.`);
  const t9 = t90(p);
  if (t9 !== null) out.push(`El tanque llegaría al 90 % de ese nivel (${fmt(0.9 * Veq, 0)} L) en unas ${fmt(t9)} horas.`);
  else if (Veq > 0) out.push('El tanque ya parte en o por encima del 90 % del nivel de equilibrio, así que no hay un tiempo de llenado que calcular.');
  if (Vmin > 0) {
    const tm = tiempoHasta(Vmin, p);
    if (p.V0 >= Vmin && fin.exacta >= Vmin) {
      out.push(`La reserva mínima para ${p.N} familias (${fmt(Vmin, 0)} L) se cumple desde el inicio y al final del período.`);
    } else if (p.V0 < Vmin && fin.exacta >= Vmin && tm !== null) {
      out.push(`La reserva mínima para ${p.N} familias (${fmt(Vmin, 0)} L) se alcanzaría tras ${fmt(tm)} horas; antes de eso habría déficit.`);
    } else {
      out.push(`Con estos datos el tanque NO sostiene la reserva mínima de ${fmt(Vmin, 0)} L para ${p.N} familias al final del período.`);
    }
  }
  const mejor = res.maxAbsRK4 <= res.maxAbsHeun ? 'RK4' : 'Heun';
  out.push(`Comparación de métodos: error absoluto máximo de Heun = ${fmt(res.maxAbsHeun, 4)} L y de RK4 = ${fmt(res.maxAbsRK4, 6)} L. El método con menor error fue ${mejor}.`);
  out.push('Recuerde: es un modelo simplificado con parámetros supuestos, no una predicción comprobada del comportamiento real de un tanque.');
  return out;
}

/* ===================== EXPORTACION PARA PRUEBAS (Node) ===================== */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { exacta, pasoHeun, pasoRK4, simular, validar, errRel, tiempoHasta, t90, interpretar, MAX_PASOS };
}

/* ===================== INTERFAZ (solo navegador) ===================== */
if (typeof document !== 'undefined') {
  let grafSol = null, grafErr = null;

  const $ = (id) => document.getElementById(id);
  const leer = () => ({
    V0: parseFloat($('V0').value), Q: parseFloat($('Q').value), k: parseFloat($('k').value),
    h: parseFloat($('h').value), T: parseFloat($('T').value),
    N: parseFloat($('N').value), c: parseFloat($('c').value),
  });

  function calcular() {
    const p = leer();
    const errores = validar(p);
    const caja = $('errores');
    if (errores.length) {
      caja.innerHTML = '<strong>Revise los datos:</strong><ul>' + errores.map(e => `<li>${e}</li>`).join('') + '</ul>';
      caja.hidden = false;
      $('resultados').hidden = true;
      return;
    }
    caja.hidden = true;
    const res = simular(p);
    mostrar(res, p);
  }

  function mostrar(res, p) {
    $('resultados').hidden = false;
    const Veq = p.Q / p.k, fin = res.filas[res.filas.length - 1], t9 = t90(p);
    $('tarjetas').innerHTML = [
      ['Volumen de equilibrio Q/k', `${fmt(Veq, 0)} L`],
      ['Tiempo al 90 % del equilibrio', t9 === null ? '—' : `${fmt(t9)} h`],
      [`V(${fmt(p.T, 0)} h) exacto`, `${fmt(fin.exacta)} L`],
      ['Error máx. Heun (abs.)', `${fmt(res.maxAbsHeun, 4)} L`],
      ['Error máx. RK4 (abs.)', `${fmt(res.maxAbsRK4, 6)} L`],
      ['Pasos (n)', `${res.n}`],
    ].map(([a, b]) => `<div class="tarjeta"><span>${a}</span><strong>${b}</strong></div>`).join('');

    $('resumenErr').innerHTML = `
      <tr><th>Método</th><th>Error absoluto máx. (L)</th><th>Error relativo máx. (%)</th></tr>
      <tr><td>Heun</td><td>${fmt(res.maxAbsHeun, 6)}</td><td>${fmt(res.maxRelHeun, 6)}</td></tr>
      <tr><td>RK4</td><td>${fmt(res.maxAbsRK4, 8)}</td><td>${fmt(res.maxRelRK4, 8)}</td></tr>`;

    $('interpretacion').innerHTML = interpretar(res, p).map(s => `<p>${s}</p>`).join('');

    $('tabla').innerHTML = '<thead><tr><th>i</th><th>t (h)</th><th>Exacta (L)</th><th>Heun (L)</th><th>RK4 (L)</th>' +
      '<th>Err. abs. Heun</th><th>Err. rel. Heun (%)</th><th>Err. abs. RK4</th><th>Err. rel. RK4 (%)</th></tr></thead><tbody>' +
      res.filas.map(r => `<tr><td>${r.i}</td><td>${fmt(r.t)}</td><td>${fmt(r.exacta, 4)}</td><td>${fmt(r.heun, 4)}</td><td>${fmt(r.rk4, 4)}</td>` +
        `<td>${fmt(r.eAbsHeun, 6)}</td><td>${fmt(r.eRelHeun, 6)}</td><td>${fmt(r.eAbsRK4, 8)}</td><td>${fmt(r.eRelRK4, 8)}</td></tr>`).join('') + '</tbody>';

    graficar(res, p);
  }

  function graficar(res, p) {
    const pocos = res.filas.length <= 60;
    const fina = [];
    for (let j = 0; j <= 200; j++) { const t = p.T * j / 200; fina.push({ x: t, y: exacta(t, p) }); }
    const pts = (clave) => res.filas.map(r => ({ x: r.t, y: r[clave] }));
    const ejes = (tx, ty) => ({
      x: { type: 'linear', title: { display: true, text: tx } },
      y: { title: { display: true, text: ty } },
    });
    if (grafSol) grafSol.destroy();
    if (grafErr) grafErr.destroy();
    grafSol = new Chart($('gSol'), {
      type: 'line',
      data: { datasets: [
        { label: 'Exacta', data: fina, borderColor: '#1b1b1b', borderWidth: 2, pointRadius: 0 },
        { label: 'Heun', data: pts('heun'), borderColor: '#d9480f', borderDash: [6, 4], pointRadius: pocos ? 3 : 0, borderWidth: 2 },
        { label: 'RK4', data: pts('rk4'), borderColor: '#1971c2', borderDash: [2, 3], pointRadius: pocos ? 3 : 0, borderWidth: 2 },
      ] },
      options: { responsive: true, maintainAspectRatio: false, parsing: false, scales: ejes('Tiempo t (h)', 'Volumen V (L)') },
    });
    grafErr = new Chart($('gErr'), {
      type: 'line',
      data: { datasets: [
        { label: 'Error abs. Heun', data: pts('eAbsHeun'), borderColor: '#d9480f', pointRadius: pocos ? 3 : 0, borderWidth: 2 },
        { label: 'Error abs. RK4', data: pts('eAbsRK4'), borderColor: '#1971c2', pointRadius: pocos ? 3 : 0, borderWidth: 2 },
      ] },
      options: { responsive: true, maintainAspectRatio: false, parsing: false, scales: ejes('Tiempo t (h)', 'Error absoluto (L)') },
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    $('formulario').addEventListener('submit', (e) => { e.preventDefault(); calcular(); });
    $('restablecer').addEventListener('click', () => {
      setTimeout(calcular, 0);
    });
    calcular();
  });
}
