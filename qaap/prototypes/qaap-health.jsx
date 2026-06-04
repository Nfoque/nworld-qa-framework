// QAAP Health Dashboard Screen
function HealthScreen({ onNavigate }) {
  const [fadeIn, setFadeIn] = React.useState(false);
  const [selectedEnv, setSelectedEnv] = React.useState('all');
  React.useEffect(() => { const t = setTimeout(() => setFadeIn(true), 50); return () => clearTimeout(t); }, []);
  const d = QAAP_DATA;

  // Build pass-rate-over-time data for chart
  const chartData = [
    { day:'May 28', rate:91 }, { day:'May 29', rate:93 }, { day:'May 30', rate:90 },
    { day:'May 31', rate:94 }, { day:'Jun 1', rate:92 }, { day:'Jun 2', rate:88 },
    { day:'Jun 3', rate:95 }, { day:'Jun 4', rate:94 },
  ];

  const envComparison = [
    { env:'PRO', plans:[{name:'Checkout',rate:100},{name:'Payment API',rate:95},{name:'Auth',rate:98},{name:'Orders API',rate:100}] },
    { env:'PRE', plans:[{name:'Checkout',rate:96},{name:'Payment API',rate:88},{name:'Auth',rate:91},{name:'Orders API',rate:99}] },
    { env:'DEV', plans:[{name:'Checkout',rate:92},{name:'Payment API',rate:82},{name:'Auth',rate:87},{name:'Orders API',rate:97}] },
  ];

  return (
    <div className={`screen-content ${fadeIn ? 'screen-visible' : ''}`}>
      <div className="screen-header">
        <div>
          <h1 className="screen-title">Health Dashboard</h1>
          <p className="screen-subtitle">Monitor test plan health, detect degradation, and track quality trends.</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {['all','PRO','PRE','DEV'].map(env => (
            <button key={env} className={`btn-tab ${selectedEnv === env ? 'btn-tab-active' : ''}`}
              onClick={() => setSelectedEnv(env)}>{env === 'all' ? 'All Envs' : env}</button>
          ))}
        </div>
      </div>

      {/* Top-level metrics */}
      <div className="stats-grid">
        <StatCard label="Overall Pass Rate" value={`${d.healthMetrics.overallPassRate}%`}
          trend="2.1% vs last week" trendUp={true} icon="health" color="var(--qaap-success)"></StatCard>
        <StatCard label="Total Executions" value={d.healthMetrics.totalExecutions}
          sub="Last 30 days" icon="executions" color="var(--qaap-primary)"></StatCard>
        <StatCard label="Flaky Tests" value={d.healthMetrics.flakyTests}
          sub="Need attention" icon="refresh" color="var(--qaap-warning)"></StatCard>
        <StatCard label="Coverage Score" value={`${d.healthMetrics.coverageScore}%`}
          sub="18% uncovered" icon="testPlans" color="#8B5CF6"></StatCard>
      </div>

      <div className="health-grid">
        {/* Plan Health Cards */}
        <div className="card" style={{ gridColumn:'1 / -1' }}>
          <div className="card-header">
            <h3 className="card-title">Plan Health Status</h3>
          </div>
          <div className="health-cards">
            {d.healthPlans.map((plan, i) => {
              const trendColor = plan.health === 'healthy' ? 'var(--qaap-success)' : plan.health === 'degrading' ? 'var(--qaap-warning)' : 'var(--qaap-error)';
              return (
                <div key={i} className="health-plan-card" onClick={() => onNavigate('plan-detail')}>
                  <div className="health-plan-top">
                    <div>
                      <div className="health-plan-name">{plan.name}</div>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
                        <HealthBadge health={plan.health}></HealthBadge>
                        <span style={{ fontSize:11, color:'var(--qaap-text-tertiary)' }}>{plan.scenarios} scenarios · Last run {plan.lastRun}</span>
                      </div>
                    </div>
                    <div className="health-plan-rate" style={{ color: trendColor }}>
                      {plan.passRate}%
                    </div>
                  </div>
                  <div className="health-plan-chart">
                    <Sparkline data={plan.trend} width={280} height={40} color={trendColor} showArea></Sparkline>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pass Rate Over Time Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Pass Rate Trend</h3>
            <span style={{ fontSize:11, color:'var(--qaap-text-tertiary)' }}>Last 8 days</span>
          </div>
          <div className="trend-chart">
            <PassRateChart data={chartData}></PassRateChart>
          </div>
        </div>

        {/* Flaky Tests */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Flaky Tests</h3>
            <span className="badge-count">{d.flakyTests.length}</span>
          </div>
          <div className="flaky-list">
            {d.flakyTests.map((test, i) => (
              <div key={i} className="flaky-item">
                <div className="flaky-info">
                  <div className="flaky-name">{test.name}</div>
                  <div className="flaky-plan">{test.plan}</div>
                </div>
                <div className="flaky-stats">
                  <div className="flaky-rate">
                    <div className="flaky-bar">
                      <div className="flaky-bar-fill" style={{ width:`${test.flakeRate}%` }}></div>
                    </div>
                    <span className="flaky-pct">{test.flakeRate}%</span>
                  </div>
                  <span className="flaky-date">Last: {test.lastFlake}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Environment Comparison */}
        <div className="card" style={{ gridColumn:'1 / -1' }}>
          <div className="card-header">
            <h3 className="card-title">Environment Comparison</h3>
            <span style={{ fontSize:11, color:'var(--qaap-text-tertiary)' }}>Same tests across environments</span>
          </div>
          <div className="env-comparison">
            <div className="env-table-header">
              <span className="env-col-label">Plan</span>
              {envComparison.map(e => <span key={e.env} className="env-col-val">{e.env}</span>)}
            </div>
            {envComparison[0].plans.map((plan, pi) => (
              <div key={pi} className="env-table-row">
                <span className="env-col-label">{plan.name}</span>
                {envComparison.map(e => {
                  const rate = e.plans[pi].rate;
                  const color = rate >= 95 ? 'var(--qaap-success)' : rate >= 85 ? 'var(--qaap-warning)' : 'var(--qaap-error)';
                  return (
                    <span key={e.env} className="env-col-val">
                      <span className="env-rate-pill" style={{ background: color + '18', color }}>{rate}%</span>
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="card" style={{ gridColumn:'1 / -1' }}>
          <div className="card-header">
            <h3 className="card-title">Alerts</h3>
            <span className="badge-count" style={{ background:'var(--qaap-error-light)', color:'var(--qaap-error)' }}>
              {d.alerts.filter(a => a.severity === 'critical').length} critical
            </span>
          </div>
          <div className="alerts-list">
            {d.alerts.map((alert, i) => (
              <div key={i} className={`alert-item alert-${alert.severity}`}>
                <div className={`alert-severity alert-severity-${alert.severity}`}>
                  {alert.severity === 'critical' ? '!!' : alert.severity === 'warning' ? '!' : 'i'}
                </div>
                <div className="alert-content">
                  <div className="alert-message">{alert.message}</div>
                  <div className="alert-meta">{alert.plan} · {alert.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Pass Rate Chart (SVG) ───
function PassRateChart({ data }) {
  const w = 340, h = 140, px = 30, py = 10;
  const iw = w - px * 2, ih = h - py * 2 - 20;
  const min = Math.min(...data.map(d => d.rate)) - 5;
  const max = Math.max(...data.map(d => d.rate)) + 2;
  const range = max - min || 1;

  const pts = data.map((d, i) => ({
    x: px + (i / (data.length - 1)) * iw,
    y: py + ih - ((d.rate - min) / range) * ih
  }));
  const line = pts.map(p => `${p.x},${p.y}`).join(' ');
  const area = `${px},${py + ih} ${line} ${px + iw},${py + ih}`;

  // Grid lines
  const gridLines = [min, min + range * 0.33, min + range * 0.66, max].map(v => Math.round(v));

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display:'block' }}>
      {gridLines.map((v, i) => {
        const y = py + ih - ((v - min) / range) * ih;
        return (
          <g key={i}>
            <line x1={px} y1={y} x2={px + iw} y2={y} stroke="var(--qaap-border-light)" strokeWidth="1"></line>
            <text x={px - 4} y={y + 3} textAnchor="end" fontSize="9" fill="var(--qaap-text-tertiary)">{v}%</text>
          </g>
        );
      })}
      <polygon points={area} fill="var(--qaap-primary)" opacity="0.06"></polygon>
      <polyline points={line} fill="none" stroke="var(--qaap-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></polyline>
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3" fill="white" stroke="var(--qaap-primary)" strokeWidth="2"></circle>
          <text x={p.x} y={py + ih + 16} textAnchor="middle" fontSize="9" fill="var(--qaap-text-tertiary)">{data[i].day.replace('May ','').replace('Jun ','')}</text>
        </g>
      ))}
    </svg>
  );
}

window.HealthScreen = HealthScreen;
window.PassRateChart = PassRateChart;
