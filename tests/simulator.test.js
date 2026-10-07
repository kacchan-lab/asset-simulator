'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { simulate, arrivalDate } = require('../simulator.js');
const base = { initial: 0, monthly: 100, bonus: 0, annualRate: 0, target: 1200 };
test('年利0%の毎月積立は12か月で到達', () => {
  const r = simulate(base);
  assert.equal(r.months, 12);
  assert.equal(r.balance, 1200);
  assert.equal(r.principal, 1200);
});
test('ボーナスは6か月ごとに加算', () => {
  const r = simulate({ ...base, monthly: 0, bonus: 500, target: 1000 });
  assert.equal(r.months, 12);
  assert.equal(r.points[5].balance, 0);
  assert.equal(r.points[6].balance, 500);
  assert.equal(r.points[11].balance, 500);
});
test('月単位の複利と月末積立', () => {
  const r = simulate({ ...base, initial: 1000, monthly: 100, annualRate: 12, target: 100000 }, 2);
  assert.ok(Math.abs(r.balance - 1221.1) < 1e-9);
  assert.equal(r.principal, 1200);
});
test('現在の資産で達成済み', () => {
  const r = simulate({ ...base, initial: 1200 });
  assert.equal(r.months, 0);
  assert.equal(r.reached, true);
  assert.equal(r.points.length, 1);
});
test('投資なしでも運用益で到達', () => {
  assert.equal(simulate({ ...base, initial: 1000, monthly: 0, annualRate: 12, target: 1010 }).months, 1);
});
test('到達不能は100年で打ち切り', () => {
  const r = simulate({ ...base, monthly: 0 });
  assert.equal(r.reached, false);
  assert.equal(r.months, 1200);
});
test('不正な入力は拒否', () => {
  for (const patch of [{ initial: -1 }, { monthly: NaN }, { bonus: Infinity }, { target: 0 }, { annualRate: -1 }, { annualRate: 101 }]) {
    assert.throws(() => simulate({ ...base, ...patch }));
  }
});
test('年月計算は年越しと月末を正しく処理', () => {
  assert.equal(arrivalDate(new Date(2026, 9, 31), 4), '2027年2月');
  assert.equal(arrivalDate(new Date(2026, 9, 31), 0), '2026年10月');
});
