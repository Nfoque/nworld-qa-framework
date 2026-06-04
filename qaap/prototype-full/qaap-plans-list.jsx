// QAAP Test Plans Screen — with market/vertical filtering
function TestPlansScreen({ onOpenPlan, onNewPlan }) {
  const [fadeIn, setFadeIn] = React.useState(false);
  const [marketFilter, setMarketFilter] = React.useState('all');
  const [verticalFilter, setVerticalFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');
  React.useEffect(() => { setTimeout(() => setFadeIn(true), 50); }, []);
  const d = QAAP_DATA;

  const markets = ['all', ...new Set(d.testPlans.map(p => p.market))];
  const verticals = ['all', ...new Set(d.testPlans.map(p => p.vertical))];

  const filtered = d.testPlans.filter(p => {
    if (marketFilter !== 'all' && p.market !== marketFilter) return false;
    if (verticalFilter !== 'all' && p.vertical !== verticalFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const marketColors = { Spain:'#EC683E', France:'#217BEE', All:'var(--qaap-text-tertiary)' };

  return (
    <div className={`screen-content ${fadeIn ? 'screen-visible' : ''}`}>
      <div className="screen-header">
        <div>
          <h1 className="screen-title">Test Plans</h1>
          <p className="screen-subtitle">Manage your E2E test plans across all modalities, markets, and verticals.</p>
        </div>
        <button className="btn-primary" onClick={onNewPlan}><QIcon name="plus" size={16}></QIcon> New Test Plan</button>
      </div>

      {/* Filters */}
      <div className="plans-filters">
        <div className="plans-filter-group">
          <span className="plans-filter-label">Market</span>
          <div className="plans-filter-pills">
            {markets.map(m => (
              <button key={m} className={`btn-tab ${marketFilter === m ? 'btn-tab-active' : ''}`}
                onClick={() => setMarketFilter(m)}>{m === 'all' ? 'All Markets' : m}</button>
            ))}
          </div>
        </div>
        <div className="plans-filter-group">
          <span className="plans-filter-label">Vertical</span>
          <div className="plans-filter-pills">
            {verticals.map(v => (
              <button key={v} className={`btn-tab ${verticalFilter === v ? 'btn-tab-active' : ''}`}
                onClick={() => setVerticalFilter(v)}>{v === 'all' ? 'All Verticals' : v}</button>
            ))}
          </div>
        </div>
        <div className="plans-search">
          <QIcon name="search" size={16} color="var(--qaap-text-tertiary)"></QIcon>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search plans..." className="plans-search-input"></input>
        </div>
      </div>

      <div className="card">
        <div className="plans-table">
          <div className="plans-table-header" style={{ gridTemplateColumns:'2fr 60px 70px 80px 70px 70px 80px 140px 70px' }}>
            <span className="col-name">Name</span>
            <span className="col-sm">Type</span>
            <span className="col-sm">Market</span>
            <span className="col-sm">Vertical</span>
            <span className="col-sm">Status</span>
            <span className="col-sm">Tests</span>
            <span className="col-sm">Platforms</span>
            <span className="col-md">Health</span>
            <span className="col-sm">Updated</span>
          </div>
          {filtered.map(plan => (
            <div key={plan.id} className="plans-table-row" onClick={() => onOpenPlan(plan)}
              style={{ gridTemplateColumns:'2fr 60px 70px 80px 70px 70px 80px 140px 70px' }}>
              <span className="col-name">
                <span className="plan-name">{plan.name}</span>
                <span style={{ fontSize:11, color:'var(--qaap-text-tertiary)' }}>{plan.framework}</span>
              </span>
              <span className="col-sm"><ModalityBadge modality={plan.modality}></ModalityBadge></span>
              <span className="col-sm">
                <span className="market-badge" style={{ color:marketColors[plan.market] || 'var(--qaap-text-tertiary)', background:(marketColors[plan.market] || 'var(--qaap-text-tertiary)') + '14' }}>
                  {plan.market === 'All' ? '🌍' : plan.market === 'Spain' ? '🇪🇸' : plan.market === 'France' ? '🇫🇷' : ''} {plan.market}
                </span>
              </span>
              <span className="col-sm">
                <span className="vertical-badge">{plan.vertical}</span>
              </span>
              <span className="col-sm"><StatusBadge status={plan.status} small></StatusBadge></span>
              <span className="col-sm col-num">{plan.scenarioCount}</span>
              <span className="col-sm">
                <span style={{ display:'flex', gap:2, flexWrap:'wrap' }}>
                  {plan.platforms.map((p, i) => (
                    <span key={i} className="platform-chip">{p}</span>
                  ))}
                </span>
              </span>
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
          {filtered.length === 0 && (
            <div style={{ padding:24, textAlign:'center', color:'var(--qaap-text-tertiary)', fontSize:13 }}>
              No plans match the current filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

window.TestPlansScreen = TestPlansScreen;
