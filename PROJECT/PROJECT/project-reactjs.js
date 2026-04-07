const { useState, useEffect } = React;
function SummaryCard(props) {
  return (
    <div className="summary-card">
      <div className="label">{props.label}</div>
      <div className={"value " + props.color}>{props.value}</div>
    </div>
  );
}
function Dashboard() {
  var tot = getTotals();
  var recent = transactions.slice(0, 5);
  useEffect(function() { drawChart('income-chart'); }, []);
  return (
    <div>
      <h2 className="page-title">🏠 Dashboard</h2>
      <div className="summary-grid">
        <SummaryCard label="💰 Balance"    value={fmt(tot.balance)}    color="blue"  />
        <SummaryCard label="📈 Income"     value={fmt(tot.income)}     color="green" />
        <SummaryCard label="📉 Expenses"   value={fmt(tot.expense)}    color="red"   />
        <SummaryCard label="📦 Total Txns" value={transactions.length} color="blue"  />
      </div>
      <div className="chart-container">
        <h3>Income vs Expenses</h3>
        <canvas id="income-chart" style={{width:'100%', height:'200px'}}></canvas>
      </div>
      <div className="card">
        <h3 style={{fontFamily:'Calibri,sans-serif', marginBottom:'14px'}}>🕒 Recent Transactions</h3>
        {recent.length === 0
          ? <p style={{color:'var(--muted)'}}>No transactions yet.</p>
          : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Title</th><th>Category</th><th>Type</th><th>Amount</th><th>Date</th></tr></thead>
                <tbody>
                  {recent.map(function(t) {
                    return (
                      <tr key={t.id}>
                        <td>{t.title}</td>
                        <td><span className={"tag " + tagClass(t.category)}>{t.category}</span></td>
                        <td>{t.type}</td>
                        <td className={t.type==='Income'?'amount-income':'amount-expense'}>
                          {t.type==='Income'?'+':'-'}{fmt(t.amount)}
                        </td>
                        <td style={{color:'var(--muted)'}}>{t.date}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        }
      </div>
    </div>
  );
}
function Transactions() {
  var titleState   = useState('');        var title   = titleState[0];   var setTitle   = titleState[1];
  var amountState  = useState('');        var amount  = amountState[0];  var setAmount  = amountState[1];
  var catState     = useState('Food');    var cat     = catState[0];     var setCat     = catState[1];
  var typeState    = useState('Expense'); var type    = typeState[0];    var setType    = typeState[1];
  var dateState    = useState(new Date().toISOString().split('T')[0]);
  var date = dateState[0]; var setDate = dateState[1];
  var noteState    = useState('');        var note    = noteState[0];    var setNote    = noteState[1];
  var successState = useState(false);     var success = successState[0]; var setSuccess = successState[1];
  var errorState   = useState('');        var error   = errorState[0];   var setError   = errorState[1];
  var searchState  = useState('');        var search  = searchState[0];  var setSearch  = searchState[1];
  var filterState  = useState('All');     var filter  = filterState[0];  var setFilter  = filterState[1];
  var tickState    = useState(0);         var tick    = tickState[0];    var setTick    = tickState[1];
  var cats = ['Food','Transport','Entertainment','Health','Shopping','Salary','Other'];
  function handleSubmit() {
    if (!title.trim())                  { setError('Please enter a title.'); return; }
    if (!amount || Number(amount) <= 0) { setError('Enter a valid amount.'); return; }
    setError('');
    addTransaction({title:title, amount:Number(amount), category:cat, type:type, date:date, note:note});
    setTitle(''); setAmount(''); setNote('');
    setSuccess(true);
    setTimeout(function() { setSuccess(false); setTick(tick + 1); }, 2000);
  }
  function handleDelete(id) { deleteTransaction(id); setTick(tick + 1); }
  var filtered = [], i = 0;
  while (i < transactions.length) {
    var t = transactions[i];
    if (t.title.toLowerCase().indexOf(search.toLowerCase()) !== -1 && (filter==='All' || t.type===filter)) filtered.push(t);
    i++;
  }
  return (
    <div>
      <h2 className="page-title">💳 Transactions</h2>
      <div className="tx-layout">
        <div className="form-card">
          <h3>➕ Add Transaction</h3>
          <div className="form-group">
            <label>Type</label>
            <div className="radio-group">
              <label><input type="radio" name="txtype" value="Expense" checked={type==='Expense'} onChange={function(e){setType(e.target.value);}} /> Expense</label>
              <label><input type="radio" name="txtype" value="Income"  checked={type==='Income'}  onChange={function(e){setType(e.target.value);}} /> Income</label>
            </div>
          </div>
          <div className="form-group">
            <label>Title</label>
            <input type="text" placeholder="e.g. Grocery shopping" value={title}
              onChange={function(e){setTitle(e.target.value);}}
              onMouseOver={function(e){e.target.style.borderColor='var(--accent)';}}
              onMouseOut={function(e){e.target.style.borderColor='';}} />
          </div>
          <div className="form-group">
            <label>Amount (₹)</label>
            <input type="number" placeholder="0.00" min="0" value={amount} onChange={function(e){setAmount(e.target.value);}} />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={cat} onChange={function(e){setCat(e.target.value);}}>
              {cats.map(function(c){return <option key={c} value={c}>{c}</option>;})}
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={date} onChange={function(e){setDate(e.target.value);}} />
          </div>
          <div className="form-group">
            <label>Note (optional)</label>
            <textarea rows="2" placeholder="Add a note..." value={note} onChange={function(e){setNote(e.target.value);}}></textarea>
          </div>
          {error && <p style={{color:'var(--accent2)',fontSize:'0.83rem',marginBottom:'10px'}}>⚠️ {error}</p>}
          <button className="btn btn-primary" onClick={handleSubmit}>Add Transaction</button>
          {success && <div className="success-msg show">✅ Transaction added!</div>}
        </div>
        <div>
          <div className="filter-bar">
            <input type="text" placeholder="🔍 Search..." value={search} onChange={function(e){setSearch(e.target.value);}} />
            <select value={filter} onChange={function(e){setFilter(e.target.value);}}>
              <option value="All">All Types</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
          </div>
          <div className="card">
            {filtered.length === 0
              ? <p style={{color:'var(--muted)'}}>No transactions found.</p>
              : (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Title</th><th>Category</th><th>Type</th><th>Amount</th><th>Date</th><th>Note</th><th></th></tr></thead>
                    <tbody>
                      {filtered.map(function(t){
                        return (
                          <tr key={t.id}>
                            <td>{t.title}</td>
                            <td><span className={"tag "+tagClass(t.category)}>{t.category}</span></td>
                            <td>{t.type}</td>
                            <td className={t.type==='Income'?'amount-income':'amount-expense'}>
                              {t.type==='Income'?'+':'-'}{fmt(t.amount)}
                            </td>
                            <td style={{color:'var(--muted)'}}>{t.date}</td>
                            <td style={{color:'var(--muted)',fontSize:'0.78rem'}}>{t.note||'—'}</td>
                            <td><button className="btn btn-danger" onClick={function(){handleDelete(t.id);}}>Delete</button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
}
function BudgetPlanner() {
  var alertsState  = useState([]); var alerts  = alertsState[0];  var setAlerts  = alertsState[1];
  var editingState = useState(null);var editing = editingState[0];var setEditing = editingState[1];
  var tempValState = useState(''); var tempVal = tempValState[0]; var setTempVal = tempValState[1];
  var spent = spentByCategory();
  var cats  = Object.keys(budgets);
  useEffect(function() {
    var over = [];
    for (var i = 0; i < cats.length; i++) {
      var c = cats[i];
      if ((spent[c]||0) > budgets[c]) over.push(c + ' over budget by ' + fmt((spent[c]||0) - budgets[c]) + '!');
    }
    setAlerts(over);
  }, []);
  function getStatus(cat) {
    var p = ((spent[cat]||0) / budgets[cat]) * 100;
    return p >= 100 ? 'danger' : p >= 75 ? 'warning' : 'safe';
  }
  return (
    <div>
      <h2 className="page-title">📊 Budget Planner</h2>
      {alerts.map(function(a,i){return <div key={i} className="alert">🔔 {a}</div>;})}
      <div className="budget-list">
        {cats.map(function(cat){
          var s = spent[cat]||0, pct = Math.min((s/budgets[cat])*100,100).toFixed(0);
          return (
            <div key={cat} className="budget-item">
              <div className="budget-item-header">
                <span className="cat-name"><span className={"tag "+tagClass(cat)} style={{marginRight:'8px'}}>{cat}</span></span>
                <span className="amounts">{fmt(s)} / {fmt(budgets[cat])}
                  <button className="btn-sm" style={{marginLeft:'10px'}} onClick={function(){setEditing(cat);setTempVal(budgets[cat]);}}>Edit</button>
                </span>
              </div>
              {editing===cat && (
                <div style={{display:'flex',gap:'8px',marginBottom:'10px'}}>
                  <input type="number" value={tempVal} onChange={function(e){setTempVal(e.target.value);}}
                    style={{background:'var(--surface)',border:'1px solid var(--accent)',borderRadius:'6px',padding:'6px 10px',color:'var(--text)',fontFamily:'Calibri,sans-serif',width:'130px'}} />
                  <button className="btn-sm" onClick={function(){if(tempVal&&Number(tempVal)>0){setBudget(editing,tempVal);setEditing(null);}}}>Save</button>
                </div>
              )}
              <div className="progress-bar-bg">
                <div className={"progress-bar-fill "+getStatus(cat)} style={{width:pct+'%'}}></div>
              </div>
              <div style={{fontSize:'0.73rem',color:'var(--muted)',marginTop:'5px'}}>{pct}% used</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function GoalTracker() {
  var nameState   = useState(''); var name   = nameState[0];   var setName   = nameState[1];
  var targetState = useState(''); var target = targetState[0]; var setTarget = targetState[1];
  var addAmtState = useState({}); var addAmt = addAmtState[0]; var setAddAmt = addAmtState[1];
  var tickState   = useState(0);  var tick   = tickState[0];   var setTick   = tickState[1];
  function handleAddGoal() {
    if (!name.trim()||!target||Number(target)<=0) return;
    addGoal({name:name, target:Number(target)}); setName(''); setTarget(''); setTick(tick+1);
  }
  function handleAddMoney(id) {
    if (!addAmt[id]||Number(addAmt[id])<=0) return;
    addToGoal(id, addAmt[id]);
    var u={}; for(var k in addAmt){u[k]=addAmt[k];} u[id]=''; setAddAmt(u); setTick(tick+1);
  }
  return (
    <div>
      <h2 className="page-title">🎯 Goal Tracker</h2>
      <div className="form-card" style={{marginBottom:'26px'}}>
        <h3>Add New Goal</h3>
        <div className="form-group"><label>Goal Name</label>
          <input type="text" placeholder="e.g. Buy a Laptop" value={name} onChange={function(e){setName(e.target.value);}} /></div>
        <div className="form-group"><label>Target Amount (₹)</label>
          <input type="number" placeholder="e.g. 50000" value={target} onChange={function(e){setTarget(e.target.value);}} /></div>
        <button className="btn btn-primary" onClick={handleAddGoal}>Add Goal</button>
      </div>
      {goals.length===0
        ? <p style={{color:'var(--muted)'}}>No goals yet.</p>
        : (
          <div className="goals-grid">
            {goals.map(function(g){
              var pct=Math.min((g.saved/g.target)*100,100).toFixed(0);
              return (
                <div key={g.id} className={"goal-card"+(g.done?' completed':'')}>
                  <h3>{g.name} {g.done?'✅':''}</h3>
                  <p className="goal-meta">{fmt(g.saved)} saved of {fmt(g.target)}</p>
                  <div className="progress-bar-bg">
                    <div className={"progress-bar-fill "+(g.done?'safe':'warning')} style={{width:pct+'%'}}></div>
                  </div>
                  <p style={{fontSize:'0.73rem',color:'var(--muted)',marginTop:'5px'}}>{pct}% reached</p>
                  {!g.done && (
                    <div className="goal-actions">
                      <input type="number" placeholder="Add ₹" value={addAmt[g.id]||''}
                        onChange={function(e){var u={}; for(var k in addAmt){u[k]=addAmt[k];} u[g.id]=e.target.value; setAddAmt(u);}}
                        style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'6px',padding:'6px 9px',color:'var(--text)',fontFamily:'Calibri,sans-serif',width:'100px',fontSize:'0.8rem'}} />
                      <button className="btn-sm" onClick={function(){handleAddMoney(g.id);}}>Add</button>
                    </div>
                  )}
                  <button className="btn btn-danger" style={{marginTop:'10px'}} onClick={function(){deleteGoal(g.id);setTick(tick+1);}}>Delete</button>
                </div>
              );
            })}
          </div>
        )
      }
    </div>
  );
}
function CalendarView() {
  var today = new Date();
  var yearState  = useState(today.getFullYear()); var year  = yearState[0];  var setYear  = yearState[1];
  var monthState = useState(today.getMonth());    var month = monthState[0]; var setMonth = monthState[1];
  var months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  var days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var firstDay=new Date(year,month,1).getDay(), daysInMonth=new Date(year,month+1,0).getDate();
  var spending=spendingByDay(year,month);
  var cells=[];
  for(var i=0;i<firstDay;i++) cells.push(null);
  for(var d=1;d<=daysInMonth;d++) cells.push(d);
  function prevMonth(){if(month===0){setYear(year-1);setMonth(11);}else setMonth(month-1);}
  function nextMonth(){if(month===11){setYear(year+1);setMonth(0);}else setMonth(month+1);}
  return (
    <div>
      <h2 className="page-title">📅 Monthly Calendar</h2>
      <div className="card">
        <div className="cal-nav">
          <button onClick={prevMonth}>◀ Prev</button>
          <h3>{months[month]} {year}</h3>
          <button onClick={nextMonth}>Next ▶</button>
        </div>
        <div className="calendar-grid">
          {days.map(function(d){return <div key={d} className="cal-day-name">{d}</div>;})}
          {cells.map(function(day,idx){
            if(!day) return <div key={'e'+idx} className="cal-day empty"></div>;
            var isToday=day===today.getDate()&&month===today.getMonth()&&year===today.getFullYear();
            return (
              <div key={day} className={"cal-day"+(isToday?' today':'')}>
                <div className="day-num">{day}</div>
                {spending[day]?<div className="day-amount">{fmt(spending[day])}</div>:null}
              </div>
            );
          })}
        </div>
        <p style={{color:'var(--muted)',fontSize:'0.75rem',marginTop:'12px'}}>🔴 Red amounts = expenses for that day.</p>
      </div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('dashboard-root')).render(<Dashboard />);
ReactDOM.createRoot(document.getElementById('transactions-root')).render(<Transactions />);
ReactDOM.createRoot(document.getElementById('budget-root')).render(<BudgetPlanner />);
ReactDOM.createRoot(document.getElementById('goals-root')).render(<GoalTracker />);
ReactDOM.createRoot(document.getElementById('calendar-root')).render(<CalendarView />);
showPage('dashboard');
