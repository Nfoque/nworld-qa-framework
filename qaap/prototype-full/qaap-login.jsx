// QAAP Login Screen — polished with NFQ 3D mark
const { useState, useEffect } = React;

function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('sso');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => { const t = setTimeout(() => setFadeIn(true), 50); return () => clearTimeout(t); }, []);

  const handleLogin = (e) => {
    e && e.preventDefault();
    setLoading(true);
    setTimeout(() => onLogin(), 900);
  };

  return (
    <div className={`login-screen ${fadeIn ? 'login-visible' : ''}`}>
      <div className="login-bg">
        <div className="login-grid"></div>
        <div className="login-glow login-glow-1"></div>
        <div className="login-glow login-glow-2"></div>
      </div>
      <div className="login-card">
        <div className="login-header">
          <NfqMark size={52}></NfqMark>
          <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
            <h1 style={{ fontSize:26, fontWeight:700, fontFamily:'var(--qaap-font-heading)', margin:0, color:'var(--qaap-text)', letterSpacing:'-0.03em', lineHeight:1 }}>QAAP</h1>
            <p style={{ fontSize:11, color:'var(--qaap-text-tertiary)', margin:0, fontWeight:500 }}>QA Automation Platform</p>
          </div>
        </div>

        <div className="login-tenant">
          <div className="login-tenant-logo">
            <span style={{ fontSize:18, fontWeight:700, fontFamily:'var(--qaap-font-heading)', color:'var(--qaap-primary)' }}>T</span>
          </div>
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:'var(--qaap-text)' }}>{QAAP_DATA.tenant.name}</div>
            <div style={{ fontSize:11, color:'var(--qaap-text-tertiary)' }}>{QAAP_DATA.tenant.slug}.qaap.dev</div>
          </div>
        </div>

        <div className="login-divider">
          <span>Sign in to continue</span>
        </div>

        {mode === 'sso' ? (
          <div className="login-sso">
            <button className="btn-primary btn-lg" onClick={handleLogin} disabled={loading}>
              {loading ? (
                <span className="login-spinner"></span>
              ) : (
                <React.Fragment>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0110 0v4"></path>
                  </svg>
                  Sign in with {QAAP_DATA.tenant.name}&nbsp;SSO
                </React.Fragment>
              )}
            </button>
            <button className="login-link" onClick={() => setMode('email')}>
              Use email and password instead
            </button>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-field">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com" autoFocus></input>
            </div>
            <div className="form-field">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"></input>
            </div>
            <button type="submit" className="btn-primary btn-lg" disabled={loading} style={{ width:'100%' }}>
              {loading ? <span className="login-spinner"></span> : 'Sign in'}
            </button>
            <button type="button" className="login-link" onClick={() => setMode('sso')}>
              Use SSO instead
            </button>
          </form>
        )}

        <div className="login-footer">
          <span>Powered by</span>
          <NfqMark size={16}></NfqMark>
          <span style={{ fontWeight:700, fontFamily:'var(--qaap-font-heading)', fontSize:13, color:'var(--qaap-text)' }}>Nfq</span>
        </div>
      </div>
    </div>
  );
}

// ─── Password Gate ───
function PasswordGate({ onPass }) {
  const [pwd, setPwd] = React.useState('');
  const [error, setError] = React.useState(false);
  const [fadeIn, setFadeIn] = React.useState(false);
  const GATE_KEY = 'qaap_gate_passed';
  const GATE_PWD = 'cwoQn11fer9drE7fvzBq';

  React.useEffect(() => {
    if (localStorage.getItem(GATE_KEY) === 'true') { onPass(); return; }
    setTimeout(() => setFadeIn(true), 50);
  }, []);

  const handleSubmit = (e) => {
    e && e.preventDefault();
    if (pwd === GATE_PWD) {
      localStorage.setItem(GATE_KEY, 'true');
      onPass();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className={`login-screen ${fadeIn ? 'login-visible' : ''}`}>
      <div className="login-bg">
        <div className="login-grid"></div>
        <div className="login-glow login-glow-1"></div>
        <div className="login-glow login-glow-2"></div>
      </div>
      <div className="login-card" style={{ width:360, textAlign:'center' }}>
        <NfqMark size={44}></NfqMark>
        <h2 style={{ fontFamily:'var(--qaap-font-heading)', fontSize:20, fontWeight:700, margin:'16px 0 4px', letterSpacing:'-0.02em' }}>QAAP Demo Access</h2>
        <p style={{ fontSize:12, color:'var(--qaap-text-tertiary)', marginBottom:20 }}>Enter the access code to continue</p>
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <input type="password" value={pwd} onChange={e => { setPwd(e.target.value); setError(false); }}
            placeholder="Access code" autoFocus
            style={{ padding:'10px 14px', border:`1px solid ${error ? 'var(--qaap-error)' : 'var(--qaap-border)'}`, borderRadius:'var(--qaap-radius-sm)', fontSize:14, textAlign:'center', outline:'none', fontFamily:'var(--qaap-font-mono)', letterSpacing:'0.1em', transition:'border-color 0.2s' }}></input>
          {error && <span style={{ fontSize:12, color:'var(--qaap-error)', fontWeight:500 }}>Invalid access code</span>}
          <button type="submit" className="btn-primary btn-lg" style={{ width:'100%' }}>Access Demo</button>
        </form>
        <div className="login-footer">
          <span>Powered by</span>
          <NfqMark size={16}></NfqMark>
          <span style={{ fontWeight:700, fontFamily:'var(--qaap-font-heading)', fontSize:13, color:'var(--qaap-text)' }}>Nfq</span>
        </div>
      </div>
    </div>
  );
}

window.LoginScreen = LoginScreen;
window.PasswordGate = PasswordGate;
