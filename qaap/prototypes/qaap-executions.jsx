// QAAP Execution View Screen
function ExecutionScreen({ onNavigate }) {
  const [fadeIn, setFadeIn] = React.useState(false);
  const [selectedExec, setSelectedExec] = React.useState(null);
  const [filter, setFilter] = React.useState('all');
  React.useEffect(() => { setTimeout(() => setFadeIn(true), 50); }, []);
  const d = QAAP_DATA;
  const execs = d.executionDetails;

  const filtered = filter === 'all' ? execs : execs.filter(e => e.status === filter);

  if (selectedExec) {
    return <ExecutionDetail exec={selectedExec} onBack={() => setSelectedExec(null)}></ExecutionDetail>;
  }

  return (
    <div className={`screen-content ${fadeIn ? 'screen-visible' : ''}`}>
      <div className="screen-header">
        <div>
          <h1 className="screen-title">Executions</h1>
          <p className="screen-subtitle">Track test runs, analyze failures, and monitor quality across environments.</p>
        </div>
        <button className="btn-primary"><QIcon name="run" size={16}></QIcon> Run Tests</button>
      </div>

      {/* Summary stats */}
      <div className="stats-grid">
        <StatCard label="Total Runs" value={execs.length} sub="Last 7 days" icon="executions" color="var(--qaap-primary)"></StatCard>
        <StatCard label="Pass Rate" value="92%" trend="3.2% vs last week" trendUp={true} icon="check" color="var(--qaap-success)"></StatCard>
        <StatCard label="Failed Runs" value={execs.filter(e => e.status === 'failed').length} sub="Need attention" icon="x" color="var(--qaap-error)"></StatCard>
        <StatCard label="Avg Duration" value="3m 57s" sub="Across all runs" icon="clock" color="var(--qaap-warning)"></StatCard>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, marginBottom:12 }}>
        {['all','passed','failed'].map(f => (
          <button key={f} className={`btn-tab ${filter === f ? 'btn-tab-active' : ''}`}
            onClick={() => setFilter(f)}>
            {f === 'all' ? 'All Runs' : f === 'passed' ? '✓ Passed' : '✗ Failed'}
            <span style={{ marginLeft:4, opacity:0.6 }}>
              ({f === 'all' ? execs.length : execs.filter(e => e.status === f).length})
            </span>
          </button>
        ))}
      </div>

      {/* Execution Timeline */}
      <div className="card">
        <div className="exec-timeline">
          {filtered.map(ex => (
            <div key={ex.id} className="exec-timeline-item" onClick={() => setSelectedExec(ex)}>
              <div className="exec-tl-left">
                <div className={`exec-tl-indicator exec-tl-${ex.status}`}></div>
                <div className="exec-tl-info">
                  <div className="exec-tl-title">
                    <StatusBadge status={ex.status} small></StatusBadge>
                    <span className="exec-tl-env">{ex.env}</span>
                    <span className="exec-tl-branch">{ex.branch}</span>
                  </div>
                  <div className="exec-tl-meta">
                    {ex.date} · {ex.triggeredBy} · {ex.trigger}
                  </div>
                </div>
              </div>
              <div className="exec-tl-right">
                <div className="exec-tl-bar-wrap">
                  <div className="exec-tl-bar">
                    <div className="exec-bar-fill exec-bar-pass" style={{ width:`${ex.passRate}%` }}></div>
                    {ex.passRate < 100 && <div className="exec-bar-fill exec-bar-fail" style={{ width:`${100 - ex.passRate}%` }}></div>}
                  </div>
                  <span className="exec-tl-rate">{ex.passRate}%</span>
                </div>
                <div className="exec-tl-stats">
                  <span style={{ color:'var(--qaap-success)' }}>{ex.passed}✓</span>
                  <span style={{ color:'var(--qaap-error)' }}>{ex.failed}✗</span>
                  <span style={{ color:'var(--qaap-text-tertiary)' }}>{ex.duration}</span>
                </div>
              </div>
              <QIcon name="chevronRight" size={16} color="var(--qaap-text-tertiary)"></QIcon>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Execution Detail View ───
function ExecutionDetail({ exec, onBack }) {
  const [expandedResult, setExpandedResult] = React.useState(null);

  const failedResults = exec.results.filter(r => r.status === 'failed');
  const passedResults = exec.results.filter(r => r.status === 'passed');

  return (
    <div className="screen-content" style={{ opacity:1, transform:'none' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
        <button className="btn-ghost" onClick={onBack} style={{ fontSize:13 }}>
          ← Back to Executions
        </button>
      </div>

      <div className="screen-header">
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <StatusBadge status={exec.status}></StatusBadge>
          <h1 className="screen-title" style={{ fontSize:18 }}>Execution {exec.id}</h1>
          <span className="exec-env-badge" style={{ fontSize:12 }}>{exec.env}</span>
          <span style={{ fontSize:12, color:'var(--qaap-text-tertiary)' }}>{exec.branch}</span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn-outline"><QIcon name="refresh" size={16}></QIcon> Rerun</button>
          <button className="btn-outline"><QIcon name="download" size={16}></QIcon> Export Report</button>
          <button className="btn-primary"><QIcon name="jira" size={16}></QIcon> Create Bug</button>
        </div>
      </div>

      {/* Execution Summary */}
      <div className="stats-grid" style={{ gridTemplateColumns:'repeat(5, 1fr)' }}>
        <StatCard label="Pass Rate" value={`${exec.passRate}%`} icon="check" color={exec.status === 'passed' ? 'var(--qaap-success)' : 'var(--qaap-error)'}></StatCard>
        <StatCard label="Passed" value={exec.passed} icon="check" color="var(--qaap-success)"></StatCard>
        <StatCard label="Failed" value={exec.failed} icon="x" color="var(--qaap-error)"></StatCard>
        <StatCard label="Duration" value={exec.duration} icon="clock" color="var(--qaap-text-secondary)"></StatCard>
        <StatCard label="Trigger" value={exec.trigger} sub={exec.triggeredBy} icon="run" color="var(--qaap-primary)"></StatCard>
      </div>

      {/* Failed Tests (expanded) */}
      {failedResults.length > 0 && (
        <div className="card" style={{ marginBottom:12 }}>
          <div className="card-header">
            <h3 className="card-title" style={{ color:'var(--qaap-error)' }}>Failed Tests ({failedResults.length})</h3>
          </div>
          <div className="exec-results-list">
            {failedResults.map((r, i) => (
              <div key={i} className="exec-result-item exec-result-failed">
                <div className="exec-result-header" onClick={() => setExpandedResult(expandedResult === `f-${i}` ? null : `f-${i}`)}>
                  <div className="exec-result-left">
                    <span className="exec-result-status-dot" style={{ background:'var(--qaap-error)' }}></span>
                    <span className="exec-result-name">{r.scenario}</span>
                    {r.classification && <span className="exec-classification">{r.classification}</span>}
                  </div>
                  <div className="exec-result-right">
                    <span className="exec-result-duration">{r.duration}</span>
                    <QIcon name={expandedResult === `f-${i}` ? 'chevronDown' : 'chevronRight'} size={14}></QIcon>
                  </div>
                </div>
                {expandedResult === `f-${i}` && (
                  <div className="exec-result-detail">
                    <div className="exec-error-block">
                      <div className="exec-error-label">Error</div>
                      <code className="exec-error-msg">{r.error}</code>
                    </div>
                    {r.rootCause && (
                      <div className="exec-rootcause-block">
                        <div className="exec-rootcause-label">
                          <NfqMark size={14}></NfqMark>
                          AI Root Cause Analysis
                        </div>
                        <p className="exec-rootcause-text">{r.rootCause}</p>
                      </div>
                    )}
                    <div className="exec-result-actions">
                      <button className="btn-primary btn-sm"><QIcon name="jira" size={14}></QIcon> Create Bug in Jira</button>
                      <button className="btn-outline btn-sm"><QIcon name="refresh" size={14}></QIcon> Rerun This Test</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Passed Tests */}
      {passedResults.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ color:'var(--qaap-success)' }}>Passed Tests ({passedResults.length})</h3>
          </div>
          <div className="exec-results-list">
            {passedResults.map((r, i) => (
              <div key={i} className="exec-result-item">
                <div className="exec-result-header">
                  <div className="exec-result-left">
                    <span className="exec-result-status-dot" style={{ background:'var(--qaap-success)' }}></span>
                    <span className="exec-result-name">{r.scenario}</span>
                  </div>
                  <span className="exec-result-duration">{r.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

window.ExecutionScreen = ExecutionScreen;
window.ExecutionDetail = ExecutionDetail;
