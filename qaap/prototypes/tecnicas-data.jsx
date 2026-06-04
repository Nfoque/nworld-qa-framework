// QAAP Mock Data — Técnicas Reunidas Engineering QA
const QAAP_DATA = {
  user: { name: 'Miguel Fernández', email: 'mfernandez@tecnicasreunidas.es', role: 'QA Lead', initials: 'MF' },
  tenant: { name: 'Técnicas Reunidas', slug: 'tecnicas-reunidas', logo: 'assets/tecnicas-reunidas-logo.png' },

  testPlans: [
    { id:'tp-001', name:'Plant Design API (PDMS)', modality:'api', framework:'Karate', status:'approved', scenarioCount:30, passRate:97, lastUpdated:'1h ago', assignedTo:'Miguel Fernández', health:'healthy', trend:[95,94,96,95,97,96,98,97,97], market:'Global', vertical:'Engineering', platforms:['API'] },
    { id:'tp-002', name:'Procurement Portal E2E', modality:'web', framework:'Playwright', status:'approved', scenarioCount:22, passRate:93, lastUpdated:'2h ago', assignedTo:'Miguel Fernández', health:'healthy', trend:[92,91,93,92,95,94,96,93,93], market:'Global', vertical:'Procurement', platforms:['Desktop'] },
    { id:'tp-003', name:'Document Control System', modality:'web', framework:'Playwright', status:'review', scenarioCount:16, passRate:87, lastUpdated:'30m ago', assignedTo:'Ana Beltrán', health:'degrading', trend:[96,94,92,90,88,91,89,87,87], market:'Global', vertical:'Documents', platforms:['Desktop'] },
    { id:'tp-004', name:'Project Cost Control API', modality:'api', framework:'Karate', status:'approved', scenarioCount:28, passRate:99, lastUpdated:'4h ago', assignedTo:'Pablo Serrano', health:'healthy', trend:[98,99,99,98,99,99,100,99,99], market:'Global', vertical:'Finance', platforms:['API'] },
    { id:'tp-005', name:'HSE Incident Reporting', modality:'web', framework:'Cypress', status:'generating', scenarioCount:10, passRate:null, lastUpdated:'15m ago', assignedTo:'Ana Beltrán', health:null, trend:[], market:'Global', vertical:'HSE', platforms:['Desktop','Mobile'] },
    { id:'tp-006', name:'Piping Isometrics Validator', modality:'api', framework:'Karate', status:'draft', scenarioCount:8, passRate:null, lastUpdated:'2d ago', assignedTo:'Pablo Serrano', health:null, trend:[], market:'Global', vertical:'Engineering', platforms:['API'] },
    { id:'tp-007', name:'Supplier Qualification E2E', modality:'web', framework:'Playwright', status:'approved', scenarioCount:18, passRate:95, lastUpdated:'3h ago', assignedTo:'Miguel Fernández', health:'healthy', trend:[93,94,95,94,96,95,97,95,95], market:'Global', vertical:'Procurement', platforms:['Desktop'] },
    { id:'tp-008', name:'Material Tracking API', modality:'api', framework:'Karate', status:'review', scenarioCount:14, passRate:84, lastUpdated:'1d ago', assignedTo:'Ana Beltrán', health:'degrading', trend:[91,89,87,85,84,83,82,84,84], market:'Global', vertical:'Logistics', platforms:['API'] },
  ],

  scenarios: [
    { id:'s-001', name:'Create engineering change request', confidence:96, status:'approved', feature:'Engineering' },
    { id:'s-002', name:'Upload P&ID document revision', confidence:93, status:'approved', feature:'Documents' },
    { id:'s-003', name:'Piping stress analysis report', confidence:89, status:'approved', feature:'Engineering' },
    { id:'s-004', name:'HSE incident escalation flow', confidence:68, status:'pending', feature:'HSE' },
    { id:'s-005', name:'Submit purchase requisition', confidence:92, status:'approved', feature:'Procurement' },
    { id:'s-006', name:'Multi-discipline design review', confidence:86, status:'pending', feature:'Engineering' },
    { id:'s-007', name:'Budget vs actual cost tracking', confidence:95, status:'approved', feature:'Finance' },
    { id:'s-008', name:'Concurrent document check-out', confidence:47, status:'rejected', feature:'Documents' },
    { id:'s-009', name:'Material receipt inspection', confidence:74, status:'pending', feature:'Logistics' },
    { id:'s-010', name:'Supplier audit report generation', confidence:99, status:'approved', feature:'Procurement' },
  ],

  gherkinContent: `Feature: Plant Design Document Control
  As a project engineer
  I want to manage engineering documents with version control
  So that design changes are tracked and auditable

  @approved @confidence:96
  Scenario: Create engineering change request
    Given I am logged in as "mfernandez@tecnicasreunidas.es"
    And project "Al-Zour Refinery Phase 2" is active
    When I navigate to Engineering Change Management
    And I create a new change request for "Piping layout modification — Unit 300"
    Then the ECR should be assigned ID "ECR-2026-0147"
    And it should require approval from discipline leads`,

  generatedCode: `import { test, expect } from '@playwright/test';

test.describe('Document Control System', () => {
  test('create engineering change request', async ({ page }) => {
    await page.goto('/ecm/new');
    await page.fill('[data-testid="ecr-title"]', 'Piping layout modification — Unit 300');
    await page.click('[data-testid="submit-ecr"]');
    await expect(page.locator('[data-testid="ecr-id"]')).toHaveText(/ECR-2026-\\d+/);
  });
});`,

  chatMessages: [
    { role:'system', content:'Plan loaded: Plant Design API — 30 scenarios. Sources: Azure DevOps, GitHub (tr/pdms-platform), OpenAPI spec v3.0.' },
    { role:'user', content:'Add test for concurrent P&ID document editing' },
    { role:'assistant', content:'Added **Scenario 31: Concurrent P&ID document check-out conflict**. Confidence: 47% — Document locking mechanism is complex.', model:'Claude Sonnet 4' },
  ],

  executions: [
    { id:'ex-001', date:'Today 14:45', env:'PRE', status:'passed', passRate:93, duration:'6m 12s', trigger:'manual', passed:28, failed:2, skipped:0 },
    { id:'ex-002', date:'Today 08:00', env:'PRE', status:'failed', passRate:85, duration:'5m 48s', trigger:'cron', passed:26, failed:4, skipped:0 },
    { id:'ex-003', date:'Yesterday 22:00', env:'PRO', status:'passed', passRate:100, duration:'7m 05s', trigger:'cron', passed:30, failed:0, skipped:0 },
    { id:'ex-004', date:'Yesterday 15:30', env:'DEV', status:'passed', passRate:90, duration:'4m 30s', trigger:'webhook', passed:27, failed:3, skipped:0 },
    { id:'ex-005', date:'Jun 2 08:00', env:'PRE', status:'failed', passRate:80, duration:'6m 10s', trigger:'cron', passed:24, failed:6, skipped:0 },
  ],

  recentActivity: [
    { type:'execution', text:'Plant Design API passed on PRE', time:'2h ago', status:'success' },
    { type:'generation', text:'HSE Incident Reporting generating…', time:'15m ago', status:'info' },
    { type:'review', text:'Document Control System needs review', time:'30m ago', status:'warning' },
    { type:'approval', text:'Project Cost Control approved', time:'4h ago', status:'success' },
    { type:'alert', text:'Material Tracking pass rate below 85%', time:'1h ago', status:'error' },
    { type:'proposal', text:'AI suggested 3 new tests for PDMS', time:'5h ago', status:'info' },
  ],

  healthMetrics: { overallPassRate:92.5, totalExecutions:178, flakyTests:4, coverageScore:80 },
  healthPlans: [
    { name:'Plant Design API (PDMS)', health:'healthy', passRate:97, trend:[95,94,96,95,97,96,98,97,97], lastRun:'1h ago', scenarios:30 },
    { name:'Document Control System', health:'degrading', passRate:87, trend:[96,94,92,90,88,91,89,87,87], lastRun:'30m ago', scenarios:16 },
    { name:'Procurement Portal E2E', health:'healthy', passRate:93, trend:[92,91,93,92,95,94,96,93,93], lastRun:'2h ago', scenarios:22 },
    { name:'Project Cost Control API', health:'healthy', passRate:99, trend:[98,99,99,98,99,99,100,99,99], lastRun:'4h ago', scenarios:28 },
  ],
  flakyTests: [
    { name:'P&ID render in WebGL viewer', plan:'Plant Design API (PDMS)', flakeRate:26, lastFlake:'Today 08:00' },
    { name:'Document approval email delivery', plan:'Document Control System', flakeRate:20, lastFlake:'Yesterday' },
    { name:'Supplier portal session timeout', plan:'Supplier Qualification E2E', flakeRate:14, lastFlake:'Jun 2' },
    { name:'Cost report Excel export', plan:'Project Cost Control API', flakeRate:10, lastFlake:'Jun 1' },
  ],
  alerts: [
    { severity:'critical', message:'Document Control pass rate dropped to 87%', time:'1h ago', plan:'Document Control System' },
    { severity:'warning', message:'Flaky: P&ID render in WebGL (26%)', time:'3h ago', plan:'Plant Design API (PDMS)' },
    { severity:'info', message:'Procurement Portal recovered to healthy', time:'2h ago', plan:'Procurement Portal E2E' },
  ],
  executionDetails: [
    { id:'ex-001', date:'Today 14:45', env:'PRE', status:'passed', passRate:93, duration:'6m 12s', trigger:'manual', triggeredBy:'Miguel Fernández', branch:'main', passed:28, failed:2, skipped:0, results:[
      { scenario:'Create engineering change request', status:'passed', duration:'11.2s' },
      { scenario:'Upload P&ID document revision', status:'passed', duration:'8.9s' },
      { scenario:'HSE incident escalation flow', status:'failed', duration:'19.5s', error:'Escalation email not sent within 60s timeout', screenshot:'hse-escalation-fail.png', classification:'Timeout', rootCause:'SMTP relay was queuing messages due to rate limiting.' },
    ]},
    { id:'ex-002', date:'Today 08:00', env:'PRE', status:'failed', passRate:85, duration:'5m 48s', trigger:'cron', triggeredBy:'Scheduled', branch:'main', passed:26, failed:4, skipped:0, results:[] },
    { id:'ex-003', date:'Yesterday 22:00', env:'PRO', status:'passed', passRate:100, duration:'7m 05s', trigger:'cron', triggeredBy:'Scheduled', branch:'main', passed:30, failed:0, skipped:0, results:[] },
  ],
  aiProposals: [
    { id:'prop-001', type:'bug_detection', title:'Document lock not released on session timeout', description:'When a user session expires while editing a P&ID, the document remains locked indefinitely.', confidence:94, status:'proposed', source:'Detected from Execution #165', affectedFiles:['src/services/DocumentLockService.ts'], plan:'Document Control System', diff:null },
    { id:'prop-002', type:'coverage_gap', title:'No tests for multi-discipline review workflow', description:'The 4-discipline review (process, piping, electrical, civil) has zero E2E coverage.', confidence:82, status:'proposed', source:'Source analysis', affectedFiles:['src/workflows/ReviewWorkflow.ts'], plan:'Plant Design API (PDMS)', diff:null },
    { id:'prop-003', type:'fix_proposal', title:'Update material code format assertion', description:'Material codes changed from 6-digit to 8-digit format in v4.1.', confidence:98, status:'accepted', source:'Execution #165', affectedFiles:['tests/e2e/material-tracking.spec.ts'], plan:'Material Tracking API', diff:null },
  ],
  reports: [
    { id:'rep-001', name:'PDMS — Nightly Regression', plan:'Plant Design API (PDMS)', execution:'ex-001', format:'HTML', date:'Today 14:50', status:'ready', size:'2.4 MB' },
    { id:'rep-002', name:'Document Control — Weekly Summary', plan:'Document Control System', execution:null, format:'PDF', date:'Today 10:00', status:'ready', size:'1.2 MB' },
  ],
  deliveryConfigs: [
    { id:'del-001', name:'Nightly QA Report', trigger:'After nightly regression', recipients:['qa@tecnicasreunidas.es','#qa-eng (Teams)'], format:'HTML', plans:['Plant Design API (PDMS)','Document Control System'], enabled:true },
  ],
  schedules: [
    { id:'sch-001', name:'Nightly Regression — PDMS', plan:'Plant Design API (PDMS)', env:'PRO', branch:'main', cron:'0 5 * * *', cronHuman:'Every day at 05:00 AM', enabled:true, lastRun:'Today 05:00', nextRun:'Tomorrow 05:00', lastStatus:'passed', last7:{passed:6,failed:1}, autoReport:true, notifyOn:'failure', duration:'35m' },
    { id:'sch-002', name:'Weekly Full Suite', plan:'All Plans', env:'PRO', branch:'main', cron:'0 6 * * 1', cronHuman:'Every Monday at 06:00', enabled:true, lastRun:'Jun 2 06:00', nextRun:'Jun 9 06:00', lastStatus:'passed', last7:{passed:1,failed:0}, autoReport:true, notifyOn:'always', duration:'55m' },
  ],
  connectors: [
    { id:'con-001', name:'Azure DevOps', type:'task_tracker', icon:'jira', status:'connected', description:'Work items & sprint tracking', config:{ project:'TR-ENG', url:'dev.azure.com/tecnicasreunidas' }, lastSync:'3m ago' },
    { id:'con-002', name:'GitHub', type:'code_repo', icon:'git', status:'connected', description:'Source code & CI/CD', config:{ org:'tecnicas-reunidas', repos:['pdms-api','doc-control','procurement-portal'] }, lastSync:'1m ago' },
    { id:'con-003', name:'SharePoint', type:'storage', icon:'doc', status:'connected', description:'Engineering documents & specs', config:{ site:'TR Engineering' }, lastSync:'10m ago' },
    { id:'con-004', name:'Microsoft Teams', type:'notification', icon:'chat', status:'connected', description:'Notifications & alerts', config:{ workspace:'TR Digital', channels:['#qa-engineering'] }, lastSync:'Active' },
    { id:'con-005', name:'AVEVA E3D', type:'external', icon:'api', status:'connected', description:'3D plant design integration', config:{ version:'3.1' }, lastSync:'1h ago' },
    { id:'con-006', name:'SAP S/4HANA', type:'external', icon:'api', status:'connected', description:'ERP — procurement & materials', config:{ mode:'test' }, lastSync:'30m ago' },
  ],
  teamMembers: [
    { name:'Miguel Fernández', email:'mfernandez@tecnicasreunidas.es', role:'Admin', status:'active', lastActive:'Just now', initials:'MF' },
    { name:'Ana Beltrán', email:'abeltran@tecnicasreunidas.es', role:'QA Expert', status:'active', lastActive:'1h ago', initials:'AB' },
    { name:'Pablo Serrano', email:'pserrano@tecnicasreunidas.es', role:'QA Expert', status:'active', lastActive:'3h ago', initials:'PS' },
    { name:'Lucía Navarro', email:'lnavarro@tecnicasreunidas.es', role:'Viewer', status:'active', lastActive:'1d ago', initials:'LN' },
  ],
  ssoProviders: [
    { name:'Azure AD', status:'active', protocol:'SAML 2.0', domain:'tecnicasreunidas.es', lastLogin:'Today 14:45', users:18 },
  ],
  notificationChannels: [
    { id:'email', name:'Email', icon:'send', status:'connected', config:'SMTP via Microsoft 365', recipients:4 },
    { id:'teams', name:'Microsoft Teams', icon:'chat', status:'connected', config:'TR Digital workspace', recipients:3 },
    { id:'webhook', name:'Webhook', icon:'connectors', status:'connected', config:'https://hooks.tr.es/qa', recipients:1 },
  ],
};
window.QAAP_DATA = QAAP_DATA;