// QAAP Reports & Delivery Screen — with Report Viewer
function ReportsScreen({ onNavigate }) {
  const [fadeIn, setFadeIn] = React.useState(false);
  const [activeView, setActiveView] = React.useState('reports');
  const [viewingReport, setViewingReport] = React.useState(null);
  React.useEffect(() => { setTimeout(() => setFadeIn(true), 50); }, []);
  const d = QAAP_DATA;

  const formatConfig = {
    HTML: { color:'var(--qaap-primary)', bg:'var(--qaap-primary-light)' },
    PDF: { color:'var(--qaap-error)', bg:'var(--qaap-error-light)' },
    XRay: { color:'#8B5CF6', bg:'#8B5CF612' },
  };
  const reportStatusConfig = {
    ready: { label:'Ready', color:'var(--qaap-success)', bg:'var(--qaap-success-light)' },
    delivered: { label:'Delivered', color:'var(--qaap-primary)', bg:'var(--qaap-primary-light)' },
    scheduled: { label:'Scheduled', color:'var(--qaap-text-tertiary)', bg:'var(--qaap-bg-hover)' },
  };

  // ─── Report Viewer ───
  if (viewingReport) {
    return <ReportViewer report={viewingReport} onBack={() => setViewingReport(null)}></ReportViewer>;
  }

  return (
    <div className={`screen-content ${fadeIn ? 'screen-visible' : ''}`}>
      <div className="screen-header">
        <div>
          <h1 className="screen-title">Reports & Delivery</h1>
          <p className="screen-subtitle">Generate, schedule, and deliver test reports across channels.</p>
        </div>
        <button className="btn-primary"><QIcon name="reports" size={16}></QIcon> Generate Report</button>
      </div>

      <div style={{ display:'flex', gap:2, background:'var(--qaap-bg-card)', border:'1px solid var(--qaap-border)', borderRadius:'var(--qaap-radius-sm)', padding:2, marginBottom:16, width:'fit-content' }}>
        <button className={`btn-tab ${activeView === 'reports' ? 'btn-tab-active' : ''}`} onClick={() => setActiveView('reports')}>Reports</button>
        <button className={`btn-tab ${activeView === 'delivery' ? 'btn-tab-active' : ''}`} onClick={() => setActiveView('delivery')}>Delivery Rules</button>
      </div>

      {activeView === 'reports' && (
        <React.Fragment>
          <div className="stats-grid">
            <StatCard label="Total Reports" value={d.reports.length} sub="Last 30 days" icon="reports" color="var(--qaap-primary)"></StatCard>
            <StatCard label="Delivered" value={d.reports.filter(r => r.status === 'delivered').length} icon="check" color="var(--qaap-success)"></StatCard>
            <StatCard label="Scheduled" value={d.reports.filter(r => r.status === 'scheduled').length} icon="clock" color="var(--qaap-text-secondary)"></StatCard>
            <StatCard label="Active Rules" value={d.deliveryConfigs.filter(c => c.enabled).length} sub="Delivery automations" icon="send" color="var(--qaap-warning)"></StatCard>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Reports</h3>
            </div>
            <div className="reports-table">
              <div className="reports-table-header">
                <span className="rep-col-name">Report</span>
                <span className="rep-col-sm">Plan</span>
                <span className="rep-col-sm">Format</span>
                <span className="rep-col-sm">Status</span>
                <span className="rep-col-sm">Date</span>
                <span className="rep-col-sm">Size</span>
                <span className="rep-col-actions">Actions</span>
              </div>
              {d.reports.map(report => {
                const fc = formatConfig[report.format] || formatConfig.HTML;
                const rs = reportStatusConfig[report.status] || reportStatusConfig.ready;
                return (
                  <div key={report.id} className="reports-table-row" onClick={() => report.status !== 'scheduled' && setViewingReport(report)} style={{ cursor: report.status !== 'scheduled' ? 'pointer' : 'default' }}>
                    <span className="rep-col-name">
                      <QIcon name="doc" size={16} color="var(--qaap-text-tertiary)"></QIcon>
                      <span className="rep-name">{report.name}</span>
                    </span>
                    <span className="rep-col-sm rep-plan">{report.plan || 'All Plans'}</span>
                    <span className="rep-col-sm">
                      <span className="rep-format" style={{ color:fc.color, background:fc.bg }}>{report.format}</span>
                    </span>
                    <span className="rep-col-sm">
                      <span className="rep-status" style={{ color:rs.color, background:rs.bg }}>{rs.label}</span>
                    </span>
                    <span className="rep-col-sm rep-date">{report.date}</span>
                    <span className="rep-col-sm rep-size">{report.size || '—'}</span>
                    <span className="rep-col-actions" onClick={e => e.stopPropagation()}>
                      {report.status === 'ready' && (
                        <React.Fragment>
                          <button className="btn-ghost" title="Download"><QIcon name="download" size={16}></QIcon></button>
                          <button className="btn-ghost" title="View" onClick={() => setViewingReport(report)}><QIcon name="externalLink" size={16}></QIcon></button>
                          <button className="btn-ghost" title="Send"><QIcon name="send" size={16}></QIcon></button>
                        </React.Fragment>
                      )}
                      {report.status === 'delivered' && (
                        <button className="btn-ghost" title="View" onClick={() => setViewingReport(report)}><QIcon name="externalLink" size={16}></QIcon></button>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </React.Fragment>
      )}

      {activeView === 'delivery' && (
        <React.Fragment>
          <div className="delivery-list">
            {d.deliveryConfigs.map(config => (
              <div key={config.id} className="delivery-card">
                <div className="delivery-card-top">
                  <div className="delivery-card-info">
                    <div className="delivery-card-name">
                      <span style={{ fontWeight:600, fontSize:14 }}>{config.name}</span>
                      <span className={`delivery-enabled ${config.enabled ? 'on' : 'off'}`}>
                        {config.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="delivery-trigger">
                      <QIcon name="clock" size={14} color="var(--qaap-text-tertiary)"></QIcon>
                      {config.trigger}
                    </div>
                  </div>
                  <div className="delivery-toggle-wrap">
                    <div className={`delivery-toggle ${config.enabled ? 'active' : ''}`}>
                      <div className="delivery-toggle-knob"></div>
                    </div>
                  </div>
                </div>
                <div className="delivery-card-details">
                  <div className="delivery-detail-row">
                    <span className="delivery-label">Plans</span>
                    <div className="delivery-chips">
                      {config.plans.map((p, i) => <span key={i} className="delivery-chip">{p}</span>)}
                    </div>
                  </div>
                  <div className="delivery-detail-row">
                    <span className="delivery-label">Format</span>
                    <span className="rep-format" style={{ color:(formatConfig[config.format]||{}).color, background:(formatConfig[config.format]||{}).bg }}>{config.format}</span>
                  </div>
                  <div className="delivery-detail-row">
                    <span className="delivery-label">Recipients</span>
                    <div className="delivery-chips">
                      {config.recipients.map((r, i) => <span key={i} className="delivery-chip delivery-chip-recipient">{r}</span>)}
                    </div>
                  </div>
                </div>
                <div className="delivery-card-actions">
                  <button className="btn-ghost">Edit</button>
                  <button className="btn-ghost">Test Delivery</button>
                  <button className="btn-ghost" style={{ color:'var(--qaap-error)' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-outline" style={{ marginTop:12 }}>
            <QIcon name="plus" size={16}></QIcon> New Delivery Rule
          </button>
        </React.Fragment>
      )}
    </div>
  );
}

// ═══ Report Viewer — full rendered report ═══
function ReportViewer({ report, onBack }) {
  const d = QAAP_DATA;
  // Build a realistic report from execution data
  const exec = d.executionDetails[0]; // Use first execution for report data
  const scenarios = d.scenarios;
  const plan = d.testPlans[0];

  return (
    <div className="screen-content" style={{ opacity:1, transform:'none' }}>
      {/* Back button + actions */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <button className="btn-ghost" onClick={onBack} style={{ fontSize:13 }}>← Back to Reports</button>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn-outline"><QIcon name="download" size={16}></QIcon> Download {report.format}</button>
          <button className="btn-outline"><QIcon name="send" size={16}></QIcon> Send</button>
        </div>
      </div>

      {/* Report Document */}
      <div className="report-document">
        {/* Report Header */}
        <div className="report-doc-header">
          <div className="report-doc-brand">
            <NfqMark size={32}></NfqMark>
            <div>
              <div style={{ fontFamily:'var(--qaap-font-heading)', fontWeight:700, fontSize:16 }}>QAAP</div>
              <div style={{ fontSize:10, color:'var(--qaap-text-tertiary)' }}>QA Automation Platform</div>
            </div>
            <div style={{ marginLeft:'auto', textAlign:'right' }}>
              <div style={{ fontSize:10, color:'var(--qaap-text-tertiary)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 }}>Test Report</div>
              <div style={{ fontSize:11, color:'var(--qaap-text-tertiary)' }}>{report.date}</div>
            </div>
          </div>
          <h1 className="report-doc-title">{report.name}</h1>
          <div className="report-doc-meta">
            <span>Plan: <strong>{report.plan || 'All Plans'}</strong></span>
            <span>Environment: <strong>{exec.env}</strong></span>
            <span>Branch: <strong>{exec.branch}</strong></span>
            <span>Duration: <strong>{exec.duration}</strong></span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="report-section">
          <h2 className="report-section-title">Executive Summary</h2>
          <div className="report-summary-grid">
            <div className="report-summary-card report-summary-primary">
              <div className="report-summary-value">{exec.passRate}%</div>
              <div className="report-summary-label">Pass Rate</div>
            </div>
            <div className="report-summary-card">
              <div className="report-summary-value" style={{ color:'var(--qaap-success)' }}>{exec.passed}</div>
              <div className="report-summary-label">Passed</div>
            </div>
            <div className="report-summary-card">
              <div className="report-summary-value" style={{ color:'var(--qaap-error)' }}>{exec.failed}</div>
              <div className="report-summary-label">Failed</div>
            </div>
            <div className="report-summary-card">
              <div className="report-summary-value">{exec.passed + exec.failed}</div>
              <div className="report-summary-label">Total Tests</div>
            </div>
          </div>
          <div className="report-pass-bar">
            <div className="report-pass-fill" style={{ width:`${exec.passRate}%` }}></div>
          </div>
        </div>

        {/* Scenario Results */}
        <div className="report-section">
          <h2 className="report-section-title">Scenario Results</h2>
          <table className="report-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Scenario</th>
                <th>Feature</th>
                <th>Confidence</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {exec.results.map((r, i) => (
                <tr key={i} className={r.status === 'failed' ? 'report-row-failed' : ''}>
                  <td>
                    <span className={`report-result-badge report-result-${r.status}`}>
                      {r.status === 'passed' ? '✓ Pass' : '✗ Fail'}
                    </span>
                  </td>
                  <td className="report-scenario-name">{r.scenario}</td>
                  <td className="report-feature">{scenarios.find(s => s.name === r.scenario)?.feature || '—'}</td>
                  <td>
                    <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <ConfidenceDot value={scenarios.find(s => s.name === r.scenario)?.confidence || 80}></ConfidenceDot>
                      {scenarios.find(s => s.name === r.scenario)?.confidence || '—'}%
                    </span>
                  </td>
                  <td className="report-duration">{r.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Failure Details */}
        {exec.results.filter(r => r.status === 'failed').length > 0 && (
          <div className="report-section">
            <h2 className="report-section-title" style={{ color:'var(--qaap-error)' }}>Failure Analysis</h2>
            {exec.results.filter(r => r.status === 'failed').map((r, i) => (
              <div key={i} className="report-failure-card">
                <div className="report-failure-header">
                  <span className="report-result-badge report-result-failed">✗ Failed</span>
                  <strong>{r.scenario}</strong>
                  {r.classification && <span className="exec-classification">{r.classification}</span>}
                </div>
                <div className="report-failure-error">
                  <div className="report-failure-label">Error Message</div>
                  <code>{r.error}</code>
                </div>
                {r.rootCause && (
                  <div className="report-failure-analysis">
                    <div className="report-failure-label">
                      <NfqMark size={12}></NfqMark> AI Root Cause Analysis
                    </div>
                    <p>{r.rootCause}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Confidence Distribution */}
        <div className="report-section">
          <h2 className="report-section-title">Confidence Distribution</h2>
          <ConfidenceBar scenarios={scenarios}></ConfidenceBar>
        </div>

        {/* Footer */}
        <div className="report-doc-footer">
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <NfqMark size={14}></NfqMark>
            <span>Generated by QAAP — QA Automation Platform by Nfq</span>
          </div>
          <span>{report.date} · {QAAP_DATA.tenant.name}</span>
        </div>
      </div>
    </div>
  );
}

window.ReportsScreen = ReportsScreen;
window.ReportViewer = ReportViewer;
