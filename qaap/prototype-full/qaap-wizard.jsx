// QAAP New Test Plan Wizard — 5-step flow
function NewPlanWizard({ onClose, onCreated }) {
  const [step, setStep] = React.useState(1);
  const [fadeIn, setFadeIn] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  React.useEffect(() => { setTimeout(() => setFadeIn(true), 50); }, []);

  // Form state
  const [planName, setPlanName] = React.useState('');
  const [planDesc, setPlanDesc] = React.useState('');
  const [modality, setModality] = React.useState(null);
  const [framework, setFramework] = React.useState(null);
  const [sources, setSources] = React.useState([]);
  const [primaryModel, setPrimaryModel] = React.useState('claude-sonnet-4');
  const [reviewModel, setReviewModel] = React.useState(null);
  const [secondOpinion, setSecondOpinion] = React.useState(false);
  const [environments, setEnvironments] = React.useState([
    { name:'PRO', url:'https://techmart.com' },
    { name:'PRE', url:'https://pre.techmart.com' },
    { name:'DEV', url:'https://dev.techmart.com' },
  ]);

  const totalSteps = 5;
  const stepLabels = ['Basics', 'Sources', 'LLM Config', 'Environments', 'Review'];

  const canProceed = () => {
    if (step === 1) return planName.trim() && modality && framework;
    if (step === 2) return sources.length > 0;
    return true;
  };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      onCreated && onCreated();
    }, 2500);
  };

  const modalityOptions = [
    { id:'web', label:'Web', desc:'React, Angular, Vue...', icon:'browser', color:'#217BEE', frameworks:['Playwright','Cypress','Selenium'] },
    { id:'api', label:'API', desc:'REST, GraphQL, gRPC...', icon:'api', color:'#8B5CF6', frameworks:['Karate','Postman','RestAssured'] },
    { id:'ios', label:'iOS', desc:'Swift, SwiftUI...', icon:'phone', color:'#EC683E', frameworks:['XCTest (coming soon)'] },
  ];

  const sourceTypes = [
    { id:'jira', label:'Jira Tickets', desc:'Import user stories & acceptance criteria', icon:'jira', color:'#217BEE' },
    { id:'github', label:'Code Repository', desc:'Connect to source code for context', icon:'git', color:'var(--qaap-text)' },
    { id:'openapi', label:'OpenAPI Spec', desc:'API definitions & endpoints', icon:'api', color:'#8B5CF6' },
    { id:'docs', label:'Documents', desc:'Upload specs, PRDs, or design docs', icon:'doc', color:'var(--qaap-warning)' },
    { id:'drive', label:'Google Drive', desc:'Shared team documentation', icon:'doc', color:'var(--qaap-success)' },
    { id:'text', label:'Free Text', desc:'Paste requirements or context directly', icon:'text', color:'var(--qaap-text-tertiary)' },
  ];

  const llmModels = [
    { id:'claude-sonnet-4', name:'Claude Sonnet 4', provider:'Anthropic', badge:'Recommended', badgeColor:'var(--qaap-primary)' },
    { id:'gpt-4o', name:'GPT-4o', provider:'OpenAI', badge:null },
    { id:'gemini-2.5-pro', name:'Gemini 2.5 Pro', provider:'Google', badge:null },
    { id:'codex-mini', name:'Codex Mini', provider:'OpenAI', badge:'Fast', badgeColor:'var(--qaap-success)' },
    { id:'ollama-local', name:'Llama 3 (Local)', provider:'Ollama', badge:'On-premise', badgeColor:'var(--qaap-text-tertiary)' },
  ];

  const toggleSource = (id) => {
    setSources(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  return (
    <div className={`wizard-overlay ${fadeIn ? 'wizard-visible' : ''}`}>
      <div className="wizard-panel">
        {/* Header */}
        <div className="wizard-header">
          <div className="wizard-header-left">
            <NfqMark size={24}></NfqMark>
            <h2 className="wizard-title">New Test Plan</h2>
          </div>
          <button className="topbar-btn" onClick={onClose}><QIcon name="x" size={20}></QIcon></button>
        </div>

        {/* Progress */}
        <div className="wizard-progress">
          {stepLabels.map((label, i) => (
            <div key={i} className={`wizard-step-indicator ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}>
              <div className="wizard-step-dot">
                {step > i + 1 ? <QIcon name="check" size={12}></QIcon> : <span>{i + 1}</span>}
              </div>
              <span className="wizard-step-label">{label}</span>
              {i < stepLabels.length - 1 && <div className="wizard-step-line"></div>}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="wizard-body">
          {/* Step 1: Basics */}
          {step === 1 && (
            <div className="wizard-step-content">
              <h3 className="wizard-step-title">Plan Basics</h3>
              <p className="wizard-step-desc">Give your test plan a name, choose the modality and testing framework.</p>

              <div className="wizard-form">
                <div className="form-field">
                  <label>Plan Name</label>
                  <input value={planName} onChange={e => setPlanName(e.target.value)}
                    placeholder="e.g. Checkout Flow E2E" autoFocus></input>
                </div>
                <div className="form-field">
                  <label>Description (optional)</label>
                  <textarea value={planDesc} onChange={e => setPlanDesc(e.target.value)}
                    placeholder="Brief description of what this plan covers..." rows={2}
                    style={{ padding:'9px 12px', border:'1px solid var(--qaap-border)', borderRadius:'var(--qaap-radius-sm)', fontSize:14, fontFamily:'inherit', resize:'vertical', outline:'none' }}></textarea>
                </div>

                <div className="form-field">
                  <label>Modality</label>
                  <div className="wizard-card-grid">
                    {modalityOptions.map(m => (
                      <button key={m.id} className={`wizard-modality-card ${modality === m.id ? 'selected' : ''}`}
                        onClick={() => { setModality(m.id); setFramework(null); }}
                        style={{ '--card-color': m.color }}>
                        <QIcon name={m.icon} size={24} color={modality === m.id ? 'white' : m.color}></QIcon>
                        <div className="wizard-mc-label">{m.label}</div>
                        <div className="wizard-mc-desc">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {modality && (
                  <div className="form-field">
                    <label>Framework</label>
                    <div style={{ display:'flex', gap:8 }}>
                      {modalityOptions.find(m => m.id === modality)?.frameworks.map(f => (
                        <button key={f} className={`btn-tab ${framework === f ? 'btn-tab-active' : ''}`}
                          onClick={() => setFramework(f)}>{f}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Context Sources */}
          {step === 2 && (
            <div className="wizard-step-content">
              <h3 className="wizard-step-title">Context Sources</h3>
              <p className="wizard-step-desc">Connect data sources to give the AI the best possible context for generating tests. The more context, the better the results.</p>

              <div className="wizard-sources-grid">
                {sourceTypes.map(src => {
                  const isSelected = sources.includes(src.id);
                  return (
                    <button key={src.id} className={`wizard-source-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleSource(src.id)}>
                      <div className="wizard-src-icon" style={{ background: src.color + '14', color: src.color }}>
                        <QIcon name={src.icon} size={20} color={src.color}></QIcon>
                      </div>
                      <div className="wizard-src-info">
                        <div className="wizard-src-label">{src.label}</div>
                        <div className="wizard-src-desc">{src.desc}</div>
                      </div>
                      <div className={`wizard-src-check ${isSelected ? 'checked' : ''}`}>
                        {isSelected && <QIcon name="check" size={12} color="white"></QIcon>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {sources.length > 0 && (
                <div className="wizard-sources-selected">
                  <span style={{ fontSize:12, color:'var(--qaap-text-tertiary)' }}>Selected: </span>
                  {sources.map(s => {
                    const src = sourceTypes.find(st => st.id === s);
                    return <span key={s} className="ai-chip">
                      <QIcon name={src.icon} size={12}></QIcon> {src.label}
                      <button onClick={(e) => { e.stopPropagation(); toggleSource(s); }} style={{ marginLeft:2, opacity:0.5 }}>×</button>
                    </span>;
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 3: LLM Config */}
          {step === 3 && (
            <div className="wizard-step-content">
              <h3 className="wizard-step-title">LLM Configuration</h3>
              <p className="wizard-step-desc">Select the AI model for test generation. Enable "Second Opinion" to have another model review the results.</p>

              <div className="form-field">
                <label>Primary Model</label>
                <div className="wizard-models-grid">
                  {llmModels.map(m => (
                    <button key={m.id} className={`wizard-model-card ${primaryModel === m.id ? 'selected' : ''}`}
                      onClick={() => setPrimaryModel(m.id)}>
                      <div className="wizard-model-info">
                        <div className="wizard-model-name">{m.name}</div>
                        <div className="wizard-model-provider">{m.provider}</div>
                      </div>
                      {m.badge && <span className="wizard-model-badge" style={{ color:m.badgeColor, background:m.badgeColor + '18' }}>{m.badge}</span>}
                      <div className={`wizard-src-check ${primaryModel === m.id ? 'checked' : ''}`}>
                        {primaryModel === m.id && <QIcon name="check" size={12} color="white"></QIcon>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="wizard-second-opinion">
                <div className="wizard-so-toggle">
                  <div className="wizard-so-info">
                    <div style={{ fontWeight:600, fontSize:13 }}>Enable Second Opinion</div>
                    <div style={{ fontSize:12, color:'var(--qaap-text-tertiary)' }}>Have a different model review and iterate on the generated plan</div>
                  </div>
                  <div className={`delivery-toggle ${secondOpinion ? 'active' : ''}`} onClick={() => setSecondOpinion(!secondOpinion)}>
                    <div className="delivery-toggle-knob"></div>
                  </div>
                </div>
                {secondOpinion && (
                  <div style={{ marginTop:12 }}>
                    <label style={{ fontSize:12, fontWeight:600, color:'var(--qaap-text-secondary)', marginBottom:4, display:'block' }}>Review Model</label>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      {llmModels.filter(m => m.id !== primaryModel).map(m => (
                        <button key={m.id} className={`btn-tab ${reviewModel === m.id ? 'btn-tab-active' : ''}`}
                          onClick={() => setReviewModel(m.id)}>{m.name}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Environments */}
          {step === 4 && (
            <div className="wizard-step-content">
              <h3 className="wizard-step-title">Environments</h3>
              <p className="wizard-step-desc">Configure the target environments where tests will be executed.</p>

              <div className="wizard-env-list">
                {environments.map((env, i) => (
                  <div key={i} className="wizard-env-row">
                    <input className="wizard-env-name" value={env.name}
                      onChange={e => { const newEnvs = [...environments]; newEnvs[i].name = e.target.value; setEnvironments(newEnvs); }}></input>
                    <input className="wizard-env-url" value={env.url} placeholder="https://..."
                      onChange={e => { const newEnvs = [...environments]; newEnvs[i].url = e.target.value; setEnvironments(newEnvs); }}></input>
                    <button className="btn-ghost" onClick={() => setEnvironments(environments.filter((_, j) => j !== i))} style={{ color:'var(--qaap-error)' }}>
                      <QIcon name="x" size={16}></QIcon>
                    </button>
                  </div>
                ))}
              </div>
              <button className="btn-ghost" style={{ marginTop:8 }} onClick={() => setEnvironments([...environments, { name:'', url:'' }])}>
                <QIcon name="plus" size={14}></QIcon> Add Environment
              </button>
            </div>
          )}

          {/* Step 5: Review & Generate */}
          {step === 5 && (
            <div className="wizard-step-content">
              <h3 className="wizard-step-title">Review & Generate</h3>
              <p className="wizard-step-desc">Review your configuration and generate the test plan.</p>

              <div className="wizard-review">
                <div className="wizard-review-section">
                  <div className="wizard-review-label">Plan</div>
                  <div className="wizard-review-value">
                    <strong>{planName}</strong>
                    {planDesc && <span style={{ color:'var(--qaap-text-tertiary)', marginLeft:8 }}>— {planDesc}</span>}
                  </div>
                </div>
                <div className="wizard-review-section">
                  <div className="wizard-review-label">Modality</div>
                  <div className="wizard-review-value">
                    <ModalityBadge modality={modality}></ModalityBadge>
                    <span style={{ marginLeft:8 }}>{framework}</span>
                  </div>
                </div>
                <div className="wizard-review-section">
                  <div className="wizard-review-label">Sources</div>
                  <div className="wizard-review-value" style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {sources.map(s => {
                      const src = sourceTypes.find(st => st.id === s);
                      return <span key={s} className="ai-chip"><QIcon name={src.icon} size={12}></QIcon> {src.label}</span>;
                    })}
                  </div>
                </div>
                <div className="wizard-review-section">
                  <div className="wizard-review-label">Primary Model</div>
                  <div className="wizard-review-value">{llmModels.find(m => m.id === primaryModel)?.name}</div>
                </div>
                {secondOpinion && reviewModel && (
                  <div className="wizard-review-section">
                    <div className="wizard-review-label">Review Model</div>
                    <div className="wizard-review-value">{llmModels.find(m => m.id === reviewModel)?.name}</div>
                  </div>
                )}
                <div className="wizard-review-section">
                  <div className="wizard-review-label">Environments</div>
                  <div className="wizard-review-value">
                    {environments.filter(e => e.name).map((e, i) => (
                      <span key={i} className="exec-tl-env" style={{ marginRight:6 }}>{e.name}</span>
                    ))}
                  </div>
                </div>
              </div>

              {generating && (
                <div className="wizard-generating">
                  <div className="wizard-gen-spinner"></div>
                  <div className="wizard-gen-text">
                    <div style={{ fontWeight:600, fontSize:14 }}>Generating Test Plan...</div>
                    <div style={{ fontSize:12, color:'var(--qaap-text-tertiary)' }}>Analyzing sources and creating scenarios with {llmModels.find(m => m.id === primaryModel)?.name}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="wizard-footer">
          <button className="btn-outline" onClick={step === 1 ? onClose : () => setStep(step - 1)}>
            {step === 1 ? 'Cancel' : '← Back'}
          </button>
          <div style={{ display:'flex', gap:8 }}>
            {step < totalSteps ? (
              <button className="btn-primary" onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                Continue →
              </button>
            ) : (
              <button className="btn-primary" onClick={handleGenerate} disabled={generating} style={{ minWidth:180 }}>
                {generating ? <span className="login-spinner"></span> : (
                  <React.Fragment><QIcon name="proposals" size={16}></QIcon> Generate Test Plan</React.Fragment>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

window.NewPlanWizard = NewPlanWizard;
