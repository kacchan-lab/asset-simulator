'use strict';
const form = document.querySelector('#plan');
const summary = document.querySelector('#summary');
const error = document.querySelector('#error');
const chart = document.querySelector('#chart');
const yen = value => `${Math.round(value).toLocaleString('ja-JP')}円`;
const svgNS = 'http://www.w3.org/2000/svg';
function svgElement(tag, attributes, text) {
  const element = document.createElementNS(svgNS, tag);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  if (text !== undefined) element.textContent = text;
  chart.append(element);
  return element;
}
function drawChart(result, target) {
  chart.querySelectorAll(':scope > :not(title):not(desc)').forEach(element => element.remove());
  const left = 76, top = 24, width = 580, height = 276;
  const maxValue = Math.max(target, result.balance, result.principal, 1) * 1.08;
  const x = month => left + month / Math.max(result.months, 1) * width;
  const y = value => top + height - value / maxValue * height;
  for (let i = 0; i <= 4; i++) {
    const value = maxValue * i / 4;
    svgElement('line', { x1: left, x2: left + width, y1: y(value), y2: y(value), stroke: '#e7eee9' });
    svgElement('text', { x: left - 10, y: y(value) + 4, 'text-anchor': 'end', fill: '#687a70', 'font-size': 12 }, (value / 10000).toLocaleString('ja-JP', { maximumFractionDigits: 1 }));
    const month = result.months * i / 4;
    svgElement('text', { x: x(month), y: top + height + 26, 'text-anchor': 'middle', fill: '#687a70', 'font-size': 12 }, `${(month / 12).toLocaleString('ja-JP', { maximumFractionDigits: 1 })}年`);
  }
  svgElement('line', { x1: left, x2: left + width, y1: y(target), y2: y(target), stroke: '#b99246', 'stroke-dasharray': '5 5' });
  svgElement('text', { x: left + width, y: y(target) - 6, 'text-anchor': 'end', fill: '#947235', 'font-size': 12 }, '目標');
  for (const [key, color] of [['principal', '#9bb9b1'], ['balance', '#287e5b']]) {
    svgElement('polyline', { points: result.points.map(p => `${x(p.month)},${y(p[key])}`).join(' '), fill: 'none', stroke: color, 'stroke-width': 3, 'stroke-linejoin': 'round' });
    const last = result.points[result.points.length - 1];
    svgElement('circle', { cx: x(last.month), cy: y(last[key]), r: 4, fill: color });
  }
  document.querySelector('#chart-description').textContent = `${result.months}か月間の資産推移。開始時${yen(result.points[0].balance)}、終了時${yen(result.balance)}、投資元本${yen(result.principal)}。破線は目標金額${yen(target)}です。`;
}
function update() {
  if (!form.checkValidity()) {
    error.textContent = 'すべての項目に有効な数値を入力してください。金額は0以上、目標金額は0より大きい値、想定年利は0〜100%です。';
    error.hidden = false;
    summary.replaceChildren();
    chart.setAttribute('hidden', '');
    return;
  }
  try {
    const input = Object.fromEntries(new FormData(form).entries());
    for (const key of Object.keys(input)) input[key] = Number(input[key]);
    const result = AssetSimulator.simulate(input);
    error.hidden = true;
    chart.removeAttribute('hidden');
    const duration = result.months === 0 ? 'すでに目標達成' : `${Math.floor(result.months / 12)}年${result.months % 12}か月`;
    const title = result.reached ? '目標までの期間' : '100年以内では目標に届きません';
    const date = result.reached ? `到達予定：${AssetSimulator.arrivalDate(new Date(), result.months)}` : '積立額や想定年利を見直して、再計算できます。';
    summary.innerHTML = `<div class="hero"><p>${title}</p><div class="duration">${result.reached ? duration : '目標未到達'}</div><div class="date">${date}</div></div><div class="metrics"><div class="metric"><span>${result.reached ? '到達時' : '100年後'}の資産総額</span><strong>${yen(result.balance)}</strong></div><div class="metric"><span>運用益</span><strong>${yen(result.balance - result.principal)}</strong></div></div>`;
    drawChart(result, input.target);
  } catch (exception) {
    error.textContent = exception.message;
    error.hidden = false;
    summary.replaceChildren();
    chart.setAttribute('hidden', '');
  }
}
form.addEventListener('submit', event => { event.preventDefault(); update(); });
form.addEventListener('input', update);
update();
