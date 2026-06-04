// QAAP Mock Data — Sacyr Infrastructure & Construction QA
const QAAP_DATA = {
  user: { name: 'Alberto Mendoza', email: 'alberto.mendoza@sacyr.com', role: 'QA Lead', initials: 'AM' },
  tenant: { name: 'Sacyr', slug: 'sacyr', logo: 'assets/sacyr-logo.png' },

  testPlans: [
    { id:'tp-001', name:'BIM Model Validation API', modality:'api', framework:'Karate', status:'approved', scenarioCount:26, passRate:97, lastUpdated:'1h ago', assignedTo:'Alberto Mendoza', health:'healthy', trend:[95,94,96,95,97,96,98,97,97], market:'Global', vertical:'BIM', platforms:['API'] },
    { id:'tp-002', name:'Project Dashboard E2E', modality:'web', framework:'Playwright', status:'approved', scenarioCount:20, passRate:94, lastUpdated:'2h ago', assignedTo:'Alberto Mendoza', health:'healthy', trend:[92,91,93,92,95,94,96,93,94], market:'Spain', vertical:'Projects', platforms:['Desktop','Mobile'] },
    { id:'tp-003', name:'Safety Compliance Module', modality:'web', framework:'Playwright', status:'review', scenarioCount:18, passRate:88, lastUpdated:'30m ago', assignedTo:'Carmen Torres', health:'degrading', trend:[96,94,92,90,88,91,89,87,88], market:'Global', vertical:'Safety', platforms:['Desktop','Mobile'] },
    { id:'tp-004', name:'Procurement & Bidding API', modality:'api', framework:'Karate', status:'approved', scenarioCount:32, passRate:99, lastUpdated:'4h ago', assignedTo:'Javier Ruiz', health:'healthy', trend:[98,99,99,98,99,99,100,99,99], market:'Global', vertical:'Procurement', platforms:['API'] },
    { id:'tp-005', name:'Field Inspection App', modality:'ios', framework:'XCTest', status:'generating', scenarioCount:10, passRate:null, lastUpdated:'15m ago', assignedTo:'Carmen Torres', health:null, trend:[], market:'Spain', vertical:'Field', platforms:['iOS'] },
    { id:'tp-006', name:'Document Management API', modality:'api', framework:'Karate', status:'draft', scenarioCount:8, passRate:null, lastUpdated:'2d ago', assignedTo:'Javier Ruiz', health:null, trend:[], market:'Global', vertical:'Documents', platforms:['API'] },
    { id:'tp-007', name:'Resource Planning E2E', modality:'web', framework:'Playwright', status:'approved', scenarioCount:19, passRate:96, lastUpdated:'3h ago', assignedTo:'Alberto Mendoza', health:'healthy', trend:[93,94,95,94,96,95,97,96,96], market:'Spain', vertical:'Planning', platforms:['Desktop'] },
    { id:'tp-008', name:'Environmental Impact Reports', modality:'api', framework:'Karate', status:'review', scenarioCount:11, passRate:84, lastUpdated:'1d ago', assignedTo:'Carmen Torres', health:'degrading', trend:[91,89,87,85,84,83,82,84,84], market:'Global', vertical:'Environment', platforms:['API'] },
  ],

  scenarios: [
    { id:'s-001', name:'Create new construction project', confidence:96, status:'approved', feature:'Projects' },
    { id:'s-002', name:'Upload BIM model IFC file', confidence:93, status:'approved', feature:'BIM' },
    { id:'s-003', name:'Clash detection between models', confidence:89, status:'approved', feature:'BIM' },
    { id:'s-004', name:'Generate safety compliance report', confidence:68, status:'pending', feature:'Safety' },
    { id:'s-005', name:'Submit procurement bid', confidence:92, status:'approved', feature:'Procurement' },
    { id:'s-006', name:'Multi-site resource allocation', confidence:86, status:'pending', feature:'Planning' },
    { id:'s-007', name:'Budget tracking per work unit', confidence:95, status:'approved', feature:'Finance' },
    { id:'s-008', name:'Concurrent document versioning', confidence:47, status:'rejected', feature:'Documents' },
    { id:'s-009', name:'Field inspection photo upload', confidence:74, status:'pending', feature:'Field' },
    { id:'s-010', name:'Environmental KPI dashboard', confidence:99, status:'approved', feature:'Environment' },
    { id:'s-011', name:'Project milestone notification', confidence:91, status:'approved', feature:'Projects' },
    { id:'s-012', name:'Subcontractor onboarding flow', confidence:87, status:'approved', feature:'Procurement' },
    { id:'s-013', name:'Rejected bid error handling', confidence:94, status:'approved', feature:'Procurement' },
    { id:'s-014', name:'Offline field data sync', confidence:79, status:'pending', feature:'Field' },
    { id:'s-015', name:'Concurrent project edit conflict', confidence:54, status:'rejected', feature:'Projects' },
  ],

  gherkinContent: `Feature: BIM Model Validation
  As a project engineer
  I want to validate BIM models against standards
  So that construction documentation meets ISO 19650

  @approved @confidence:96
  Scenario: Upload and validate IFC model
    Given I am logged in as "alberto.mendoza@sacyr.com"
    And I have a valid IFC 4.0 model file "bridge-structure-v3.ifc"
    When I navigate to the BIM Validation page
    And I upload the model file
    Then the system should parse the IFC schema
    And display the model components tree
    When I click "Run Validation"
    Then all structural elements should pass load-bearing checks
    And the validation report should show "Compliant"

  @pending @confidence:68
  Scenario: Generate safety compliance report
    Given I am logged in as "carmen.torres@sacyr.com"
    And project "A-66 Highway Extension" has safety data
    When I navigate to Safety Reports
    And I select "Monthly Compliance Report"
    Then the report should include incident metrics
    And PPE compliance rate should be displayed
    When I click "Export PDF"
    Then the PDF should include digital signatures`,

  generatedCode: `import { test, expect } from '@playwright/test';

test.describe('BIM Model Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'alberto.mendoza@sacyr.com');
    await page.fill('[data-testid="password"]', 'TestPass123!');
    await page.click('[data-testid="login-btn"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('upload and validate IFC model', async ({ page }) => {
    await page.goto('/bim/validation');
    const fileInput = page.locator('[data-testid="ifc-upload"]');
    await fileInput.setInputFiles('fixtures/bridge-structure-v3.ifc');
    await expect(page.locator('[data-testid="model-tree"]')).toBeVisible();
    await page.click('[data-testid="run-validation"]');
    await expect(page.locator('[data-testid="validation-status"]'))
      .toContainText('Compliant');
  });
});`,

  chatMessages: [
    { role:'system', content:'Plan loaded: BIM Model Validation API — 26 scenarios, 20 approved, 4 pending, 2 rejected. Sources: Azure DevOps (SACYR-BIM-Sprint-14), GitHub (sacyr/bim-platform), OpenAPI spec v2.1.' },
    { role:'user', content:'Add test for clash detection between structural and MEP models' },
    { role:'assistant', content:'I\'ve added **Scenario 27: Clash detection between structural and MEP models**. It covers importing both models simultaneously and running interference checks.\n\n**Confidence: 82%** — The clash detection API is well-documented but the response format varies by model complexity.', model:'Claude Sonnet 4' },
  ],

  executions: [
    { id:'ex-001', date:'Today 14:45', env:'PRE', status:'passed', passRate:94, duration:'4m 52s', trigger:'manual', passed:24, failed:2, skipped:0 },
    { id:'ex-002', date:'Today 08:00', env:'PRE', status:'failed', passRate:86, duration:'5m 10s', trigger:'cron', passed:22, failed:4, skipped:0 },
    { id:'ex-003', date:'Yesterday 22:00', env:'PRO', status:'passed', passRate:100, duration:'5m 45s', trigger:'cron', passed:26, failed:0, skipped:0 },
    { id:'ex-004', date:'Yesterday 15:30', env:'DEV', status:'passed', passRate:91, duration:'3m 50s', trigger:'webhook', passed:24, failed:2, skipped:0 },
    { id:'ex-005', date:'Jun 2 08:00', env:'PRE', status:'failed', passRate:82, duration:'5m 30s', trigger:'cron', passed:21, failed:5, skipped:0 },
  ],

  recentActivity: [
    { type:'execution', text:'BIM Model Validation passed on PRE', time:'2h ago', status:'success' },
    { type:'generation', text:'Field Inspection App generating…', time:'15m ago', status:'info' },
    { type:'review', text:'Safety Compliance Module needs review', time:'30m ago', status:'warning' },
    { type:'approval', text:'Procurement API approved by Alberto', time:'4h ago', status:'success' },
    { type:'alert', text:'Safety Compliance pass rate below 90%', time:'1h ago', status:'error' },
    { type:'proposal', text:'AI suggested 2 new tests for BIM', time:'5h ago', status:'info' },
  ],

  healthMetrics: { overallPassRate:93.2, totalExecutions:156, flakyTests:3, coverageScore:82 },

  healthPlans: [
    { name:'BIM Model Validation API', health:'healthy', passRate:97, trend:[95,94,96,95,97,96,98,97,97], lastRun:'1h ago', scenarios:26 },
    { name:'Safety Compliance Module', health:'degrading', passRate:88, trend:[96,94,92,90,88,91,89,87,88], lastRun:'30m ago', scenarios:18 },
    { name:'Project Dashboard E2E', health:'healthy', passRate:94, trend:[92,91,93,92,95,94,96,93,94], lastRun:'2h ago', scenarios:20 },
    { name:'Procurement & Bidding API', health:'healthy', passRate:99, trend:[98,99,99,98,99,99,100,99,99], lastRun:'4h ago', scenarios:32 },
  ],

  flakyTests: [
    { name:'BIM model render timeout', plan:'BIM Model Validation API', flakeRate:28, lastFlake:'Today 08:00' },
    { name:'Safety report PDF generation', plan:'Safety Compliance Module', flakeRate:22, lastFlake:'Yesterday' },
    { name:'Resource calendar sync', plan:'Resource Planning E2E', flakeRate:15, lastFlake:'Jun 2' },
  ],

  alerts: [
    { severity:'critical', message:'Safety Compliance pass rate dropped to 88%', time:'1h ago', plan:'Safety Compliance Module' },
    { severity:'warning', message:'Flaky test: BIM model render timeout (28% flake rate)', time:'3h ago', plan:'BIM Model Validation API' },
    { severity:'info', message:'Project Dashboard E2E recovered to healthy', time:'2h ago', plan:'Project Dashboard E2E' },
  ],

  executionDetails: [
    { id:'ex-001', date:'Today 14:45', env:'PRE', status:'passed', passRate:94, duration:'4m 52s', trigger:'manual', triggeredBy:'Alberto Mendoza', branch:'main', passed:24, failed:2, skipped:0,
      results: [
        { scenario:'Create new construction project', status:'passed', duration:'12.1s' },
        { scenario:'Upload BIM model IFC file', status:'passed', duration:'9.8s' },
        { scenario:'Clash detection between models', status:'passed', duration:'14.5s' },
        { scenario:'Generate safety compliance report', status:'failed', duration:'18.2s', error:'PDF export timed out after 30s', screenshot:'safety-report-fail.png', classification:'Timeout', rootCause:'The PDF generation service was under heavy load due to end-of-month reporting cycle.' },
        { scenario:'Submit procurement bid', status:'passed', duration:'8.4s' },
      ]
    },
    { id:'ex-002', date:'Today 08:00', env:'PRE', status:'failed', passRate:86, duration:'5m 10s', trigger:'cron', triggeredBy:'Scheduled', branch:'main', passed:22, failed:4, skipped:0, results:[] },
    { id:'ex-003', date:'Yesterday 22:00', env:'PRO', status:'passed', passRate:100, duration:'5m 45s', trigger:'cron', triggeredBy:'Scheduled', branch:'main', passed:26, failed:0, skipped:0, results:[] },
    { id:'ex-004', date:'Yesterday 15:30', env:'DEV', status:'passed', passRate:91, duration:'3m 50s', trigger:'webhook', triggeredBy:'PR #412', branch:'feature/clash-api-v2', passed:24, failed:2, skipped:0, results:[] },
    { id:'ex-005', date:'Jun 2 08:00', env:'PRE', status:'failed', passRate:82, duration:'5m 30s', trigger:'cron', triggeredBy:'Scheduled', branch:'main', passed:21, failed:5, skipped:0, results:[] },
  ],

  aiProposals: [
    { id:'prop-001', type:'bug_detection', title:'Race condition in concurrent project edits', description:'Two engineers editing the same project schedule simultaneously can overwrite each other\'s changes.', confidence:92, status:'proposed', source:'Detected from Execution #142', affectedFiles:['src/services/ProjectScheduleService.ts'], plan:'Project Dashboard E2E', diff:null },
    { id:'prop-002', type:'test_improvement', title:'Add BIM clash severity levels', description:'Current tests only check pass/fail for clashes. Missing coverage for severity classification (critical/warning/info).', confidence:85, status:'proposed', source:'Detected from trend analysis', affectedFiles:['tests/e2e/bim-validation.spec.ts'], plan:'BIM Model Validation API', diff:null },
    { id:'prop-003', type:'fix_proposal', title:'Update safety report date format', description:'Test fails because safety report changed date format from DD/MM to ISO 8601.', confidence:98, status:'accepted', source:'Detected from Execution #142', affectedFiles:['tests/e2e/safety-compliance.spec.ts'], plan:'Safety Compliance Module', diff:null },
    { id:'prop-004', type:'coverage_gap', title:'No tests for offline field sync', description:'Field inspection offline mode has zero test coverage. Critical for remote construction sites.', confidence:78, status:'proposed', source:'Detected from source analysis', affectedFiles:['src/services/FieldSyncService.ts'], plan:'Field Inspection App', diff:null },
  ],

  reports: [
    { id:'rep-001', name:'BIM Validation — Nightly Regression', plan:'BIM Model Validation API', execution:'ex-001', format:'HTML', date:'Today 14:50', status:'ready', size:'2.1 MB' },
    { id:'rep-002', name:'Safety Compliance — Weekly Summary', plan:'Safety Compliance Module', execution:null, format:'PDF', date:'Today 10:00', status:'ready', size:'1.5 MB' },
    { id:'rep-003', name:'Sprint 14 — QA Summary', plan:null, execution:null, format:'PDF', date:'Yesterday', status:'ready', size:'3.8 MB' },
  ],

  deliveryConfigs: [
    { id:'del-001', name:'Nightly QA Report', trigger:'After every nightly regression', recipients:['qa-team@sacyr.com', '#qa-infra (Teams)'], format:'HTML', plans:['BIM Model Validation API', 'Safety Compliance Module'], enabled:true },
    { id:'del-002', name:'Weekly Summary to Engineering', trigger:'Every Monday 09:00', recipients:['eng-leads@sacyr.com'], format:'PDF', plans:['All plans'], enabled:true },
  ],

  schedules: [
    { id:'sch-001', name:'Nightly Regression — BIM', plan:'BIM Model Validation API', env:'PRO', branch:'main', cron:'0 5 * * *', cronHuman:'Every day at 05:00 AM', enabled:true, lastRun:'Today 05:00', nextRun:'Tomorrow 05:00', lastStatus:'passed', last7:{ passed:6, failed:1 }, autoReport:true, notifyOn:'failure', duration:'30m' },
    { id:'sch-002', name:'Nightly Regression — Safety', plan:'Safety Compliance Module', env:'PRO', branch:'main', cron:'0 5 * * *', cronHuman:'Every day at 05:00 AM', enabled:true, lastRun:'Today 05:00', nextRun:'Tomorrow 05:00', lastStatus:'failed', last7:{ passed:4, failed:3 }, autoReport:true, notifyOn:'always', duration:'18m' },
    { id:'sch-003', name:'PR Validation — BIM', plan:'BIM Model Validation API', env:'DEV', branch:'feature/*', cron:null, cronHuman:'On PR with label: qa-bim', enabled:true, lastRun:'Today 11:30', nextRun:'On next PR', lastStatus:'passed', last7:{ passed:5, failed:1 }, autoReport:false, notifyOn:'failure', prLabels:['qa-bim'], duration:'12m' },
    { id:'sch-004', name:'Weekly Full Suite', plan:'All Plans', env:'PRO', branch:'main', cron:'0 6 * * 1', cronHuman:'Every Monday at 06:00', enabled:true, lastRun:'Jun 2 06:00', nextRun:'Jun 9 06:00', lastStatus:'passed', last7:{ passed:1, failed:0 }, autoReport:true, notifyOn:'always', duration:'50m' },
  ],

  connectors: [
    { id:'con-001', name:'Azure DevOps', type:'task_tracker', icon:'jira', status:'connected', description:'Work items, boards & sprint tracking', config:{ project:'SACYR-BIM', url:'dev.azure.com/sacyr' }, lastSync:'2m ago' },
    { id:'con-002', name:'GitHub', type:'code_repo', icon:'git', status:'connected', description:'Source code & CI/CD pipelines', config:{ org:'sacyr', repos:['bim-platform','safety-module','procurement-api'] }, lastSync:'1m ago' },
    { id:'con-003', name:'Azure Blob Storage', type:'storage', icon:'doc', status:'connected', description:'Test artifacts & BIM model storage', config:{ container:'qa-artifacts', region:'West Europe' }, lastSync:'15m ago' },
    { id:'con-004', name:'Microsoft Teams', type:'notification', icon:'chat', status:'connected', description:'Notifications & alerts', config:{ workspace:'Sacyr Digital', channels:['#qa-infra','#qa-safety'] }, lastSync:'Active' },
    { id:'con-005', name:'Autodesk Platform Services', type:'external', icon:'api', status:'connected', description:'BIM model rendering & conversion', config:{ mode:'production' }, lastSync:'30m ago' },
    { id:'con-006', name:'OpenAPI Spec', type:'api_spec', icon:'api', status:'connected', description:'API definitions for all services', config:{ version:'v2.1', endpoints:64 }, lastSync:'1h ago' },
  ],

  teamMembers: [
    { name:'Alberto Mendoza', email:'alberto.mendoza@sacyr.com', role:'Admin', status:'active', lastActive:'Just now', initials:'AM' },
    { name:'Carmen Torres', email:'carmen.torres@sacyr.com', role:'QA Expert', status:'active', lastActive:'1h ago', initials:'CT' },
    { name:'Javier Ruiz', email:'javier.ruiz@sacyr.com', role:'QA Expert', status:'active', lastActive:'3h ago', initials:'JR' },
    { name:'Laura Sánchez', email:'laura.sanchez@sacyr.com', role:'Viewer', status:'active', lastActive:'1d ago', initials:'LS' },
  ],

  ssoProviders: [
    { name:'Azure AD', status:'active', protocol:'SAML 2.0', domain:'sacyr.com', lastLogin:'Today 14:45', users:24 },
    { name:'Google Workspace', status:'inactive', protocol:'OIDC', domain:'sacyr.com', lastLogin:'Never', users:0 },
  ],

  notificationChannels: [
    { id:'email', name:'Email', icon:'send', status:'connected', config:'SMTP via Microsoft 365', recipients:4 },
    { id:'teams', name:'Microsoft Teams', icon:'chat', status:'connected', config:'Connected to Sacyr Digital workspace', recipients:3 },
    { id:'webhook', name:'Webhook', icon:'connectors', status:'connected', config:'https://hooks.sacyr.com/qa-alerts', recipients:1 },
  ],
};

window.QAAP_DATA = QAAP_DATA;