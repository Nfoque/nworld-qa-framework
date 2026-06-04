// QAAP Branding Settings Screen
function BrandingScreen({ onNavigate }) {
  const [fadeIn, setFadeIn] = React.useState(false);
  const [primaryColor, setPrimaryColor] = React.useState('#217BEE');
  const [accentColor, setAccentColor] = React.useState('#EC683E');
  const [bgColor, setBgColor] = React.useState('#F3F3F3');
  const [tenantName, setTenantName] = React.useState('TechMart');
  const [loginMessage, setLoginMessage] = React.useState('Welcome to TechMart QA Portal');
  const [fontFamily, setFontFamily] = React.useState('Instrument Sans');
  React.useEffect(() => { setTimeout(() => setFadeIn(true), 50); }, []);

  const colorPresets = [
    { label:'Blue', primary:'#217BEE', accent:'#EC683E' },
    { label:'Green', primary:'#16A34A', accent:'#217BEE' },
    { label:'Purple', primary:'#8B5CF6', accent:'#EC683E' },
    { label:'Red', primary:'#D13B5F', accent:'#217BEE' },
    { label:'Orange', primary:'#EC683E', accent:'#217BEE' },
  ];

  const fonts = ['Instrument Sans', 'Inter', 'Source Sans 3', 'DM Sans', 'Roboto'];

  return (
    <div className={`screen-content ${fadeIn ? 'screen-visible' : ''}`}>
      <div className="screen-header">
        <div>
          <h1 className="screen-title">Branding</h1>
          <p className="screen-subtitle">Customize the platform appearance for your tenant. Changes apply to all users in your organization.</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn-outline">Reset to Default</button>
          <button className="btn-primary"><QIcon name="check" size={16}></QIcon> Save Changes</button>
        </div>
      </div>

      <div className="branding-layout">
        {/* Settings Panel */}
        <div className="branding-settings">
          {/* Logo */}
          <div className="branding-section">
            <h3 className="branding-section-title">Logo</h3>
            <div className="branding-logo-upload">
              <div className="branding-logo-preview">
                <NfqMark size={48}></NfqMark>
              </div>
              <div>
                <button className="btn-outline btn-sm">Upload Logo</button>
                <p style={{ fontSize:11, color:'var(--qaap-text-tertiary)', marginTop:4 }}>SVG, PNG or JPG. Max 2MB. Recommended: 200×200px</p>
              </div>
            </div>
            <div className="branding-logo-upload" style={{ marginTop:8 }}>
              <div className="branding-logo-preview" style={{ width:100, borderRadius:4 }}>
                <span style={{ fontSize:9, color:'var(--qaap-text-tertiary)' }}>Favicon</span>
              </div>
              <div>
                <button className="btn-outline btn-sm">Upload Favicon</button>
                <p style={{ fontSize:11, color:'var(--qaap-text-tertiary)', marginTop:4 }}>32×32px ICO or PNG</p>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="branding-section">
            <h3 className="branding-section-title">Company Info</h3>
            <div className="form-field">
              <label>Tenant Name</label>
              <input value={tenantName} onChange={e => setTenantName(e.target.value)} style={{ width:'100%', padding:'8px 12px', border:'1px solid var(--qaap-border)', borderRadius:'var(--qaap-radius-sm)', fontSize:13, outline:'none' }}></input>
            </div>
            <div className="form-field" style={{ marginTop:10 }}>
              <label>Login Page Message</label>
              <input value={loginMessage} onChange={e => setLoginMessage(e.target.value)} style={{ width:'100%', padding:'8px 12px', border:'1px solid var(--qaap-border)', borderRadius:'var(--qaap-radius-sm)', fontSize:13, outline:'none' }}></input>
            </div>
          </div>

          {/* Colors */}
          <div className="branding-section">
            <h3 className="branding-section-title">Colors</h3>
            <div className="branding-color-presets">
              <span style={{ fontSize:11, color:'var(--qaap-text-tertiary)', fontWeight:500 }}>Presets:</span>
              {colorPresets.map(p => (
                <button key={p.label} className={`branding-preset ${primaryColor === p.primary ? 'active' : ''}`}
                  onClick={() => { setPrimaryColor(p.primary); setAccentColor(p.accent); }}>
                  <span className="branding-preset-dot" style={{ background:p.primary }}></span>
                  <span className="branding-preset-dot" style={{ background:p.accent }}></span>
                </button>
              ))}
            </div>
            <div className="branding-colors-grid">
              <div className="branding-color-field">
                <label>Primary</label>
                <div className="branding-color-input">
                  <span className="branding-color-swatch" style={{ background:primaryColor }}></span>
                  <input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} style={{ flex:1, border:'none', outline:'none', fontSize:12, fontFamily:'var(--qaap-font-mono)' }}></input>
                </div>
              </div>
              <div className="branding-color-field">
                <label>Accent</label>
                <div className="branding-color-input">
                  <span className="branding-color-swatch" style={{ background:accentColor }}></span>
                  <input value={accentColor} onChange={e => setAccentColor(e.target.value)} style={{ flex:1, border:'none', outline:'none', fontSize:12, fontFamily:'var(--qaap-font-mono)' }}></input>
                </div>
              </div>
              <div className="branding-color-field">
                <label>Background</label>
                <div className="branding-color-input">
                  <span className="branding-color-swatch" style={{ background:bgColor }}></span>
                  <input value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ flex:1, border:'none', outline:'none', fontSize:12, fontFamily:'var(--qaap-font-mono)' }}></input>
                </div>
              </div>
            </div>
          </div>

          {/* Font */}
          <div className="branding-section">
            <h3 className="branding-section-title">Typography</h3>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {fonts.map(f => (
                <button key={f} className={`btn-tab ${fontFamily === f ? 'btn-tab-active' : ''}`}
                  onClick={() => setFontFamily(f)} style={{ fontFamily:f }}>{f}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="branding-preview-wrap">
          <div className="branding-preview-label">Live Preview</div>
          <div className="branding-preview" style={{ '--preview-primary':primaryColor, '--preview-accent':accentColor, '--preview-bg':bgColor, '--preview-font':fontFamily }}>
            {/* Mini Login Preview */}
            <div className="bp-login">
              <div className="bp-login-card">
                <NfqMark size={24}></NfqMark>
                <div style={{ fontFamily:'var(--qaap-font-heading)', fontWeight:700, fontSize:14, marginTop:6 }}>QAAP</div>
                <div style={{ fontSize:9, color:'#82858D', marginBottom:10 }}>{loginMessage}</div>
                <div className="bp-tenant-bar">
                  <span style={{ fontSize:12, fontWeight:700, color:'var(--preview-primary)' }}>{tenantName.charAt(0)}</span>
                  <span style={{ fontSize:10, fontWeight:500 }}>{tenantName}</span>
                </div>
                <div className="bp-btn" style={{ background:'var(--preview-primary)' }}>Sign in with SSO</div>
              </div>
            </div>

            {/* Mini Dashboard Preview */}
            <div className="bp-dashboard">
              <div className="bp-sidebar">
                <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:8 }}>
                  <div style={{ width:12, height:12, borderRadius:3, background:'var(--preview-primary)' }}></div>
                  <span style={{ fontSize:8, fontWeight:700 }}>QAAP</span>
                </div>
                {['Dashboard','Test Plans','Health','Executions'].map((item, i) => (
                  <div key={i} className={`bp-nav-item ${i === 0 ? 'bp-nav-active' : ''}`}
                    style={i === 0 ? { background: primaryColor + '18', color:'var(--preview-primary)' } : {}}>
                    <div style={{ width:6, height:6, borderRadius:1, background:i === 0 ? 'var(--preview-primary)' : '#BFBFBF' }}></div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="bp-content" style={{ background:'var(--preview-bg)' }}>
                <div className="bp-topbar">
                  <span style={{ fontSize:8, fontWeight:600 }}>Dashboard</span>
                </div>
                <div className="bp-stats">
                  {[{ v:'6', l:'Plans' },{ v:'99', l:'Scenarios' },{ v:'94%', l:'Pass Rate' }].map((s, i) => (
                    <div key={i} className="bp-stat-card">
                      <div style={{ fontSize:14, fontWeight:700, fontFamily:'var(--qaap-font-heading)', color: i === 2 ? 'var(--preview-primary)' : 'inherit' }}>{s.v}</div>
                      <div style={{ fontSize:7, color:'#82858D' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                <div className="bp-btn-sm" style={{ background:'var(--preview-primary)' }}>+ New Plan</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.BrandingScreen = BrandingScreen;
