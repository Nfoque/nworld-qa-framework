// QAAP Shared UI Components — Icons, Sidebar, TopBar, Badges, Charts
const { useState, useRef, useEffect, useCallback, memo } = React;

// ─── Icons (compact SVG, 20x20 viewBox) ───
const iconPaths = {
  dashboard: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
  testPlans: 'M9 2H4a2 2 0 00-2 2v16a2 2 0 002 2h16a2 2 0 002-2V9l-7-7H9zm4 0v5a2 2 0 002 2h5M9 13h6M9 17h4',
  health: 'M22 12h-4l-3 9L9 3l-3 9H2',
  proposals: 'M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7zM9 21h6',
  executions: 'M5 3l14 9-14 9V3z',
  schedules: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  reports: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  connectors: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
  settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  bell: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  plus: 'M12 4v16m8-8H4',
  check: 'M5 13l4 4L19 7',
  x: 'M18 6L6 18M6 6l12 12',
  clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  chevronRight: 'M9 5l7 7-7 7',
  chevronDown: 'M19 9l-7 7-7-7',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  browser: 'M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 4h18M7 3v4m4-4v4',
  api: 'M8 9l3 3-3 3m5 0h3M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z',
  phone: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
  chat: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  filter: 'M3 4h18l-7 8.5V18l-4 2v-7.5L3 4z',
  download: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5 5-5m-5 5V3',
  refresh: 'M4 4v5h5M20 20v-5h-5M20.49 9A9 9 0 005.64 5.64L4 9m16 6l-1.64 3.36A9 9 0 014.51 15',
  externalLink: 'M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6m4-3h6v6m-11 5L21 3',
  git: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22',
  jira: 'M12 2L3 7l9 5 9-5-9-5zM3 17l9 5 9-5M3 12l9 5 9-5',
  doc: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
  text: 'M4 6h16M4 12h10M4 18h14',
  logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  run: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  export: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',
};

function QIcon({ name, size = 20, color, style, className }) {
  const d = iconPaths[name];
  if (!d) return null;
  const isFilledIcon = ['dashboard', 'executions'].includes(name);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={isFilledIcon ? (color || 'currentColor') : 'none'}
      stroke={isFilledIcon ? 'none' : (color || 'currentColor')} strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" style={style} className={className}>
      <path d={d}></path>
    </svg>
  );
}

// ─── NFQ Logo (using actual brand image) ───
function NfqMark({ size = 40 }) {
  const src = (window.__resources && window.__resources.nfqLogo) || 'assets/nfq-logo.png';
  return <img src={src} alt="NFQ" style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}></img>;
}

function NfqWordmark({ height = 20, color = '#100D25' }) {
  const scale = height / 28;
  return (
    <svg width={Math.round(62 * scale)} height={height} viewBox="0 0 62 28" fill="none" style={{ display:'block' }}>
      <text x="0" y="22" fontFamily="'Sora', sans-serif" fontWeight="700" fontSize="26" fill={color} letterSpacing="-0.5">Nfq</text>
    </svg>
  );
}

function NLogo({ size = 32, color, full, mark }) {
  if (mark) return <NfqMark size={size}></NfqMark>;
  if (full) {
    return (
      <span style={{ display:'inline-flex', alignItems:'center', gap: Math.round(size * 0.25) }}>
        <NfqMark size={size}></NfqMark>
        <NfqWordmark height={Math.round(size * 0.55)}></NfqWordmark>
      </span>
    );
  }
  return <NfqMark size={size}></NfqMark>;
}

// ─── Status Badge ───
const statusConfig = {
  approved: { label: 'Approved', color: 'var(--qaap-success)', bg: 'var(--qaap-success-light)' },
  review: { label: 'In Review', color: 'var(--qaap-warning)', bg: 'var(--qaap-warning-light)' },
  generating: { label: 'Generating', color: 'var(--qaap-primary)', bg: 'var(--qaap-primary-light)' },
  draft: { label: 'Draft', color: 'var(--qaap-text-tertiary)', bg: 'var(--qaap-bg-hover)' },
  archived: { label: 'Archived', color: 'var(--qaap-text-tertiary)', bg: 'var(--qaap-bg-hover)' },
  passed: { label: 'Passed', color: 'var(--qaap-success)', bg: 'var(--qaap-success-light)' },
  failed: { label: 'Failed', color: 'var(--qaap-error)', bg: 'var(--qaap-error-light)' },
  pending: { label: 'Pending', color: 'var(--qaap-warning)', bg: 'var(--qaap-warning-light)' },
  rejected: { label: 'Rejected', color: 'var(--qaap-error)', bg: 'var(--qaap-error-light)' },
};

