// QAAP Schedules Screen
function SchedulesScreen({ onNavigate }) {
  const [fadeIn, setFadeIn] = React.useState(false);
  React.useEffect(() => { setTimeout(() => setFadeIn(true), 50); }, []);
  const d = QAAP_DATA;
  const schedules = d.schedules;
  const activeCount = schedules.filter(s => s.enabled).length;

  return (
    <div className={`screen-content ${fadeIn ? 'screen-visible' : ''}`}>
      <div className="screen-header">
        <div>
          <h1 className="screen-title">Scheduled Runs</h1>
          <p className="screen-subtitle">Automate test execution with cron schedules, branch triggers, and webhook events.</p>
        </div>
        <button className="btn-primary"><QIcon name="plus" size={16}></QIcon> New Schedule</button>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Schedules" value={schedules.length} sub={`${activeCount} active`} icon="schedules" color="var(--qaap-primary)"></StatCard>
        <StatCard label="Last 7 Days" value={schedules.reduce((s, sch) => s + sch.last7.passed + sch.last7.failed, 0)} sub="Total runs" icon="run" color="var(--qaap-success)"></StatCard>
        <StatCard label="Success Rate" value={`${Math.round(schedules.reduce((s, sch) => s + sch.last7.passed, 0) / schedules.reduce((s, sch) => s + sch.last7.passed + sch.last7.failed, 0) * 100)}%`} sub="Last 7 days" icon="check" color="var(--qaap-success)"></StatCard>
        <StatCard label="Next Run" value="22:00" sub="Today — Nightly Regression" icon="clock" color="var(--qaap-warning)"></StatCard>
      </div>

      <div className="schedules-list">
        {schedules.map(sch => {
          const statusColor = sch.lastStatus === 'passed' ? 'var(--qaap-success)' : 'var(--qaap-error)';
          return (
            <div key={sch.id} className={`schedule-card ${!sch.enabled ? 'schedule-disabled' : ''}`}>
              <div className="schedule-card-top">
                <div className="schedule-card-info">
                  <div className="schedule-card-name-row">
                    <h3 className="schedule-card-name">{sch.name}</h3>
                    <span className={`delivery-enabled ${sch.enabled ? 'on' : 'off'}`}>
                      {sch.enabled ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <div className="schedule-card-meta">
                    <span className="schedule-plan-chip">{sch.plan}</span>
                    <span className="schedule-meta-sep">·</span>
                    <span className="exec-tl-env">{sch.env}</span>
                    <span className="schedule-meta-sep">·</span>
                    <span className="schedule-branch">
                      <QIcon name="git" size={12} color="var(--qaap-text-tertiary)"></QIcon>
                      {sch.branch}
                    </span>
                  </div>
                </div>
                <div className="delivery-toggle-wrap">
                  <div className={`delivery-toggle ${sch.enabled ? 'active' : ''}`}>
                    <div className="delivery-toggle-knob"></div>
                  </div>
                </div>
              </div>

              <div className="schedule-card-body">
                <div className="schedule-detail-grid">
                  <div className="schedule-detail-item">
                    <span className="schedule-detail-label">Trigger</span>
                    <span className="schedule-detail-value">
                      <QIcon name="clock" size={14} color="var(--qaap-text-tertiary)"></QIcon>
                      {sch.cronHuman}
                    </span>
                    {sch.cron && <code className="schedule-cron">{sch.cron}</code>}
                  </div>
                  <div className="schedule-detail-item">
                    <span className="schedule-detail-label">Last Run</span>
                    <span className="schedule-detail-value">
                      <span style={{ width:6, height:6, borderRadius:'50%', background:statusColor, display:'inline-block' }}></span>
                      {sch.lastRun}
                    </span>
                  </div>
                  <div className="schedule-detail-item">
                    <span className="schedule-detail-label">Next Run</span>
                    <span className="schedule-detail-value">{sch.nextRun}</span>
                  </div>
                  <div className="schedule-detail-item">
                    <span className="schedule-detail-label">Last 7 Days</span>
                    <span className="schedule-detail-value">
                      <span className="schedule-7d-bar">
                        {Array.from({ length: sch.last7.passed + sch.last7.failed }).map((_, i) => (
                          <span key={i} className="schedule-7d-dot" style={{ background: i < sch.last7.passed ? 'var(--qaap-success)' : 'var(--qaap-error)' }}></span>
                        ))}
                      </span>
                      <span style={{ fontSize:11, color:'var(--qaap-text-tertiary)' }}>
                        {sch.last7.passed}/{sch.last7.passed + sch.last7.failed} passed
                      </span>
                    </span>
                  </div>
                </div>

                <div className="schedule-options">
                  {sch.autoReport && <span className="schedule-option-chip"><QIcon name="reports" size={12}></QIcon> Auto-report</span>}
                  <span className="schedule-option-chip"><QIcon name="bell" size={12}></QIcon> Notify on {sch.notifyOn}</span>
                  {sch.duration && <span className="schedule-option-chip"><QIcon name="clock" size={12}></QIcon> ~{sch.duration}</span>}
                  {sch.prLabels && sch.prLabels.map((label, i) => (
                    <span key={i} className="schedule-option-chip" style={{ background:'var(--qaap-primary-light)', color:'var(--qaap-primary)' }}>
                      <QIcon name="filter" size={10}></QIcon> {label}
                    </span>
                  ))}
                  {sch.tags && sch.tags.map((tag, i) => (
                    <span key={i} className="schedule-option-chip" style={{ background:'var(--qaap-success-light)', color:'var(--qaap-success)' }}>{tag}</span>
                  ))}
                </div>
              </div>

              <div className="schedule-card-actions">
                <button className="btn-ghost">Edit</button>
                <button className="btn-ghost">Run Now</button>
                <button className="btn-ghost">View History</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.SchedulesScreen = SchedulesScreen;
