/* 月末に運用益、積立、6か月ごとのボーナス投資を反映します。 */
(function (root) {
  'use strict';
  function simulate({ initial, monthly, bonus, annualRate, target }, maxMonths = 1200) {
    const values = [initial, monthly, bonus, annualRate, target];
    if (values.some(value => !Number.isFinite(value)) || initial < 0 || monthly < 0 || bonus < 0 || annualRate < 0 || annualRate > 100 || target <= 0) {
      throw new Error('金額は0以上、目標金額は0より大きい値、想定年利は0〜100%で入力してください。');
    }
    let balance = initial;
    let principal = initial;
    const points = [{ month: 0, balance, principal }];
    if (balance >= target) return { reached: true, months: 0, balance, principal, points };
    const rate = annualRate / 100 / 12;
    for (let month = 1; month <= maxMonths; month++) {
      const deposit = monthly + (month % 6 === 0 ? bonus : 0);
      balance = balance * (1 + rate) + deposit;
      principal += deposit;
      points.push({ month, balance, principal });
      if (balance >= target) return { reached: true, months: month, balance, principal, points };
    }
    return { reached: false, months: maxMonths, balance, principal, points };
  }
  function arrivalDate(start, months) {
    const date = new Date(start.getFullYear(), start.getMonth() + months, 1);
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  }
  root.AssetSimulator = { simulate, arrivalDate };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.AssetSimulator;
})(typeof window !== 'undefined' ? window : globalThis);
