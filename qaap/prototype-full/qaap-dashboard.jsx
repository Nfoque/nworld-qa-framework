// QAAP Dashboard Screen
function DashboardScreen({ onNavigate, onOpenPlan, onNewPlan }) {
  const [fadeIn, setFadeIn] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setFadeIn(true), 50); return () => clearTimeout(t); }, []);
  const d = QAAP_DATA;
  const approved = d.testPlans.filter(p => p.status === 'approved').length;
  const totalScenarios = d.testPlans.reduce((s, p) => s + p.scenarioCount, 0);

  return (
    <div className={`screen-content ${fadeIn ? 'screen-visible' : ''}`}>
      <div className="screen-header">
        <div>
          <h1 className="screen-title">Welcome back, {d.user.name.split(' ')[0]}</h1>
          <p className="screen-subtitle">Here's what's happening with your test plans today.</p>
        </div>
        <button className="btn-primary" onClick={onNewPlan || (() => onNavigate('plans'))}>
          <QIcon name="plus" size={16}></QIcon> New Test Plan
        </button>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard label="Test Plans" value={d.testPlans.length} sub={`${approved} approved`}
          icon="testPlans" color="var(--qaap-primary)"></StatCard>
        <StatCard label="Total Scenarios" value={totalScenarios} sub="Across all plans"
          icon="text" color="#8B5CF6"></StatCard>
        <StatCard label="Avg Pass Rate" value={`${d.healthMetrics.overallPassRate}%`}
          trend="2.1% vs last week" trendUp={true} icon="health" color="var(--qaap-success)"></StatCard>
        <StatCard label="Pending Reviews" value="4" sub="2 plans need attention"
          icon="clock" color="var(--qaap-warning)"></StatCard>
      </div>

      <div className="dashboard-grid">
        {/* Test Plans Overview */}
        <div className="card" style={{ gridColumn:'1 / -1' }}>
          <div className="card-header">
            <h3 className="card-title">Test Plans</h3>
            <button className="btn-ghost" onClick={() => onNavigate('plans')}>View all <QIcon name="chevronRight" size={14}></QIcon></button>
          </div>
          <div className="plans-table">
            <div className="plans-table-header">
              <span className="col-name">Name</span>
              <span className="col-sm">Type</span>
              <span className="col-sm">Status</span>
              <span className="col-sm">Scenarios</span>
              <span className="col-sm">Pass Rate</span>
              <span className="col-md">Health</span>
              <span className="col-sm">Updated</span>
            </div>
            {d.testPlans.map(plan => (
              <div key={plan.id} className="plans-table-row" onClick={() => onOpenPlan(plan)}>
                <span className="col-name">
                  <span className="plan-name">{plan.name}</span>
                  <span style={{ fontSize:11, color:'var(--qaap-text-tertiary)' }}>{plan.framework}</span>
                </span>
                <span className="col-sm"><ModalityBadge modality={plan.modality}></ModalityBadge></span>
                <span className="col-sm"><StatusBadge status={plan.status} small></StatusBadge></span>
                <span className="col-sm col-num">{plan.scenarioCount}</span>
                <span className="col-sm col-num">{plan.passRate != null ? `${plan.passRate}%` : '—'}</span>
                <span className="col-md">
                  {plan.health ? (
                    <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <Sparkline data={plan.trend} width={60} height={20}
                        color={plan.health === 'healthy' ? 'var(--qaap-success)' : plan.health === 'degrading' ? 'var(--qaap-warning)' : 'var(--qaap-error)'}></Sparkline>
                      <HealthBadge health={plan.health}></HealthBadge>
                    </span>
                  ) : <span style={{ color:'var(--qaap-text-tertiary)', fontSize:12 }}>—</span>}
                </span>
                <span className="col-sm" style={{ color:'var(--qaap-text-tertiary)', fontSize:12 }}>{plan.lastUpdated}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
          </div>
          <div className="activity-feed">
            {d.recentActivity.map((item, i) => (
              <div key={i} className="activity-item">
                <div className={`activity-dot activity-${item.status}`}></div>
                <div className="activity-content">
                  <span className="activity-text">{item.text}</span>
                  <span className="activity-time">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div className="quick-actions">
            <button className="quick-action" onClick={() => onNavigate('plans')}>
              <div className="quick-action-icon" style={{ background:'var(--qaap-primary-light)', color:'var(--qaap-primary)' }}>
                <QIcon name="plus" size={20}></QIcon>
              </div>
              <div>
                <div className="quick-action-title">New Test Plan</div>
                <div className="quick-action-desc">Create web, API, or iOS plan</div>
              </div>
            </button>
            <button className="quick-action" onClick={() => onNavigate('executions')}>
              <div className="quick-action-icon" style={{ background:'var(--qaap-success-light)', color:'var(--qaap-success)' }}>
                <QIcon name="run" size={20}></QIcon>
              </div>
              <div>
                <div className="quick-action-title">Run Tests</div>
                <div className="quick-action-desc">Execute an approved plan</div>
              </div>
            </button>
            <button className="quick-action" onClick={() => onNavigate('proposals')}>
              <div className="quick-action-icon" style={{ background:'var(--qaap-warning-light)', color:'var(--qaap-warning)' }}>
                <QIcon name="proposals" size={20}></QIcon>
              </div>
              <div>
                <div className="quick-action-title">AI Proposals</div>
                <div className="quick-action-desc">3 suggestions waiting</div>
              </div>
            </button>
            <button className="quick-action" onClick={() => onNavigate('reports')}>
              <div className="quick-action-icon" style={{ background:'#8B5CF612', color:'#8B5CF6' }}>
                <QIcon name="reports" size={20}></QIcon>
              </div>
              <div>
                <div className="quick-action-title">Generate Report</div>
                <div className="quick-action-desc">Export results & metrics</div>
              </div>
            </button>
          </div>
        </div>

        {/* Execution Trend Mini */}
        <div className="card" style={{ gridColumn:'1 / -1' }}>
          <div className="card-header">
            <h3 className="card-title">Recent Executions</h3>
            <button className="btn-ghost" onClick={() => onNavigate('executions')}>View all <QIcon name="chevronRight" size={14}></QIcon></button>
          </div>
          <div className="executions-mini">
            {d.executions.map(ex => (
              <div key={ex.id} className="execution-row">
                <div className="exec-status">
                  <StatusBadge status={ex.status} small></StatusBadge>
                </div>
                <span className="exec-env">{ex.env}</span>
                <span className="exec-date">{ex.date}</span>
                <div className="exec-bar">
                  <div className="exec-bar-fill exec-bar-pass" style={{ width:`${ex.passRate}%` }}></div>
                  {ex.passRate < 100 && <div className="exec-bar-fill exec-bar-fail" style={{ width:`${100 - ex.passRate}%` }}></div>}
                </div>
                <span className="exec-rate">{ex.passRate}%</span>
                <span className="exec-duration">{ex.duration}</span>
                <span className="exec-trigger">{ex.trigger}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.DashboardScreen = DashboardScreen;