function StatusBadge({ status, small }) {
  const cfg = statusConfig[status] || statusConfig.draft;
  const isGenerating = status === 'generating';
  return (
    <span className={`status-badge ${isGenerating ? 'status-pulse' : ''}`}
      style={{ color: cfg.color, background: cfg.bg, fontSize: small ? 11 : 12, padding: small ? '2px 6px' : '3px 10px' }}>
      {cfg.label}
    </span>
  );
}

// ─── Modality Badge ───
const modalityConfig = {
  web: { label: 'Web', icon: 'browser', color: '#217BEE' },
  api: { label: 'API', icon: 'api', color: '#8B5CF6' },
  ios: { label: 'iOS', icon: 'phone', color: '#EC683E' },
};

function ModalityBadge({ modality, showLabel = true }) {
  const cfg = modalityConfig[modality] || modalityConfig.web;
  return (
    <span className="modality-badge" style={{ color: cfg.color, background: cfg.color + '12' }}>
      <QIcon name={cfg.icon} size={14} color={cfg.color}></QIcon>
      {showLabel && <span>{cfg.label}</span>}
    </span>
  );
}

// ─── Confidence Dot ───
function ConfidenceDot({ value, size = 8 }) {
  const color = value >= 85 ? 'var(--qaap-success)' : value >= 60 ? 'var(--qaap-warning)' : 'var(--qaap-error)';
  return <span style={{ display:'inline-block', width:size, height:size, borderRadius:'50%', background:color, flexShrink:0 }}></span>;
}

// ─── Health Badge ───
function HealthBadge({ health }) {
  const cfg = { healthy: { label:'Healthy', color:'var(--qaap-success)' }, degrading: { label:'Degrading', color:'var(--qaap-warning)' }, critical: { label:'Critical', color:'var(--qaap-error)' } };
  const c = cfg[health] || cfg.healthy;
  return <span style={{ color:c.color, fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
    <span style={{ width:6, height:6, borderRadius:'50%', background:c.color }}></span>{c.label}
  </span>;
}

// ─── Sparkline SVG ───
function Sparkline({ data, width = 80, height = 28, color = 'var(--qaap-primary)', showArea = false }) {
  if (!data || data.length < 2) return <span style={{ width, height, display:'inline-block' }}></span>;
  const min = Math.min(...data) - 2;
  const max = Math.max(...data) + 2;
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`);
  return (
    <svg width={width} height={height} style={{ display:'block' }}>
      {showArea && <polygon points={`0,${height} ${pts.join(' ')} ${width},${height}`} fill={color} opacity="0.08"></polygon>}
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></polyline>
      <circle cx={pts[pts.length-1].split(',')[0]} cy={pts[pts.length-1].split(',')[1]} r="2.5" fill={color}></circle>
    </svg>
  );
}

// ─── Mini Bar Chart ───
function MiniBarChart({ data, width = 200, height = 80, barColor }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value)) || 1;
  const barWidth = Math.max(4, (width - (data.length - 1) * 3) / data.length);
  return (
    <svg width={width} height={height + 20} style={{ display:'block' }}>
      {data.map((d, i) => {
        const bh = (d.value / max) * height;
        const color = barColor || (d.status === 'passed' ? 'var(--qaap-success)' : d.status === 'failed' ? 'var(--qaap-error)' : 'var(--qaap-primary)');
        return (
          <g key={i}>
            <rect x={i * (barWidth + 3)} y={height - bh} width={barWidth} height={bh} rx={2} fill={color} opacity={0.8}></rect>
            {d.label && <text x={i * (barWidth + 3) + barWidth/2} y={height + 14} textAnchor="middle" fontSize="9" fill="var(--qaap-text-tertiary)">{d.label}</text>}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Sidebar ───
const navItems = [
  { id:'dashboard', label:'Dashboard', icon:'dashboard' },
  { id:'plans', label:'Test Plans', icon:'testPlans' },
  { id:'health', label:'Health', icon:'health' },
  { id:'proposals', label:'AI Proposals', icon:'proposals', badge:3 },
  { id:'executions', label:'Executions', icon:'executions' },
  { id:'schedules', label:'Schedules', icon:'schedules' },
  { id:'reports', label:'Reports', icon:'reports' },
  { id:'connectors', label:'Connectors', icon:'connectors' },
];

function Sidebar({ currentScreen, onNavigate }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsItems = [
    { id:'llm-settings', label:'LLM Providers' },
    { id:'branding-settings', label:'Branding' },
    { id:'sso-settings', label:'SSO' },
    { id:'notifications-settings', label:'Notifications' },
    { id:'team-settings', label:'Team' },
  ];
  const isSettingsScreen = settingsItems.some(s => s.id === currentScreen);
  return (
    <aside className="sidebar">
      <div className="sidebar-logo" style={{ flexDirection:'column', alignItems:'flex-start', gap:4 }}>
        {QAAP_DATA.tenant.logo ? (
          <img src={QAAP_DATA.tenant.logo} alt={QAAP_DATA.tenant.name} style={{ height:24, maxWidth:160, objectFit:'contain', display:'block' }}></img>
        ) : (
          <span style={{ fontSize:16, fontWeight:700, fontFamily:'var(--qaap-font-heading)', color:'var(--qaap-text)' }}>{QAAP_DATA.tenant.name}</span>
        )}
        <div style={{ fontSize:10, color:'var(--qaap-text-tertiary)', fontWeight:500 }}>QA Automation Platform</div>
        <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:2 }}>
          <span style={{ fontSize:9, color:'var(--qaap-text-secondary)', fontWeight:500 }}>powered by</span>
          <img src="assets/nfq-full-logo.png" alt="nfq" style={{ height:14, objectFit:'contain' }}></img>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button key={item.id} className={`sidebar-item ${currentScreen === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}>
            <QIcon name={item.icon} size={18}></QIcon>
            <span>{item.label}</span>
            {item.badge && <span className="sidebar-badge">{item.badge}</span>}
          </button>
        ))}
      </nav>
      <div className="sidebar-divider"></div>
      <button className={`sidebar-item ${settingsOpen || isSettingsScreen ? 'active' : ''}`} onClick={() => setSettingsOpen(!settingsOpen)}>
        <QIcon name="settings" size={18}></QIcon>
        <span>Settings</span>
        <QIcon name={settingsOpen || isSettingsScreen ? 'chevronDown' : 'chevronRight'} size={14} style={{ marginLeft:'auto', opacity:0.4 }}></QIcon>
      </button>
      {(settingsOpen || isSettingsScreen) && (
        <div style={{ paddingLeft:20 }}>
          {settingsItems.map(s => (
            <button key={s.id} className={`sidebar-item sub ${currentScreen === s.id ? 'active' : ''}`} onClick={() => onNavigate(s.id)}><span>{s.label}</span></button>
          ))}
        </div>
      )}
      <div className="sidebar-user">
        <div className="avatar">{QAAP_DATA.user.initials}</div>
        <div>
          <div style={{ fontSize:13, fontWeight:600, color:'var(--qaap-text)' }}>{QAAP_DATA.user.name}</div>
          <div style={{ fontSize:11, color:'var(--qaap-text-tertiary)' }}>{QAAP_DATA.user.role}</div>
        </div>
      </div>
    </aside>
  );
}

