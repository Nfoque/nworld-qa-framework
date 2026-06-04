// Booking.com — Override Settings screens with tenant-specific data

// ─── SSO Settings (Booking.com) ───
function SSOScreen({ onNavigate }) {
  const [fadeIn, setFadeIn] = React.useState(false);
  const [ssoEnabled, setSsoEnabled] = React.useState(true);
  React.useEffect(() => { setTimeout(() => setFadeIn(true), 50); }, []);

  const providers = QAAP_DATA.ssoProviders || [
    { name:'Okta', status:'active', protocol:'SAML 2.0', domain:'booking.com', lastLogin:'Today 14:45', users:31 },
    { name:'Google Workspace', status:'inactive', protocol:'OIDC', domain:'booking.com', lastLogin:'Never', users:0 },
  ];

  return (
    <div className={`screen-content ${fadeIn ? 'screen-visible' : ''}`}>
      <div className="screen-header">
        <div>
          <h1 className="screen-title">Single Sign-On</h1>
          <p className="screen-subtitle">Configure SSO providers so your team can log in with their company credentials.</p>
        </div>
        <button className="btn-primary"><QIcon name="plus" size={16}></QIcon> Add Provider</button>
      </div>

      <div className="card" style={{ marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 18px' }}>
          <div>
            <div style={{ fontWeight:600, fontSize:14 }}>Enforce SSO</div>
            <div style={{ fontSize:12, color:'var(--qaap-text-tertiary)' }}>When enabled, email/password login is disabled. Users must authenticate via SSO.</div>
          </div>
          <div className={`delivery-toggle ${ssoEnabled ? 'active' : ''}`} onClick={() => setSsoEnabled(!ssoEnabled)}>
            <div className="delivery-toggle-knob"></div>
          </div>
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {providers.map((p, i) => (
          <div key={i} className="card">
            <div style={{ padding:'16px 18px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:'var(--qaap-radius-sm)', background: p.status === 'active' ? 'var(--qaap-success-light)' : 'var(--qaap-bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <QIcon name="connectors" size={18} color={p.status === 'active' ? 'var(--qaap-success)' : 'var(--qaap-text-tertiary)'}></QIcon>
                  </div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14 }}>{p.name}</div>
                    <div style={{ fontSize:11, color:'var(--qaap-text-tertiary)' }}>{p.protocol} · {p.domain}</div>
                  </div>
                </div>
                <span className="connector-status" style={{ color: p.status === 'active' ? 'var(--qaap-success)' : 'var(--qaap-text-tertiary)', background: p.status === 'active' ? 'var(--qaap-success-light)' : 'var(--qaap-bg-hover)' }}>
                  {p.status === 'active' ? '● Active' : '○ Inactive'}
                </span>
              </div>
              <div style={{ display:'flex', gap:24, fontSize:12, color:'var(--qaap-text-tertiary)' }}>
                <span>Last login: <strong style={{ color:'var(--qaap-text)' }}>{p.lastLogin}</strong></span>
                <span>Users: <strong style={{ color:'var(--qaap-text)' }}>{p.users}</strong></span>
              </div>
            </div>
            <div className="connector-card-actions">
              <button className="btn-outline btn-sm">Configure</button>
              <button className="btn-ghost btn-sm">Test Connection</button>
              {p.status === 'active' && <button className="btn-ghost btn-sm" style={{ color:'var(--qaap-error)', marginLeft:'auto' }}>Deactivate</button>}
              {p.status === 'inactive' && <button className="btn-primary btn-sm" style={{ marginLeft:'auto' }}>Activate</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Notifications Settings (Booking.com) ───
function NotificationsScreen({ onNavigate }) {
  const [fadeIn, setFadeIn] = React.useState(false);
  React.useEffect(() => { setTimeout(() => setFadeIn(true), 50); }, []);

  const channels = QAAP_DATA.notificationChannels || [];
  const rules = [
    { event:'Test execution failed', channels:['Email','Slack'], severity:'critical', enabled:true },
    { event:'Pass rate below threshold', channels:['Email','Slack','Webhook'], severity:'critical', enabled:true },
    { event:'Test plan generated', channels:['Slack'], severity:'info', enabled:true },
    { event:'AI proposal created', channels:['Email'], severity:'info', enabled:true },
    { event:'Flaky test detected', channels:['Slack'], severity:'warning', enabled:true },
    { event:'Scheduled run completed', channels:['Webhook'], severity:'info', enabled:false },
  ];
  const severityColors = { critical:'var(--qaap-error)', warning:'var(--qaap-warning)', info:'var(--qaap-primary)' };

  return (
    <div className={`screen-content ${fadeIn ? 'screen-visible' : ''}`}>
      <div className="screen-header">
        <div>
          <h1 className="screen-title">Notifications</h1>
          <p className="screen-subtitle">Configure notification channels and alert rules for your team.</p>
        </div>
        <button className="btn-primary"><QIcon name="plus" size={16}></QIcon> Add Channel</button>
      </div>

      <h3 style={{ fontSize:14, fontFamily:'var(--qaap-font-heading)', fontWeight:600, margin:'0 0 10px' }}>Channels</h3>
      <div className="connectors-grid" style={{ marginBottom:20 }}>
        {channels.map(ch => {
          const isConnected = ch.status === 'connected';
          return (
            <div key={ch.id} className="connector-card" style={!isConnected ? { opacity:0.65 } : {}}>
              <div className="connector-card-top" style={{ padding:'14px 16px' }}>
                <div className="connector-icon-wrap" style={{ width:36, height:36 }}>
                  <QIcon name={ch.icon} size={18} color={isConnected ? 'var(--qaap-success)' : 'var(--qaap-text-tertiary)'}></QIcon>
                </div>
                <div className="connector-info">
                  <div className="connector-name-row">
                    <h3 className="connector-name" style={{ fontSize:13 }}>{ch.name}</h3>
                    <span className="connector-status" style={{ color: isConnected ? 'var(--qaap-success)' : 'var(--qaap-text-tertiary)', background: isConnected ? 'var(--qaap-success-light)' : 'var(--qaap-bg-hover)' }}>
                      {isConnected ? '● Connected' : '○ Not configured'}
                    </span>
                  </div>
                  {ch.config && <p className="connector-desc" style={{ fontSize:11 }}>{ch.config}</p>}
                </div>
              </div>
              <div className="connector-card-actions">
                {isConnected ? (
                  <React.Fragment>
                    <button className="btn-outline btn-sm">Configure</button>
                    <button className="btn-ghost btn-sm">Test</button>
                  </React.Fragment>
                ) : (
                  <button className="btn-primary btn-sm"><QIcon name="plus" size={14}></QIcon> Configure</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <h3 style={{ fontSize:14, fontFamily:'var(--qaap-font-heading)', fontWeight:600, margin:'0 0 10px' }}>Alert Rules</h3>
      <div className="card">
        <div className="reports-table">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 160px 80px 60px', gap:8, padding:'8px 18px', fontSize:11, fontWeight:600, color:'var(--qaap-text-tertiary)', textTransform:'uppercase', letterSpacing:'0.04em', borderBottom:'1px solid var(--qaap-border-light)' }}>
            <span>Event</span><span>Channels</span><span>Severity</span><span>Enabled</span>
          </div>
          {rules.map((r, i) => (
            <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 160px 80px 60px', gap:8, padding:'10px 18px', alignItems:'center', borderBottom:'1px solid var(--qaap-border-light)', fontSize:13 }}>
              <span style={{ fontWeight:500 }}>{r.event}</span>
              <span style={{ display:'flex', gap:3, flexWrap:'wrap' }}>
                {r.channels.map((ch, j) => <span key={j} className="llm-model-chip">{ch}</span>)}
              </span>
              <span>
                <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:10, color:severityColors[r.severity], background:severityColors[r.severity] + '18' }}>{r.severity}</span>
              </span>
              <span>
                <div className={`delivery-toggle ${r.enabled ? 'active' : ''}`} style={{ width:32, height:18 }}>
                  <div className="delivery-toggle-knob" style={{ width:14, height:14 }}></div>
                </div>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Team Settings (Booking.com) ───
function TeamScreen({ onNavigate }) {
  const [fadeIn, setFadeIn] = React.useState(false);
  React.useEffect(() => { setTimeout(() => setFadeIn(true), 50); }, []);

  const members = QAAP_DATA.teamMembers || [];
  const roleColors = {
    Admin: { color:'var(--qaap-error)', bg:'var(--qaap-error-light)' },
    'QA Expert': { color:'var(--qaap-primary)', bg:'var(--qaap-primary-light)' },
    Viewer: { color:'var(--qaap-text-tertiary)', bg:'var(--qaap-bg-hover)' },
  };

  return (
    <div className={`screen-content ${fadeIn ? 'screen-visible' : ''}`}>
      <div className="screen-header">
        <div>
          <h1 className="screen-title">Team</h1>
          <p className="screen-subtitle">Manage team members and their access levels.</p>
        </div>
        <button className="btn-primary"><QIcon name="plus" size={16}></QIcon> Invite Member</button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns:'repeat(3, 1fr)' }}>
        <StatCard label="Team Members" value={members.length} sub={`${members.filter(m => m.status === 'active').length} active`} icon="text" color="var(--qaap-primary)"></StatCard>
        <StatCard label="Admins" value={members.filter(m => m.role === 'Admin').length} icon="settings" color="var(--qaap-error)"></StatCard>
        <StatCard label="Pending Invites" value={members.filter(m => m.status === 'pending').length} icon="send" color="var(--qaap-warning)"></StatCard>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">Members</h3></div>
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 80px 100px 80px', gap:8, padding:'8px 18px', fontSize:11, fontWeight:600, color:'var(--qaap-text-tertiary)', textTransform:'uppercase', letterSpacing:'0.04em', borderBottom:'1px solid var(--qaap-border-light)' }}>
            <span>Member</span><span>Email</span><span>Role</span><span>Last Active</span><span>Actions</span>
          </div>
          {members.map((m, i) => {
            const rc = roleColors[m.role] || roleColors.Viewer;
            return (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 80px 100px 80px', gap:8, padding:'10px 18px', alignItems:'center', borderBottom:'1px solid var(--qaap-border-light)', fontSize:13 }}>
                <span style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div className="avatar" style={{ width:30, height:30, fontSize:11 }}>{m.initials}</div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:13 }}>{m.name}</div>
                    {m.status === 'pending' && <span style={{ fontSize:10, color:'var(--qaap-warning)', fontWeight:500 }}>Pending invite</span>}
                  </div>
                </span>
                <span style={{ fontSize:12, color:'var(--qaap-text-tertiary)', fontFamily:'var(--qaap-font-mono)' }}>{m.email}</span>
                <span>
                  <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:10, color:rc.color, background:rc.bg }}>{m.role}</span>
                </span>
                <span style={{ fontSize:12, color:'var(--qaap-text-tertiary)' }}>{m.lastActive}</span>
                <span style={{ display:'flex', gap:4 }}>
                  <button className="btn-ghost" title="Edit"><QIcon name="settings" size={14}></QIcon></button>
                  {m.status === 'pending' && <button className="btn-ghost" title="Resend"><QIcon name="send" size={14}></QIcon></button>}
                  <button className="btn-ghost" title="Remove" style={{ color:'var(--qaap-error)' }}><QIcon name="x" size={14}></QIcon></button>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

window.SSOScreen = SSOScreen;
window.NotificationsScreen = NotificationsScreen;
window.TeamScreen = TeamScreen;
