// QAAP Test Plan Detail — 3 layout variations
const { useState, useEffect, useRef, useMemo, useCallback, memo } = React;

// ─── Gherkin Syntax Highlighter ───
function GherkinLine({ text }) {
  if (!text.trim()) return <div className="gherkin-line">&nbsp;</div>;
  // Keywords
  const kwMatch = text.match(/^(\s*)(Feature|Scenario|Background|Scenario Outline|Examples|Rule)(:.*)/);
  if (kwMatch) return <div className="gherkin-line"><span className="gherkin-indent">{kwMatch[1]}</span><span className="gherkin-keyword">{kwMatch[2]}</span><span className="gherkin-feature-text">{kwMatch[3]}</span></div>;
  const stepMatch = text.match(/^(\s*)(Given|When|Then|And|But)\b(.*)/);
  if (stepMatch) {
    let rest = stepMatch[3];
    // Highlight strings in quotes
    const parts = [];
    let remaining = rest;
    const strReg = /"([^"]*)"/g;
    let m, lastIdx = 0;
    while ((m = strReg.exec(rest)) !== null) {
      if (m.index > lastIdx) parts.push(<span key={lastIdx} className="gherkin-text">{rest.substring(lastIdx, m.index)}</span>);
      parts.push(<span key={m.index} className="gherkin-string">"{m[1]}"</span>);
      lastIdx = m.index + m[0].length;
    }
    if (lastIdx < rest.length) parts.push(<span key={lastIdx} className="gherkin-text">{rest.substring(lastIdx)}</span>);
    return <div className="gherkin-line"><span className="gherkin-indent">{stepMatch[1]}</span><span className="gherkin-step">{stepMatch[2]}</span>{parts}</div>;
  }
  const tagMatch = text.match(/^(\s*)(@\S+.*)/);
  if (tagMatch) return <div className="gherkin-line"><span className="gherkin-indent">{tagMatch[1]}</span><span className="gherkin-tag">{tagMatch[2]}</span></div>;
  const commentMatch = text.match(/^(\s*)(#.*)/);
  if (commentMatch) return <div className="gherkin-line"><span className="gherkin-indent">{commentMatch[1]}</span><span className="gherkin-comment">{commentMatch[2]}</span></div>;
  return <div className="gherkin-line"><span className="gherkin-text">{text}</span></div>;
}

function GherkinEditor({ content }) {
  const lines = content.split('\n');
  return (
    <div className="gherkin-editor">
      <div className="gherkin-lines">
        {lines.map((line, i) => (
          <div key={i} className="gherkin-row">
            <span className="gherkin-ln">{i + 1}</span>
            <GherkinLine text={line}></GherkinLine>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Code Viewer ───
function CodeViewer({ content }) {
  const lines = content.split('\n');
  return (
    <div className="code-viewer">
      <div className="code-lines">
        {lines.map((line, i) => (
          <div key={i} className="code-row">
            <span className="code-ln">{i + 1}</span>
            <span className="code-text">{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Chat Panel ───
function ChatPanel({ messages, compact }) {
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState(messages);
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView?.({ block: 'end' }); }, [msgs, typing]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = { role: 'user', content: input };
    setMsgs(prev => [...prev, newMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(prev => [...prev, {
        role: 'assistant',
        content: 'I\'ve analyzed that request. Let me review the current test scenarios and suggest changes. I\'ll update the affected scenarios and recalculate confidence scores.',
        model: 'Claude Sonnet 4'
      }]);
    }, 1500);
  };

  return (
    <div className={`chat-panel ${compact ? 'chat-compact' : ''}`}>
      <div className="chat-header">
        <QIcon name="chat" size={16}></QIcon>
        <span>AI Assistant</span>
        <span className="chat-model-tag">Claude Sonnet 4</span>
      </div>
      <div className="chat-messages">
        {msgs.map((msg, i) => (
          <div key={i} className={`chat-msg chat-msg-${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="chat-msg-meta">
                <NfqMark size={16}></NfqMark>
                <span>{msg.model || 'QAAP AI'}</span>
              </div>
            )}
            {msg.role === 'system' ? (
              <div className="chat-msg-system">{msg.content}</div>
            ) : (
              <div className="chat-msg-bubble">{msg.content}</div>
            )}
          </div>
        ))}
        {typing && (
          <div className="chat-msg chat-msg-assistant">
            <div className="chat-msg-meta"><NfqMark size={16}></NfqMark><span>Claude Sonnet 4</span></div>
            <div className="chat-msg-bubble chat-typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      <div className="chat-input-wrap">
        <input className="chat-input" value={input} onChange={e => setInput(e.target.value)}
          placeholder="Ask about this plan…" onKeyDown={e => e.key === 'Enter' && sendMessage()}></input>
        <button className="chat-send" onClick={sendMessage} disabled={!input.trim()}>
          <QIcon name="send" size={16}></QIcon>
        </button>
      </div>
    </div>
  );
}

// ─── Scenario Sidebar ───
function ScenarioSidebar({ scenarios, selectedId, onSelect, compact }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? scenarios : scenarios.filter(s => s.status === filter);
  const counts = { all: scenarios.length, approved: scenarios.filter(s=>s.status==='approved').length, pending: scenarios.filter(s=>s.status==='pending').length, rejected: scenarios.filter(s=>s.status==='rejected').length };

  return (
    <div className={`scenario-sidebar ${compact ? 'scenario-compact' : ''}`}>
      <div className="scenario-header">
        <span className="scenario-title">Scenarios</span>
        <span className="scenario-count">{scenarios.length}</span>
      </div>
      <div className="scenario-filters">
        {['all','approved','pending','rejected'].map(f => (
          <button key={f} className={`scenario-filter ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>
      <div className="scenario-list">
        {filtered.map(s => (
          <div key={s.id} className={`scenario-item ${selectedId === s.id ? 'selected' : ''}`} onClick={() => onSelect(s.id)}>
            <ConfidenceDot value={s.confidence}></ConfidenceDot>
            <div className="scenario-item-info">
              <span className="scenario-item-name">{s.name}</span>
              <span className="scenario-item-meta">{s.feature} · {s.confidence}%</span>
            </div>
            <div className={`scenario-status-icon scenario-status-${s.status}`}>
              <QIcon name={s.status === 'approved' ? 'check' : s.status === 'rejected' ? 'x' : 'clock'} size={12}></QIcon>
            </div>
          </div>
        ))}
      </div>
      <button className="scenario-add-btn">
        <QIcon name="plus" size={14}></QIcon> Add Scenario
      </button>
    </div>
  );
}

// ─── Confidence Footer Bar ───
function ConfidenceBar({ scenarios }) {
  const total = scenarios.length;
  const green = scenarios.filter(s => s.confidence >= 85).length;
  const amber = scenarios.filter(s => s.confidence >= 60 && s.confidence < 85).length;
  const red = scenarios.filter(s => s.confidence < 60).length;
  return (
    <div className="confidence-bar">
      <div className="confidence-segments">
        <div className="conf-seg conf-green" style={{ width: `${(green/total)*100}%` }}></div>
        <div className="conf-seg conf-amber" style={{ width: `${(amber/total)*100}%` }}></div>
        <div className="conf-seg conf-red" style={{ width: `${(red/total)*100}%` }}></div>
      </div>
      <div className="confidence-labels">
        <span><span className="conf-dot" style={{background:'var(--qaap-success)'}}></span>{green} high ({Math.round(green/total*100)}%)</span>
        <span><span className="conf-dot" style={{background:'var(--qaap-warning)'}}></span>{amber} medium ({Math.round(amber/total*100)}%)</span>
        <span><span className="conf-dot" style={{background:'var(--qaap-error)'}}></span>{red} low ({Math.round(red/total*100)}%)</span>
        <span style={{ marginLeft:'auto', fontWeight:600 }}>Avg: {Math.round(scenarios.reduce((s,sc)=>s+sc.confidence,0)/total)}%</span>
      </div>
    </div>
  );
}

// ─── Execution Mini Table ───
function ExecutionTab() {
  const execs = QAAP_DATA.executions;
  return (
    <div className="execution-tab">
      {execs.map(ex => (
        <div key={ex.id} className="exec-tab-row">
          <StatusBadge status={ex.status} small></StatusBadge>
          <span className="exec-env-badge">{ex.env}</span>
          <span className="exec-tab-date">{ex.date}</span>
          <div className="exec-tab-bar">
            <div className="exec-bar-fill exec-bar-pass" style={{ width:`${ex.passRate}%` }}></div>
          </div>
          <span style={{ fontSize:12, fontWeight:600, minWidth:36 }}>{ex.passRate}%</span>
          <span className="exec-tab-meta">{ex.passed}✓ {ex.failed}✗ · {ex.duration}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MAIN: Plan Detail Screen with 3 variants
// ═══════════════════════════════════════════════════
function PlanDetailScreen({ plan, onBack, variant = 'clean', onVariantChange }) {
  const [selectedScenario, setSelectedScenario] = useState('s-001');
  const [activeTab, setActiveTab] = useState('gherkin');
  const [chatOpen, setChatOpen] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const [splitView, setSplitView] = useState(false);
  const [expandedScenario, setExpandedScenario] = useState(null);
  const d = QAAP_DATA;

  useEffect(() => { const t = setTimeout(() => setFadeIn(true), 50); return () => clearTimeout(t); }, []);

  const tabs = [
    { id: 'gherkin', label: 'Gherkin' },
    { id: 'code', label: 'Generated Code' },
    { id: 'execution', label: 'Executions' },
  ];

  const variantLabels = { clean: 'Standard', ide: 'IDE', 'ai-first': 'AI-First' };

  // ─── Common Header (shared across variants) ───
  const renderHeader = () => (
    <div className="plan-detail-header">
      <div className="plan-detail-title-row">
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <ModalityBadge modality={plan.modality}></ModalityBadge>
          <h2 className="plan-detail-name">{plan.name}</h2>
          <StatusBadge status={plan.status}></StatusBadge>
          <span className="plan-provenance">Generated by Claude Sonnet 4</span>
        </div>
        <div className="plan-detail-actions">
          {onVariantChange && (
            <div style={{ display:'flex', gap:2, background:'var(--qaap-bg)', borderRadius:'var(--qaap-radius-sm)', padding:2 }}>
              {['clean','ide','ai-first'].map(v => (
                <button key={v} className={`btn-tab-sm ${variant === v ? 'btn-tab-active' : ''}`}
                  onClick={() => onVariantChange(v)} style={{ fontSize:11 }}>{variantLabels[v]}</button>
              ))}
            </div>
          )}
          {variant === 'clean' && (
            <button className="btn-outline" onClick={() => setChatOpen(!chatOpen)}>
              <QIcon name="chat" size={16}></QIcon> {chatOpen ? 'Hide Chat' : 'Chat'}
            </button>
          )}
          <button className="btn-outline"><QIcon name="export" size={16}></QIcon> Export</button>
          <button className="btn-primary"><QIcon name="run" size={16}></QIcon> Run</button>
        </div>
      </div>
    </div>
  );

  // ─── Variant A: Clean (Vercel-inspired) ───
  if (variant === 'clean') {
    return (
      <div className={`plan-detail plan-clean ${fadeIn ? 'screen-visible' : ''}`}>
        {renderHeader()}
        <div className="plan-body-clean">
          <ScenarioSidebar scenarios={d.scenarios} selectedId={selectedScenario} onSelect={setSelectedScenario}></ScenarioSidebar>
          <div className="plan-editor">
            <div className="editor-tabs">
              {tabs.map(t => (
                <button key={t.id} className={`editor-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
              ))}
            </div>
            <div className="editor-content">
              {activeTab === 'gherkin' && <GherkinEditor content={d.gherkinContent}></GherkinEditor>}
              {activeTab === 'code' && <CodeViewer content={d.generatedCode}></CodeViewer>}
              {activeTab === 'execution' && <ExecutionTab></ExecutionTab>}
            </div>
          </div>
          {chatOpen && <ChatPanel messages={d.chatMessages}></ChatPanel>}
        </div>
        <ConfidenceBar scenarios={d.scenarios}></ConfidenceBar>
      </div>
    );
  }

  // ─── Variant B: IDE (Cursor-inspired) ───
  if (variant === 'ide') {
    return (
      <div className={`plan-detail plan-ide ${fadeIn ? 'screen-visible' : ''}`}>
        {renderHeader()}
        <div className="plan-body-ide">
          <ScenarioSidebar scenarios={d.scenarios} selectedId={selectedScenario} onSelect={setSelectedScenario} compact></ScenarioSidebar>
          <div className="plan-ide-main">
            <div className="plan-ide-editors" style={splitView ? { display:'grid', gridTemplateColumns:'1fr 1fr', gap:1 } : {}}>
              <div className="plan-editor">
                <div className="editor-tabs editor-tabs-dense">
                  {tabs.map(t => (
                    <button key={t.id} className={`editor-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
                  ))}
                </div>
                <div className="editor-content">
                  {activeTab === 'gherkin' && <GherkinEditor content={d.gherkinContent}></GherkinEditor>}
                  {activeTab === 'code' && <CodeViewer content={d.generatedCode}></CodeViewer>}
                  {activeTab === 'execution' && <ExecutionTab></ExecutionTab>}
                </div>
              </div>
              {splitView && (
                <div className="plan-editor">
                  <div className="editor-tabs editor-tabs-dense">
                    <button className="editor-tab active">Generated Code</button>
                  </div>
                  <div className="editor-content">
                    <CodeViewer content={d.generatedCode}></CodeViewer>
                  </div>
                </div>
              )}
            </div>
            {/* Chat as bottom panel like terminal */}
            <div className="plan-ide-bottom">
              <ChatPanel messages={d.chatMessages} compact></ChatPanel>
            </div>
          </div>
        </div>
        <ConfidenceBar scenarios={d.scenarios}></ConfidenceBar>
      </div>
    );
  }

  // ─── Variant C: AI-First (NotebookLM-inspired) ───
  if (variant === 'ai-first') {
    return (
      <div className={`plan-detail plan-ai-first ${fadeIn ? 'screen-visible' : ''}`}>
        {renderHeader()}
        <div className="plan-body-ai">
          {/* Main: Conversation + inline scenario cards */}
          <div className="plan-ai-main">
            <div className="plan-ai-context">
              <div className="ai-context-label">
                <QIcon name="proposals" size={16}></QIcon>
                <span>Plan Context</span>
              </div>
              <div className="ai-context-chips">
                <span className="ai-chip"><QIcon name="jira" size={12}></QIcon> Jira TM-Sprint-47</span>
                <span className="ai-chip"><QIcon name="git" size={12}></QIcon> techmart/web-frontend</span>
                <span className="ai-chip"><QIcon name="doc" size={12}></QIcon> OpenAPI Spec v3.1</span>
              </div>
            </div>
            <div className="plan-ai-chat-full">
              <div className="chat-messages" style={{ padding:'16px 0' }}>
                {d.chatMessages.map((msg, i) => (
                  <div key={i} className={`chat-msg chat-msg-${msg.role}`}>
                    {msg.role === 'assistant' && (
                      <div className="chat-msg-meta"><NfqMark size={16}></NfqMark><span>{msg.model}</span></div>
                    )}
                    {msg.role === 'system' ? (
                      <div className="chat-msg-system">{msg.content}</div>
                    ) : (
                      <div className="chat-msg-bubble">{msg.content}</div>
                    )}
                  </div>
                ))}
              </div>
              {/* Inline scenario cards */}
              <div className="ai-scenario-cards">
                <div className="ai-scenarios-header">
                  <span style={{ fontWeight:600, fontSize:13 }}>Test Scenarios</span>
                  <span style={{ fontSize:12, color:'var(--qaap-text-tertiary)' }}>{d.scenarios.length} scenarios</span>
                </div>
                {d.scenarios.slice(0, 8).map(s => (
                  <div key={s.id} className={`ai-scenario-card ${expandedScenario === s.id ? 'expanded' : ''}`}
                    onClick={() => setExpandedScenario(expandedScenario === s.id ? null : s.id)}>
                    <div className="ai-sc-top">
                      <ConfidenceDot value={s.confidence}></ConfidenceDot>
                      <span className="ai-sc-name">{s.name}</span>
                      <StatusBadge status={s.status} small></StatusBadge>
                      <span className="ai-sc-conf">{s.confidence}%</span>
                      <QIcon name={expandedScenario === s.id ? 'chevronDown' : 'chevronRight'} size={14}></QIcon>
                    </div>
                    {expandedScenario === s.id && (
                      <div className="ai-sc-expanded">
                        <div className="ai-sc-tabs">
                          <button className="editor-tab active" style={{ fontSize:11 }}>Gherkin</button>
                          <button className="editor-tab" style={{ fontSize:11 }}>Code</button>
                        </div>
                        <div className="ai-sc-code">
                          <GherkinEditor content={d.gherkinContent.split('\n').slice(0, 18).join('\n')}></GherkinEditor>
                        </div>
                        <div className="ai-sc-actions">
                          <button className="btn-sm btn-success"><QIcon name="check" size={12}></QIcon> Approve</button>
                          <button className="btn-sm btn-outline">Edit</button>
                          <button className="btn-sm btn-ghost" style={{ color:'var(--qaap-error)' }}><QIcon name="x" size={12}></QIcon> Reject</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="chat-input-wrap" style={{ margin:'16px 0 0' }}>
                <input className="chat-input" placeholder="Ask QAAP AI to modify, explain, or generate scenarios…"></input>
                <button className="chat-send"><QIcon name="send" size={16}></QIcon></button>
              </div>
            </div>
          </div>
          {/* Right: Plan overview & stats */}
          <div className="plan-ai-sidebar">
            <div className="ai-sidebar-section">
              <h4>Plan Overview</h4>
              <div className="ai-sidebar-stat"><span>Scenarios</span><span>{d.scenarios.length}</span></div>
              <div className="ai-sidebar-stat"><span>Approved</span><span style={{color:'var(--qaap-success)'}}>{d.scenarios.filter(s=>s.status==='approved').length}</span></div>
              <div className="ai-sidebar-stat"><span>Pending</span><span style={{color:'var(--qaap-warning)'}}>{d.scenarios.filter(s=>s.status==='pending').length}</span></div>
              <div className="ai-sidebar-stat"><span>Rejected</span><span style={{color:'var(--qaap-error)'}}>{d.scenarios.filter(s=>s.status==='rejected').length}</span></div>
            </div>
            <div className="ai-sidebar-section">
              <h4>Confidence</h4>
              <ConfidenceBar scenarios={d.scenarios}></ConfidenceBar>
            </div>
            <div className="ai-sidebar-section">
              <h4>Sources</h4>
              <div className="ai-source-list">
                <div className="ai-source"><QIcon name="jira" size={14}></QIcon><span>Jira — TM-Sprint-47</span><span className="ai-source-status synced">Synced</span></div>
                <div className="ai-source"><QIcon name="git" size={14}></QIcon><span>GitHub — web-frontend</span><span className="ai-source-status synced">Synced</span></div>
                <div className="ai-source"><QIcon name="doc" size={14}></QIcon><span>OpenAPI Spec v3.1</span><span className="ai-source-status synced">Synced</span></div>
              </div>
            </div>
            <div className="ai-sidebar-section">
              <h4>Recent Executions</h4>
              {d.executions.slice(0,3).map(ex => (
                <div key={ex.id} className="ai-exec-mini">
                  <StatusBadge status={ex.status} small></StatusBadge>
                  <span>{ex.env}</span>
                  <span>{ex.passRate}%</span>
                  <span style={{color:'var(--qaap-text-tertiary)'}}>{ex.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

window.PlanDetailScreen = PlanDetailScreen;
window.GherkinEditor = GherkinEditor;
window.ChatPanel = ChatPanel;
window.ScenarioSidebar = ScenarioSidebar;
