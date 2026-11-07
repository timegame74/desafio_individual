// Pruebas rapidas: node tests/test.js
// Comparan el nucleo de script.js contra docs/resultados.json (calculado en Python)
// y contra propiedades matematicas conocidas.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const S = require('../script.js');
const ref = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'docs', 'resultados.json'), 'utf8'));

let ok = 0;
const test = (nombre, fn) => { fn(); ok++; console.log('✔', nombre); };
const cerca = (a, b, tol, msg) => assert(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);

const P = { V0: 500, Q: 500, k: 0.1, T: 24, N: 40, c: 75 };

test('Solución analítica: V(0)=V0 y V(24)', () => {
  cerca(S.exacta(0, P), 500, 1e-12, 'V(0)');
  cerca(S.exacta(24, P), ref.V24, 1e-9, 'V(24)');
  cerca(S.exacta(24, P), 4591.769210197644, 1e-6, 'V(24) valor fijo');
});

test('Solución analítica cumple la EDO (derivada numérica)', () => {
  for (const t of [0.5, 5, 12, 20]) {
    const d = 1e-6;
    const dV = (S.exacta(t + d, P) - S.exacta(t - d, P)) / (2 * d);
    cerca(dV, P.Q - P.k * S.exacta(t, P), 1e-4, `EDO en t=${t}`);
  }
});

test('t90 y tiempo hasta V_min', () => {
  cerca(S.t90(P), ref.t90, 1e-9, 't90');
  cerca(S.t90(P), Math.log(9) / 0.1, 1e-9, 't90 = ln9/k');
  cerca(S.tiempoHasta(3000, P), ref.tVmin, 1e-9, 'tVmin');
});

for (const h of [4, 2, 1, 0.5, 0.25]) {
  test(`Heun y RK4 coinciden con Python (h=${h})`, () => {
    const r = S.simular({ ...P, h });
    const s = ref.series[String(h)];
    assert.strictEqual(r.filas.length, s.t.length);
    r.filas.forEach((fila, i) => {
      cerca(fila.t, s.t[i], 1e-12, 't');
      cerca(fila.exacta, s.exacta[i], 1e-9, 'exacta');
      cerca(fila.heun, s.heun[i], 1e-9, 'Heun');
      cerca(fila.rk4, s.rk4[i], 1e-9, 'RK4');
    });
  });
}

test('Valores del informe (h=2): error máx. Heun 12.8718 y RK4 0.026086', () => {
  const r = S.simular({ ...P, h: 2 });
  cerca(r.maxAbsHeun, 12.871809, 1e-5, 'Heun');
  cerca(r.maxAbsRK4, 0.02608629, 1e-7, 'RK4');
});

test('Orden de convergencia: Heun ≈ 2 y RK4 ≈ 4', () => {
  const e = (h) => S.simular({ ...P, h });
  const a = e(1), b = e(0.5);
  const oH = Math.log2(a.maxAbsHeun / b.maxAbsHeun);
  const oR = Math.log2(a.maxAbsRK4 / b.maxAbsRK4);
  assert(oH > 1.9 && oH < 2.3, `orden Heun ${oH}`);
  assert(oR > 3.8 && oR < 4.3, `orden RK4 ${oR}`);
});

test('RK4 es más preciso que Heun con el mismo h', () => {
  const r = S.simular({ ...P, h: 2 });
  assert(r.maxAbsRK4 < r.maxAbsHeun);
});

test('Error relativo: división por cero devuelve null', () => {
  assert.strictEqual(S.errRel(0, 1), null);
  cerca(S.errRel(100, 99), 1, 1e-12, 'rel');
  const r = S.simular({ V0: 0, Q: 0, k: 0.1, T: 10, h: 1, N: 1, c: 0 });
  assert(r.filas.every(f => f.eRelHeun === null && f.eRelRK4 === null));
});

test('Paso que no divide a T: termina exactamente en T', () => {
  const r = S.simular({ ...P, h: 5 });
  assert.strictEqual(r.filas[r.filas.length - 1].t, 24);
  cerca(r.filas[r.filas.length - 1].exacta, ref.V24, 1e-9, 'V(24)');
});

test('Validación de entradas', () => {
  assert.strictEqual(S.validar({ ...P, h: 2 }).length, 0);
  assert(S.validar({ ...P, h: 0 }).length > 0, 'h=0');
  assert(S.validar({ ...P, h: -1 }).length > 0, 'h<0');
  assert(S.validar({ ...P, h: 30 }).length > 0, 'h>T');
  assert(S.validar({ ...P, h: NaN }).length > 0, 'h NaN');
  assert(S.validar({ ...P, V0: NaN, h: 2 }).length > 0, 'V0 NaN');
  assert(S.validar({ ...P, k: 0, h: 2 }).length > 0, 'k=0');
  assert(S.validar({ ...P, T: 1000, h: 0.05 }).length > 0, 'demasiados pasos');
});

test('La interpretación automática se genera', () => {
  const p = { ...P, h: 2 };
  const txt = S.interpretar(S.simular(p), p).join(' ');
  assert(txt.includes('hipotéticos') && txt.includes('RK4'));
});

console.log(`\n${ok} pruebas pasaron.`);
