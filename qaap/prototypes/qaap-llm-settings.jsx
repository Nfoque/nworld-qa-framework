// QAAP LLM Settings Screen
function LLMSettingsScreen({ onNavigate }) {
  const [fadeIn, setFadeIn] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('providers');
  React.useEffect(() => { setTimeout(() => setFadeIn(true), 50); }, []);

  const providers = [
    { id:'anthropic', name:'Anthropic', status:'connected', logo:'N', color:'#D97706', models:['Claude Sonnet 4','Claude Haiku','Claude Opus'], apiKey:'sk-ant-••••••••••••7x3M', baseUrl:'https://api.anthropic.com', tokensUsed:284500, cost:'$12.40' },
    { id:'openai', name:'OpenAI', status:'connected', logo:'O', color:'#10A37F', models:['GPT-4o','GPT-4o Mini','Codex Mini'], apiKey:'sk-proj-••••••••••••9kLp', baseUrl:'https://api.openai.com', tokensUsed:156200, cost:'$8.70' },
    { id:'google', name:'Google AI', status:'connected', logo:'G', color:'#4285F4', models:['Gemini 2.5 Pro','Gemini 2.5 Flash'], apiKey:'AIza••••••••••••Yw2', baseUrl:'https://generativelanguage.googleapis.com', tokensUsed:98400, cost:'$3.20' },
    { id:'ollama', name:'Ollama (Local)', status:'not_configured', logo:'L', color:'var(--qaap-text-tertiary)', models:['Llama 3','CodeLlama','Mistral'], apiKey:null, baseUrl:'http://localhost:11434', tokensUsed:0, cost:'$0.00' },
  ];

  const taskMatrix = [
    { task:'Test Generation', description:'Generate Gherkin scenarios from context', assigned:'Claude Sonnet 4', provider:'Anthropic' },
    { task:'Code Generation', description:'Convert Gherkin to Playwright/Cypress/Karate', assigned:'Claude Sonnet 4', provider:'Anthropic' },
    { task:'Plan Review', description:'Second opinion review of generated plans', assigned:'Gemini 2.5 Pro', provider:'Google AI' },
    { task:'Failure Analysis', description:'Root cause analysis of failed tests', assigned:'GPT-4o', provider:'OpenAI' },
    { task:'Failure Classification', description:'Classify failures into categories', assigned:'GPT-4o Mini', provider:'OpenAI' },
    { task:'Chat Assistant', description:'Interactive AI chat in plan workspace', assigned:'Claude Sonnet 4', provider:'Anthropic' },
  ];

  const usageData = [
    { month:'Jan', anthropic:42, openai:28, google:15 },
    { month:'Feb', anthropic:51, openai:32, google:18 },
    { month:'Mar', anthropic:68, openai:41, google:22 },
    { month:'Apr', anthropic:74, openai:35, google:28 },
    { month:'May', anthropic:89, openai:48, google:31 },
    { month:'Jun', anthropic:62, openai:38, google:24 },
  ];

  return (
    <div className={`screen-content ${fadeIn ? 'screen-visible' : ''}`}>
      <div className="screen-header">
        <div>
          <h1 className="screen-title">LLM Providers</h1>
          <p className="screen-subtitle">Configure AI models, assign tasks, and monitor token usage across providers.</p>
        </div>
        <button className="btn-primary"><QIcon name="plus" size={16}></QIcon> Add Provider</button>
      </div>

      <div style={{ display:'flex', gap:2, background:'var(--qaap-bg-card)', border:'1px solid var(--qaap-border)', borderRadius:'var(--qaap-radius-sm)', padding:2, marginBottom:16, width:'fit-content' }}>
        <button className={`btn-tab ${activeTab === 'providers' ? 'btn-tab-active' : ''}`} onClick={() => setActiveTab('providers')}>Providers</button>
        <button className={`btn-tab ${activeTab === 'matrix' ? 'btn-tab-active' : ''}`} onClick={() => setActiveTab('matrix')}>Task Matrix</button>
        <button className={`btn-tab ${activeTab === 'usage' ? 'btn-tab-active' : ''}`} onClick={() => setActiveTab('usage')}>Usage & Costs</button>
      </div>

      {activeTab === 'providers' && (
        <div className="llm-providers-grid">
          {providers.map(p => (
            <div key={p.id} className={`llm-provider-card ${p.status === 'not_configured' ? 'llm-not-configured' : ''}`}>
              <div className="llm-provider-top">
                <div className="llm-provider-logo" style={{ background:p.color + '18', color:p.color }}>
                  <span style={{ fontWeight:800, fontSize:18, fontFamily:'var(--qaap-font-heading)' }}>{p.logo}</span>
                </div>
                <div className="llm-provider-info">
                  <div className="llm-provider-name-row">
                    <h3 className="llm-provider-name">{p.name}</h3>
                    <span className={`connector-status`} style={{ color: p.status === 'connected' ? 'var(--qaap-success)' : 'var(--qaap-text-tertiary)', background: p.status === 'connected' ? 'var(--qaap-success-light)' : 'var(--qaap-bg-hover)' }}>
                      {p.status === 'connected' ? '● Connected' : '○ Not configured'}
                    </span>
                  </div>
                  <div className="llm-models-list">
                    {p.models.map((m, i) => <span key={i} className="llm-model-chip">{m}</span>)}
                  </div>
                </div>
              </div>

              {p.status === 'connected' && (
                <React.Fragment>
                  <div className="llm-provider-config">
                    <div className="llm-config-row">
                      <span className="llm-config-label">API Key</span>
                      <span className="llm-config-value">{p.apiKey} <button className="btn-ghost" style={{ fontSize:10 }}>Reveal</button></span>
                    </div>
                    <div className="llm-config-row">
                      <span className="llm-config-label">Base URL</span>
                      <span className="llm-config-value" style={{ fontFamily:'var(--qaap-font-mono)', fontSize:11 }}>{p.baseUrl}</span>
                    </div>
                  </div>
                  <div className="llm-provider-stats">
                    <div className="llm-stat">
                      <span className="llm-stat-value">{(p.tokensUsed/1000).toFixed(0)}K</span>
                      <span className="llm-stat-label">Tokens (30d)</span>
                    </div>
                    <div className="llm-stat">
                      <span className="llm-stat-value">{p.cost}</span>
                      <span className="llm-stat-label">Cost (30d)</span>
                    </div>
                  </div>
                </React.Fragment>
              )}

              <div className="connector-card-actions">
                {p.status === 'connected' ? (
                  <React.Fragment>
                    <button className="btn-outline btn-sm">Configure</button>
                    <button className="btn-ghost btn-sm">Test Connection</button>
                    <button className="btn-ghost btn-sm" style={{ color:'var(--qaap-error)', marginLeft:'auto' }}>Remove</button>
                  </React.Fragment>
                ) : (
                  <button className="btn-primary btn-sm"><QIcon name="plus" size={14}></QIcon> Configure</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'matrix' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Task-to-Model Assignment</h3>
            <span style={{ fontSize:11, color:'var(--qaap-text-tertiary)' }}>Drag or click to reassign models to tasks</span>
          </div>
          <div className="llm-matrix">
            <div className="llm-matrix-header">
              <span className="llm-matrix-col-task">Task</span>
              <span className="llm-matrix-col-desc">Description</span>
              <span className="llm-matrix-col-model">Assigned Model</span>
              <span className="llm-matrix-col-provider">Provider</span>
            </div>
            {taskMatrix.map((row, i) => (
              <div key={i} className="llm-matrix-row">
                <span className="llm-matrix-col-task">
                  <strong>{row.task}</strong>
                </span>
                <span className="llm-matrix-col-desc">{row.description}</span>
                <span className="llm-matrix-col-model">
                  <span className="llm-model-chip llm-model-active">{row.assigned}</span>
                </span>
                <span className="llm-matrix-col-provider">{row.provider}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'usage' && (
        <React.Fragment>
          <div className="stats-grid">
            <StatCard label="Total Tokens" value="539K" sub="Last 30 days" icon="proposals" color="var(--qaap-primary)"></StatCard>
            <StatCard label="Total Cost" value="$24.30" sub="Last 30 days" icon="reports" color="var(--qaap-warning)"></StatCard>
            <StatCard label="Top Provider" value="Anthropic" sub="53% of tokens" icon="check" color="#D97706"></StatCard>
            <StatCard label="Avg Cost/Plan" value="$4.05" sub="Per generation" icon="testPlans" color="var(--qaap-success)"></StatCard>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Token Usage by Provider</h3>
              <span style={{ fontSize:11, color:'var(--qaap-text-tertiary)' }}>Last 6 months (thousands)</span>
            </div>
            <div style={{ padding:18 }}>
              <UsageChart data={usageData}></UsageChart>
            </div>
          </div>

          <div className="card" style={{ marginTop:12 }}>
            <div className="card-header">
              <h3 className="card-title">Cost Breakdown</h3>
            </div>
            <div style={{ padding:0 }}>
              {providers.filter(p => p.status === 'connected').map(p => (
                <div key={p.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 18px', borderBottom:'1px solid var(--qaap-border-light)' }}>
                  <div className="llm-provider-logo" style={{ background:p.color + '18', color:p.color, width:28, height:28, fontSize:12 }}>
                    <span style={{ fontWeight:800, fontFamily:'var(--qaap-font-heading)' }}>{p.logo}</span>
                  </div>
                  <span style={{ flex:1, fontSize:13, fontWeight:500 }}>{p.name}</span>
                  <span style={{ fontSize:12, color:'var(--qaap-text-tertiary)', fontFamily:'var(--qaap-font-mono)' }}>{(p.tokensUsed/1000).toFixed(0)}K tokens</span>
                  <div style={{ width:120, height:6, borderRadius:3, background:'var(--qaap-border-light)', overflow:'hidden' }}>
                    <div style={{ width:`${(p.tokensUsed/284500)*100}%`, height:'100%', background:p.color, borderRadius:3 }}></div>
                  </div>
                  <span style={{ fontSize:13, fontWeight:600, fontFamily:'var(--qaap-font-mono)', minWidth:50, textAlign:'right' }}>{p.cost}</span>
                </div>
              ))}
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

// ─── Usage Chart (stacked bar) ───
function UsageChart({ data }) {
  const w = 500, h = 140, px = 40, py = 10;
  const iw = w - px - 10, ih = h - py - 24;
  const max = Math.max(...data.map(d => d.anthropic + d.openai + d.google));
  const barW = Math.min(40, (iw / data.length) - 8);

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display:'block' }}>
      {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
        const y = py + ih * (1 - pct);
        return (
          <g key={i}>
            <line x1={px} y1={y} x2={w - 10} y2={y} stroke="var(--qaap-border-light)" strokeWidth="1"></line>
            <text x={px - 4} y={y + 3} textAnchor="end" fontSize="9" fill="var(--qaap-text-tertiary)">{Math.round(max * pct / 1000)}K</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const x = px + (i / (data.length - 0.5)) * iw + 10;
        const hAnth = (d.anthropic / max) * ih;
        const hOai = (d.openai / max) * ih;
        const hGoog = (d.google / max) * ih;
        return (
          <g key={i}>
            <rect x={x} y={py + ih - hAnth - hOai - hGoog} width={barW} height={hGoog} rx={2} fill="#4285F4" opacity={0.8}></rect>
            <rect x={x} y={py + ih - hAnth - hOai} width={barW} height={hOai} rx={0} fill="#10A37F" opacity={0.8}></rect>
            <rect x={x} y={py + ih - hAnth} width={barW} height={hAnth} rx={0} fill="#D97706" opacity={0.8}></rect>
            <text x={x + barW/2} y={h - 4} textAnchor="middle" fontSize="9" fill="var(--qaap-text-tertiary)">{d.month}</text>
          </g>
        );
      })}
      {/* Legend */}
      <circle cx={px + 10} cy={h - 2} r={3} fill="#D97706"></circle>
      <text x={px + 16} y={h + 1} fontSize="8" fill="var(--qaap-text-tertiary)">Anthropic</text>
      <circle cx={px + 70} cy={h - 2} r={3} fill="#10A37F"></circle>
      <text x={px + 76} y={h + 1} fontSize="8" fill="var(--qaap-text-tertiary)">OpenAI</text>
      <circle cx={px + 120} cy={h - 2} r={3} fill="#4285F4"></circle>
      <text x={px + 126} y={h + 1} fontSize="8" fill="var(--qaap-text-tertiary)">Google</text>
    </svg>
  );
}

window.LLMSettingsScreen = LLMSettingsScreen;
window.UsageChart = UsageChart;
