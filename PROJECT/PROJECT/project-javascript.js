var transactions = JSON.parse(localStorage.getItem('ft_transactions')) || [];
var goals        = JSON.parse(localStorage.getItem('ft_goals'))        || [];
var budgets      = JSON.parse(localStorage.getItem('ft_budgets'))      || {Food:5000, Transport:2000, Entertainment:3000, Health:2000, Shopping:4000, Other:2000};
function saveData() {
  localStorage.setItem('ft_transactions', JSON.stringify(transactions));
  localStorage.setItem('ft_goals',        JSON.stringify(goals));
  localStorage.setItem('ft_budgets',      JSON.stringify(budgets));
}
function showPage(name) {
  var pages = document.querySelectorAll('.page');
  for (var i = 0; i < pages.length; i++) pages[i].classList.remove('active');
  var t = document.getElementById('page-' + name);
  if (t) t.classList.add('active');
}
function toggleTheme() {
  document.body.classList.toggle('light');
  document.querySelector('.theme-btn').textContent = document.body.classList.contains('light') ? '🌞 Light Mode' : '🌙 Dark Mode';
}
function tagClass(cat) {
  var m = {Food:'tag-food', Transport:'tag-transport', Entertainment:'tag-entertain', Health:'tag-health', Shopping:'tag-shopping', Salary:'tag-salary', Other:'tag-other'};
  return m[cat] || 'tag-other';
}
function fmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN', {minimumFractionDigits:2});
}
function getTotals() {
  var inc = 0, exp = 0;
  for (var i = 0; i < transactions.length; i++) {
    if (transactions[i].type === 'Income') inc += Number(transactions[i].amount);
    else exp += Number(transactions[i].amount);
  }
  return {income:inc, expense:exp, balance:inc - exp};
}
function spentByCategory() {
  var r = {};
  for (var i = 0; i < transactions.length; i++) {
    var t = transactions[i];
    if (t.type === 'Expense') { r[t.category] = (r[t.category] || 0) + Number(t.amount); }
  }
  return r;
}
function drawChart(id) {
  var canvas = document.getElementById(id);
  if (!canvas) return;
  var ctx = canvas.getContext('2d'), tot = getTotals();
  canvas.width = canvas.offsetWidth || 500; canvas.height = 200;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var bw = 80, gap = 60, sx = canvas.width / 2 - bw - gap / 2;
  var mx = Math.max(tot.income, tot.expense, 1), mh = 140;
  var tc = document.body.classList.contains('light') ? '#6b7a99' : '#888';
  function bar(x, h, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x, 190 - h, bw, h, 6); ctx.fill(); }
  var iH = (tot.income / mx) * mh, eH = (tot.expense / mx) * mh;
  bar(sx, iH, '#00d9a3');
  bar(sx + bw + gap, eH, '#ff6b6b');
  ctx.fillStyle = tc; ctx.font = '13px Calibri, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('Income', sx + bw / 2, 200);
  ctx.fillText('Expense', sx + bw + gap + bw / 2, 200);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Calibri, sans-serif';
  if (iH > 20) ctx.fillText(fmt(tot.income),  sx + bw / 2, 190 - iH + 16);
  if (eH > 20) ctx.fillText(fmt(tot.expense), sx + bw + gap + bw / 2, 190 - eH + 16);
}
function addTransaction(d) {
  d.id = Date.now();
  d.date = d.date || new Date().toISOString().split('T')[0];
  transactions.unshift(d); saveData();
}
function deleteTransaction(id) {
  var r = [];
  for (var i = 0; i < transactions.length; i++) if (transactions[i].id !== id) r.push(transactions[i]);
  transactions = r; saveData();
}
function addGoal(d)       { d.id = Date.now(); d.saved = 0; d.done = false; goals.push(d); saveData(); }
function deleteGoal(id)   { goals = goals.filter(function(g) { return g.id !== id; }); saveData(); }
function addToGoal(id, a) {
  for (var i = 0; i < goals.length; i++) {
    if (goals[i].id === id) { goals[i].saved += Number(a); if (goals[i].saved >= goals[i].target) goals[i].done = true; break; }
  }
  saveData();
}
function setBudget(cat, amt) { budgets[cat] = Number(amt); saveData(); }
function spendingByDay(year, month) {
  var r = {};
  for (var i = 0; i < transactions.length; i++) {
    var t = transactions[i], d = new Date(t.date);
    if (d.getFullYear() === year && d.getMonth() === month && t.type === 'Expense') {
      r[d.getDate()] = (r[d.getDate()] || 0) + Number(t.amount);
    }
  }
  return r;
}