// ─── TopBar ───
function TopBar({ breadcrumbs, actions }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        {breadcrumbs && breadcrumbs.map((b, i) => (
          <React.Fragment key={i}>
            {i > 0 && <QIcon name="chevronRight" size={14} color="var(--qaap-text-tertiary)"></QIcon>}
            <span className={i === breadcrumbs.length - 1 ? 'breadcrumb-current' : 'breadcrumb-link'}
              onClick={b.onClick} style={b.onClick ? {cursor:'pointer'} : {}}>
              {b.label}
            </span>
          </React.Fragment>
        ))}
      </div>
      <div className="topbar-right">
        <button className="topbar-btn">
          <QIcon name="search" size={18}></QIcon>
        </button>
        <button className="topbar-btn" style={{ position:'relative' }}>
          <QIcon name="bell" size={18}></QIcon>
          <span className="notification-dot"></span>
        </button>
        {actions}
      </div>
    </header>
  );
}

// ─── Stat Card ───
function StatCard({ label, value, sub, icon, trend, trendUp, color }) {
  return (
    <div className="stat-card">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value" style={color ? { color } : {}}>{value}</div>
          {sub && <div className="stat-sub">{sub}</div>}
        </div>
        {icon && <div className="stat-icon" style={color ? { background: color + '14', color } : {}}>
          <QIcon name={icon} size={20}></QIcon>
        </div>}
      </div>
      {trend !== undefined && (
        <div className="stat-trend" style={{ color: trendUp ? 'var(--qaap-success)' : 'var(--qaap-error)' }}>
          {trendUp ? '↑' : '↓'} {trend}
        </div>
      )}
    </div>
  );
}

// Export everything to window
Object.assign(window, {
  QIcon, NLogo, NfqMark, NfqWordmark, StatusBadge, ModalityBadge, ConfidenceDot, HealthBadge,
  Sparkline, MiniBarChart, Sidebar, TopBar, StatCard,
  statusConfig, modalityConfig, iconPaths
});
