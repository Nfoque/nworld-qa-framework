// QAAP AI Fix Proposals Screen
function ProposalsScreen({ onNavigate }) {
  const [fadeIn, setFadeIn] = React.useState(false);
  const [filter, setFilter] = React.useState('all');
  const [expandedId, setExpandedId] = React.useState(null);
  React.useEffect(() => { setTimeout(() => setFadeIn(true), 50); }, []);
  const d = QAAP_DATA;
  const proposals = d.aiProposals;

  const typeConfig = {
    bug_detection: { label:'Bug Detection', color:'var(--qaap-error)', bg:'var(--qaap-error-light)', icon:'x' },
    fix_proposal: { label:'Fix Proposal', color:'var(--qaap-primary)', bg:'var(--qaap-primary-light)', icon:'check' },
    test_improvement: { label:'Test Improvement', color:'var(--qaap-success)', bg:'var(--qaap-success-light)', icon:'proposals' },
    coverage_gap: { label:'Coverage Gap', color:'var(--qaap-warning)', bg:'var(--qaap-warning-light)', icon:'testPlans' },
    testid_gap: { label:'Missing Test IDs', color:'#8B5CF6', bg:'#8B5CF612', icon:'search' },
    cross_platform: { label:'Cross-Platform', color:'#0891B2', bg:'#0891B212', icon:'phone' },
    flaky_fix: { label:'Flaky Fix', color:'var(--qaap-warning)', bg:'var(--qaap-warning-light)', icon:'refresh' },
  };

  const statusColors = {
    proposed: { label:'Proposed', color:'var(--qaap-primary)', bg:'var(--qaap-primary-light)' },
    accepted: { label:'Accepted', color:'var(--qaap-success)', bg:'var(--qaap-success-light)' },
    rejected: { label:'Rejected', color:'var(--qaap-text-tertiary)', bg:'var(--qaap-bg-hover)' },
  };

  const filtered = filter === 'all' ? proposals : proposals.filter(p => p.type === filter);
  const proposedCount = proposals.filter(p => p.status === 'proposed').length;

  return (
    <div className={`screen-content ${fadeIn ? 'screen-visible' : ''}`}>
      <div className="screen-header">
        <div>
          <h1 className="screen-title">AI Proposals</h1>
          <p className="screen-subtitle">Proactive improvements detected by AI — bugs, fixes, coverage gaps, and test improvements.</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span className="badge-count" style={{ background:'var(--qaap-primary-light)', color:'var(--qaap-primary)' }}>{proposedCount} pending</span>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard label="Total Proposals" value={proposals.length} sub="Last 30 days" icon="proposals" color="var(--qaap-primary)"></StatCard>
        <StatCard label="Bugs Detected" value={proposals.filter(p => p.type === 'bug_detection').length} icon="x" color="var(--qaap-error)"></StatCard>
        <StatCard label="Accepted" value={proposals.filter(p => p.status === 'accepted').length} sub="Ready for PR" icon="check" color="var(--qaap-success)"></StatCard>
        <StatCard label="Coverage Gaps" value={proposals.filter(p => p.type === 'coverage_gap').length} icon="testPlans" color="var(--qaap-warning)"></StatCard>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:6, marginBottom:12, flexWrap:'wrap' }}>
        {[{id:'all',label:'All'}, {id:'bug_detection',label:'Bugs'}, {id:'fix_proposal',label:'Fixes'}, {id:'test_improvement',label:'Improvements'}, {id:'coverage_gap',label:'Coverage Gaps'}, {id:'testid_gap',label:'Missing Test IDs'}, {id:'cross_platform',label:'Cross-Platform'}, {id:'flaky_fix',label:'Flaky Fixes'}].map(f => (
          <button key={f.id} className={`btn-tab ${filter === f.id ? 'btn-tab-active' : ''}`}
            onClick={() => setFilter(f.id)}>{f.label}</button>
        ))}
      </div>

      {/* Proposal Cards */}
      <div className="proposals-list">
        {filtered.map(prop => {
          const tc = typeConfig[prop.type];
          const sc = statusColors[prop.status];
          const isExpanded = expandedId === prop.id;
          return (
            <div key={prop.id} className={`proposal-card ${isExpanded ? 'proposal-expanded' : ''}`}>
              <div className="proposal-header" onClick={() => setExpandedId(isExpanded ? null : prop.id)}>
                <div className="proposal-header-left">
                  <div className="proposal-type-badge" style={{ color:tc.color, background:tc.bg }}>
                    <QIcon name={tc.icon} size={12} color={tc.color}></QIcon>
                    {tc.label}
                  </div>
                  <h3 className="proposal-title">{prop.title}</h3>
                </div>
                <div className="proposal-header-right">
                  <div className="proposal-confidence">
                    <ConfidenceDot value={prop.confidence}></ConfidenceDot>
                    <span>{prop.confidence}%</span>
                  </div>
                  <span className="proposal-status-badge" style={{ color:sc.color, background:sc.bg }}>{sc.label}</span>
                  <QIcon name={isExpanded ? 'chevronDown' : 'chevronRight'} size={16}></QIcon>
                </div>
              </div>

              <div className="proposal-meta">
                <span>{prop.plan}</span>
                <span>·</span>
                <span>{prop.source}</span>
              </div>

              {isExpanded && (
                <div className="proposal-detail">
                  <p className="proposal-description">{prop.description}</p>

                  {prop.affectedFiles.length > 0 && (
                    <div className="proposal-files">
                      <span className="proposal-files-label">Affected files:</span>
                      {prop.affectedFiles.map((f, i) => (
                        <code key={i} className="proposal-file">{f}</code>
                      ))}
                    </div>
                  )}

                  {prop.diff && (
                    <div className="proposal-diff">
                      <div className="proposal-diff-header">Suggested Changes</div>
                      <pre className="proposal-diff-code">{prop.diff}</pre>
                    </div>
                  )}

                  <div className="proposal-actions">
                    {prop.status === 'proposed' && (
                      <React.Fragment>
                        <button className="btn-primary btn-sm"><QIcon name="check" size={14}></QIcon> Accept & Create PR</button>
                        <button className="btn-outline btn-sm"><QIcon name="chat" size={14}></QIcon> Discuss</button>
                        <button className="btn-outline btn-sm" style={{ color:'var(--qaap-error)' }}><QIcon name="x" size={14}></QIcon> Reject</button>
                      </React.Fragment>
                    )}
                    {prop.status === 'accepted' && (
                      <button className="btn-primary btn-sm"><QIcon name="git" size={14}></QIcon> View PR</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.ProposalsScreen = ProposalsScreen;
