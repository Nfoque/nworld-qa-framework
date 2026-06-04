// QAAP Connectors Settings Screen
function ConnectorsScreen({ onNavigate }) {
  const [fadeIn, setFadeIn] = React.useState(false);
  const [filter, setFilter] = React.useState('all');
  const [expandedId, setExpandedId] = React.useState(null);
  React.useEffect(() => { setTimeout(() => setFadeIn(true), 50); }, []);
  const d = QAAP_DATA;
  const connectors = d.connectors;

  const typeLabels = {
    task_tracker: 'Task Tracker',
    code_repo: 'Code Repository',
    storage: 'Storage & Docs',
    notification: 'Notifications',
    external: 'External Service',
    api_spec: 'API Specification',
  };

  const statusConfig = {
    connected: { label:'Connected', color:'var(--qaap-success)', bg:'var(--qaap-success-light)', icon:'check' },
    not_configured: { label:'Not Configured', color:'var(--qaap-text-tertiary)', bg:'var(--qaap-bg-hover)', icon:'plus' },
    error: { label:'Error', color:'var(--qaap-error)', bg:'var(--qaap-error-light)', icon:'x' },
  };

  const filtered = filter === 'all' ? connectors : connectors.filter(c => c.status === filter);
  const connectedCount = connectors.filter(c => c.status === 'connected').length;

  return (
    <div className={`screen-content ${fadeIn ? 'screen-visible' : ''}`}>
      <div className="screen-header">
        <div>
          <h1 className="screen-title">Connectors</h1>
          <p className="screen-subtitle">Connect your tools and data sources to provide context for AI-powered test generation.</p>
        </div>
        <button className="btn-primary"><QIcon name="plus" size={16}></QIcon> Add Connector</button>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Connectors" value={connectors.length} sub={`${connectedCount} active`} icon="connectors" color="var(--qaap-primary)"></StatCard>
        <StatCard label="Connected" value={connectedCount} icon="check" color="var(--qaap-success)"></StatCard>
        <StatCard label="Needs Setup" value={connectors.filter(c => c.status === 'not_configured').length} icon="plus" color="var(--qaap-text-secondary)"></StatCard>
        <StatCard label="Errors" value={connectors.filter(c => c.status === 'error').length} sub="Needs attention" icon="x" color="var(--qaap-error)"></StatCard>
      </div>

      <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
        {[{id:'all',label:'All'},{id:'connected',label:'Connected'},{id:'not_configured',label:'Not Configured'},{id:'error',label:'Errors'}].map(f => (
          <button key={f.id} className={`btn-tab ${filter === f.id ? 'btn-tab-active' : ''}`}
            onClick={() => setFilter(f.id)}>{f.label}</button>
        ))}
      </div>

      <div className="connectors-grid">
        {filtered.map(con => {
          const sc = statusConfig[con.status];
          const isExpanded = expandedId === con.id;
          return (
            <div key={con.id} className={`connector-card connector-${con.status}`}>
              <div className="connector-card-top" onClick={() => setExpandedId(isExpanded ? null : con.id)}>
                <div className="connector-icon-wrap">
                  <QIcon name={con.icon} size={22} color={sc.color}></QIcon>
                </div>
                <div className="connector-info">
                  <div className="connector-name-row">
                    <h3 className="connector-name">{con.name}</h3>
                    <span className="connector-status" style={{ color:sc.color, background:sc.bg }}>
                      <QIcon name={sc.icon} size={10} color={sc.color}></QIcon>
                      {sc.label}
                    </span>
                  </div>
                  <p className="connector-desc">{con.description}</p>
                  <div className="connector-type">{typeLabels[con.type]}</div>
                </div>
              </div>

              {con.status === 'connected' && (
                <div className="connector-sync">
                  <span className="connector-sync-label">Last sync: {con.lastSync}</span>
                  {con.error && <span className="connector-error-msg">{con.error}</span>}
                </div>
              )}

              {con.status === 'error' && (
                <div className="connector-sync connector-sync-error">
                  <span className="connector-error-msg"><QIcon name="x" size={12} color="var(--qaap-error)"></QIcon> {con.error}</span>
                  <span className="connector-sync-label">{con.lastSync}</span>
                </div>
              )}

              {isExpanded && con.config && (
                <div className="connector-config">
                  <div className="connector-config-title">Configuration</div>
                  {Object.entries(con.config).map(([key, val]) => (
                    <div key={key} className="connector-config-row">
                      <span className="connector-config-key">{key}</span>
                      <span className="connector-config-val">{Array.isArray(val) ? val.join(', ') : String(val)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="connector-card-actions">
                {con.status === 'connected' && (
                  <React.Fragment>
                    <button className="btn-outline btn-sm"><QIcon name="refresh" size={14}></QIcon> Sync Now</button>
                    <button className="btn-ghost btn-sm">Configure</button>
                    <button className="btn-ghost btn-sm">Test Connection</button>
                  </React.Fragment>
                )}
                {con.status === 'not_configured' && (
                  <button className="btn-primary btn-sm"><QIcon name="plus" size={14}></QIcon> Configure</button>
                )}
                {con.status === 'error' && (
                  <React.Fragment>
                    <button className="btn-primary btn-sm"><QIcon name="refresh" size={14}></QIcon> Retry</button>
                    <button className="btn-ghost btn-sm">Configure</button>
                  </React.Fragment>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.ConnectorsScreen = ConnectorsScreen;
