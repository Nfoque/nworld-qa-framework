// QAAP Mock Data — Ferrovial Infrastructure & Construction QA
const QAAP_DATA = {
  user: { name: 'Javier Moreno', email: 'jmoreno@ferrovial.com', role: 'QA Lead', initials: 'JM' },
  tenant: { name: 'Ferrovial', slug: 'ferrovial', logo: 'assets/ferrovial-logo.png' },

  testPlans: [
    { id:'tp-001', name:'Project Management Portal', modality:'web', framework:'Playwright', status:'approved', scenarioCount:26, passRate:96, lastUpdated:'1h ago', assignedTo:'Javier Moreno', health:'healthy', trend:[94,93,95,94,96,95,97,96,96], market:'Global', vertical:'Portal', platforms:['Desktop','Mobile'] },
    { id:'tp-002', name:'Toll Collection System E2E', modality:'web', framework:'Playwright', status:'approved', scenarioCount:20, passRate:93, lastUpdated:'3h ago', assignedTo:'Javier Moreno', health:'healthy', trend:[91,90,92,91,94,93,95,92,93], market:'Spain', vertical:'Tolls', platforms:['Desktop','Mobile'] },
    { id:'tp-003', name:'SAP Integration API', modality:'api', framework:'Karate', status:'review', scenarioCount:18, passRate:87, lastUpdated:'45m ago', assignedTo:'Ana Ruiz', health:'degrading', trend:[95,93,91,89,88,90,87,86,87], market:'Global', vertical:'ERP', platforms:['API'] },
    { id:'tp-004', name:'Asset Inventory API', modality:'api', framework:'Karate', status:'approved', scenarioCount:32, passRate:99, lastUpdated:'5h ago', assignedTo:'Pablo García', health:'healthy', trend:[97,98,99,98,99,99,100,99,99], market:'Global', vertical:'Assets', platforms:['API'] },
    { id:'tp-005', name:'Safety Incident Reporting', modality:'web', framework:'Cypress', status:'generating', scenarioCount:12, passRate:null, lastUpdated:'20m ago', assignedTo:'Ana Ruiz', health:null, trend:[], market:'Global', vertical:'Safety', platforms:['Desktop','Mobile'] },
    { id:'tp-006', name:'Field Inspector App', modality:'ios', framework:'XCTest', status:'draft', scenarioCount:9, passRate:null, lastUpdated:'2d ago', assignedTo:'Pablo García', health:null, trend:[], market:'Spain', vertical:'Mobile', platforms:['iOS'] },
    { id:'tp-007', name:'Contract & Tender Engine', modality:'api', framework:'Karate', status:'approved', scenarioCount:21, passRate:95, lastUpdated:'4h ago', assignedTo:'Javier Moreno', health:'healthy', trend:[92,93,94,93,95,94,96,95,95], market:'Global', vertical:'Procurement', platforms:['API'] },
    { id:'tp-008', name:'Environmental Monitoring Alerts', modality:'api', framework:'Karate', status:'review', scenarioCount:10, passRate:82, lastUpdated:'1d ago', assignedTo:'Ana Ruiz', health:'degrading', trend:[90,88,86,84,83,82,81,82,82], market:'Global', vertical:'Sustainability', platforms:['API'] },
  ],

  scenarios: [
    { id:'s-001', name:'Create new construction project', confidence:95, status:'approved', feature:'Projects' },
    { id:'s-002', name:'Assign project manager to project', confidence:92, status:'approved', feature:'Projects' },
    { id:'s-003', name:'Upload project documentation', confidence:88, status:'approved', feature:'Documents' },
    { id:'s-004', name:'Generate project progress report', confidence:66, status:'pending', feature:'Reports' },
    { id:'s-005', name:'Approve budget change request', confidence:91, status:'approved', feature:'Budget' },
    { id:'s-006', name:'Multi-site project dashboard view', confidence:84, status:'pending', feature:'Dashboard' },
    { id:'s-007', name:'Calculate toll tariff by vehicle class', confidence:96, status:'approved', feature:'Tolls' },
    { id:'s-008', name:'SAP work order synchronization', confidence:48, status:'rejected', feature:'Integration' },
    { id:'s-009', name:'Project milestone notification', confidence:73, status:'pending', feature:'Notifications' },
    { id:'s-010', name:'Asset geolocation tracking', confidence:98, status:'approved', feature:'Assets' },
    { id:'s-011', name:'Safety incident escalation workflow', confidence:90, status:'approved', feature:'Safety' },
    { id:'s-012', name:'Contractor access permission management', confidence:86, status:'approved', feature:'Access' },
    { id:'s-013', name:'Duplicate project code validation', confidence:94, status:'approved', feature:'Validation' },
    { id:'s-014', name:'Offline field data sync on reconnect', confidence:77, status:'pending', feature:'Mobile' },
    { id:'s-015', name:'Concurrent budget approval race condition', confidence:52, status:'rejected', feature:'Budget' },
  ],

  gherkinContent: `Feature: Project Management Portal
  As a project manager
  I want to manage construction projects
  So that I can track progress and resources

  @approved @confidence:95
  Scenario: Create new construction project
    Given I am logged in as "jmoreno@ferrovial.com"
    And I have role "Project Manager"
    When I navigate to "Projects > New Project"
    Then I should see the project creation form
    When I enter project name "A-66 Highway Extension"
    And I select project type "Highway Construction"
    And I select business unit "Autopistas"
    And I assign budget "€45,000,000"
    And I set start date "2026-07-01"
    And I set estimated completion "2028-12-31"
    And I click "Create Project"
    Then I should see the project dashboard
    And the project code should match "PRJ-\\\\d+"
    And the project status should be "Planning"
    And a notification should be sent to the assigned team

  @pending @confidence:66
  Scenario: Generate project progress report
    Given I am logged in as "jmoreno@ferrovial.com"
    And project "PRJ-2041" has active milestones
    When I navigate to "Reports > Progress Report"
    And I select project "A-66 Highway Extension"
    And I select date range "Last 30 days"
    And I click "Generate Report"
    Then the report should include milestone completion %
    And the report should include budget vs actual spend
    And the report should include safety incident summary
    And a PDF should be available for download

  @approved @confidence:88
  Scenario: Upload project documentation
    Given I am logged in as "jmoreno@ferrovial.com"
    And I am on project "PRJ-2041" detail page
    When I click "Documents > Upload"
    And I select file "environmental-impact-study.pdf"
    And I set document category "Environmental"
    And I click "Upload"
    Then the document should appear in the project library
    And it should be tagged with the correct category
    And version control should show "v1.0"`,

  generatedCode: `import { test, expect } from '@playwright/test';

test.describe('Project Management Portal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'jmoreno@ferrovial.com');
    await page.fill('[data-testid="password"]', 'TestPass123!');
    await page.click('[data-testid="login-btn"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('create new construction project', async ({ page }) => {
    // Navigate to new project form
    await page.click('[data-testid="nav-projects"]');
    await page.click('[data-testid="new-project-btn"]');

    // Fill project details
    await page.fill('[data-testid="project-name"]', 'A-66 Highway Extension');
    await page.selectOption('[data-testid="project-type"]', 'highway');
    await page.selectOption('[data-testid="business-unit"]', 'autopistas');
    await page.fill('[data-testid="budget"]', '45000000');
    await page.fill('[data-testid="start-date"]', '2026-07-01');
    await page.fill('[data-testid="end-date"]', '2028-12-31');

    // Create project
    await page.click('[data-testid="create-project"]');
    await expect(page.locator('[data-testid="project-dashboard"]'))
      .toBeVisible();
    await expect(page.locator('[data-testid="project-code"]'))
      .toHaveText(/PRJ-\\d+/);
    await expect(page.locator('[data-testid="project-status"]'))
      .toContainText('Planning');
  });
});`,

  chatMessages: [
    { role:'system', content:'Plan loaded: Project Management Portal — 26 scenarios, 18 approved, 5 pending, 3 rejected. Sources: Jira (FRV-Sprint-34), GitHub (ferrovial/project-portal), OpenAPI spec v2.8.' },
    { role:'user', content:'Add a test for concurrent budget approval requests' },
    { role:'assistant', content:'I\'ve added **Scenario 27: Concurrent budget approval race condition**. It covers the case where two approvers submit conflicting budget change decisions simultaneously.\n\nThe scenario verifies:\n• First approval is accepted and recorded\n• Second attempt shows "Approval already processed"\n• Budget history maintains consistency\n\n**Confidence: 52%** — The approval workflow has complex state transitions. I recommend testing with pessimistic locking enabled on the budget service.', model:'Claude Sonnet 4' },
    { role:'user', content:'Check our SAP integration test coverage' },
    { role:'assistant', content:'The SAP Integration API plan has **18 scenarios** but only **48% average confidence** for the sync-related tests. Key issues:\n\n1. Work order sync test depends on SAP sandbox availability\n2. No tests for partial sync failure recovery\n3. Missing validation for custom field mappings (BAPI calls)\n\nI recommend:\n• Adding a mock SAP endpoint for deterministic testing\n• Testing rollback scenarios for failed syncs\n\nWant me to generate these scenarios?', model:'Claude Sonnet 4' },
  ],

  executions: [
    { id:'ex-001', date:'Today 13:20', env:'PRE', status:'passed', passRate:93, duration:'6m 45s', trigger:'manual', passed:24, failed:2, skipped:0 },
    { id:'ex-002', date:'Today 07:00', env:'PRE', status:'failed', passRate:85, duration:'5m 58s', trigger:'cron', passed:22, failed:4, skipped:0 },
    { id:'ex-003', date:'Yesterday 22:00', env:'PRO', status:'passed', passRate:100, duration:'7m 20s', trigger:'cron', passed:26, failed:0, skipped:0 },
    { id:'ex-004', date:'Yesterday 14:30', env:'DEV', status:'passed', passRate:92, duration:'5m 15s', trigger:'webhook', passed:24, failed:2, skipped:0 },
    { id:'ex-005', date:'Jun 2 07:00', env:'PRE', status:'failed', passRate:81, duration:'6m 10s', trigger:'cron', passed:21, failed:5, skipped:0 },
  ],

  recentActivity: [
    { type:'execution', text:'Project Management Portal passed on PRE', time:'1h ago', status:'success' },
    { type:'generation', text:'Safety Incident Reporting generating…', time:'20m ago', status:'info' },
    { type:'review', text:'SAP Integration API needs review', time:'45m ago', status:'warning' },
    { type:'approval', text:'Asset Inventory API approved by Javier', time:'5h ago', status:'success' },
    { type:'alert', text:'SAP Integration pass rate below 90%', time:'2h ago', status:'error' },
    { type:'proposal', text:'AI suggested 4 new tests for Toll System', time:'6h ago', status:'info' },
  ],

  healthMetrics: { overallPassRate:92.4, totalExecutions:156, flakyTests:3, coverageScore:79 },

  healthPlans: [
    { name:'Project Management Portal', health:'healthy', passRate:96, trend:[94,93,95,94,96,95,97,96,96], lastRun:'1h ago', scenarios:26 },
    { name:'SAP Integration API', health:'degrading', passRate:87, trend:[95,93,91,89,88,90,87,86,87], lastRun:'45m ago', scenarios:18 },
    { name:'Toll Collection System E2E', health:'healthy', passRate:93, trend:[91,90,92,91,94,93,95,92,93], lastRun:'3h ago', scenarios:20 },
    { name:'Asset Inventory API', health:'healthy', passRate:99, trend:[97,98,99,98,99,99,100,99,99], lastRun:'5h ago', scenarios:32 },
  ],

  flakyTests: [
    { name:'SAP work order sync timeout', plan:'SAP Integration API', flakeRate:38, lastFlake:'Today 07:00' },
    { name:'Toll camera image recognition delay', plan:'Toll Collection System E2E', flakeRate:21, lastFlake:'Yesterday' },
    { name:'Geolocation API intermittent timeout', plan:'Asset Inventory API', flakeRate:14, lastFlake:'Jun 2' },
  ],

  alerts: [
    { severity:'critical', message:'SAP Integration pass rate dropped to 87%', time:'2h ago', plan:'SAP Integration API' },
    { severity:'warning', message:'Flaky test: SAP work order sync timeout (38% flake rate)', time:'4h ago', plan:'SAP Integration API' },
    { severity:'info', message:'Project Management Portal recovered to healthy', time:'1h ago', plan:'Project Management Portal' },
  ],

  executionDetails: [
    { id:'ex-001', date:'Today 13:20', env:'PRE', status:'passed', passRate:93, duration:'6m 45s', trigger:'manual', triggeredBy:'Javier Moreno', branch:'main', passed:24, failed:2, skipped:0,
      results: [
        { scenario:'Create new construction project', status:'passed', duration:'15.2s' },
        { scenario:'Assign project manager to project', status:'passed', duration:'9.6s' },
        { scenario:'Upload project documentation', status:'passed', duration:'12.8s' },
        { scenario:'Generate project progress report', status:'failed', duration:'18.4s', error:'Expected report title "Progress Report — A-66" but got "Informe de Progreso — A-66"', screenshot:'report-title-fail.png', classification:'Assertion Mismatch', rootCause:'The report template was updated to use Spanish locale in v2.8.1. The test assertion needs updating to match the localized title format.' },
        { scenario:'Approve budget change request', status:'passed', duration:'11.3s' },
        { scenario:'Calculate toll tariff by vehicle class', status:'passed', duration:'7.8s' },
        { scenario:'SAP work order synchronization', status:'failed', duration:'30.1s', error:'Timeout waiting for SAP callback response', classification:'Timeout', rootCause:'SAP sandbox was throttling requests due to concurrent load testing by another team.' },
        { scenario:'Asset geolocation tracking', status:'passed', duration:'8.2s' },
        { scenario:'Safety incident escalation workflow', status:'passed', duration:'13.5s' },
        { scenario:'Contractor access permission management', status:'passed', duration:'10.1s' },
      ]
    },
    { id:'ex-002', date:'Today 07:00', env:'PRE', status:'failed', passRate:85, duration:'5m 58s', trigger:'cron', triggeredBy:'Scheduled', branch:'main', passed:22, failed:4, skipped:0,
      results: [
        { scenario:'Create new construction project', status:'passed', duration:'14.8s' },
        { scenario:'SAP work order synchronization', status:'failed', duration:'30.5s', error:'SAP BAPI call returned error code 500', classification:'Environment Issue', rootCause:'SAP sandbox was undergoing nightly maintenance. No maintenance window notification received.' },
        { scenario:'Concurrent budget approval race condition', status:'failed', duration:'22.6s', error:'Expected approval count to be 1 but got 2', classification:'Race Condition', rootCause:'The approval service lacks optimistic locking on the budget change record.' },
        { scenario:'Environmental monitoring alert threshold', status:'failed', duration:'16.3s', error:'Alert not triggered within expected timeframe', classification:'Timing Issue', rootCause:'The monitoring cron job frequency was changed from 1min to 5min in the last deployment.' },
        { scenario:'Generate project progress report', status:'failed', duration:'17.9s', error:'Report title locale mismatch', classification:'Assertion Mismatch', rootCause:'Same as ex-001 — report template localized to Spanish.' },
      ]
    },
    { id:'ex-003', date:'Yesterday 22:00', env:'PRO', status:'passed', passRate:100, duration:'7m 20s', trigger:'cron', triggeredBy:'Scheduled', branch:'main', passed:26, failed:0, skipped:0, results:[] },
    { id:'ex-004', date:'Yesterday 14:30', env:'DEV', status:'passed', passRate:92, duration:'5m 15s', trigger:'webhook', triggeredBy:'PR #589', branch:'feature/safety-v2', passed:24, failed:2, skipped:0, results:[] },
    { id:'ex-005', date:'Jun 2 07:00', env:'PRE', status:'failed', passRate:81, duration:'6m 10s', trigger:'cron', triggeredBy:'Scheduled', branch:'main', passed:21, failed:5, skipped:0, results:[] },
  ],

  aiProposals: [
    { id:'prop-001', type:'bug_detection', title:'Race condition in concurrent budget approval', description:'Analysis of Execution #156 revealed that two approvers can submit conflicting budget change decisions simultaneously. The approval service lacks optimistic locking on BudgetChangeRequest records.', confidence:91, status:'proposed', source:'Detected from Execution #156', affectedFiles:['src/services/BudgetApprovalService.ts', 'src/middleware/approvalLock.ts'], plan:'Project Management Portal',
      diff:`- async approveBudgetChange(changeId: string, decision: Decision): Promise<void> {
-   const change = await this.budgetRepo.findById(changeId);
-   if (change.status !== 'pending') throw new AlreadyProcessedError();
+ async approveBudgetChange(changeId: string, decision: Decision): Promise<void> {
+   return await this.budgetRepo.transaction(async (tx) => {
+     const change = await tx.findById(changeId, { forUpdate: true });
+     if (change.status !== 'pending') throw new AlreadyProcessedError();
+     await tx.updateStatus(changeId, decision);
+   });` },
    { id:'prop-002', type:'test_improvement', title:'Add negative tests for SAP sync failure recovery', description:'Current SAP integration tests only cover happy-path synchronization. Missing coverage for partial sync failures, BAPI error codes, and rollback scenarios. These represent 22% of production incidents in the last quarter.', confidence:84, status:'proposed', source:'Detected from trend analysis', affectedFiles:['tests/e2e/sap-integration.spec.ts'], plan:'SAP Integration API',
      diff:`+ Scenario: SAP sync partial failure recovery
+   Given a pending work order batch of 50 items
+   When SAP returns error on item 25
+   Then items 1-24 should be marked as synced
+   And items 25-50 should be marked as pending retry
+   And an alert should be generated` },
    { id:'prop-003', type:'fix_proposal', title:'Update report title assertion for Spanish locale', description:'Test "Generate project progress report" fails because the template was localized from English to Spanish in v2.8.1. The assertion needs to match the new locale.', confidence:98, status:'accepted', source:'Detected from Execution #156', affectedFiles:['tests/e2e/project-portal.spec.ts'], plan:'Project Management Portal',
      diff:`- Then I should see report title "Progress Report — A-66"
+ Then I should see report title "Informe de Progreso — A-66"` },
    { id:'prop-004', type:'coverage_gap', title:'No tests for offline field data sync', description:'The Field Inspector app added offline-first data capture in Sprint 32 but has zero E2E coverage for the sync-on-reconnect flow. This is critical for remote construction sites with intermittent connectivity.', confidence:76, status:'proposed', source:'Detected from source change in commit c4a9e11', affectedFiles:['src/mobile/OfflineSyncService.swift', 'src/api/field-data/sync.ts'], plan:'Field Inspector App',
      diff:`+ Feature: Offline Field Data Sync
+   Scenario: Sync inspections after reconnect
+     Given the inspector has 5 pending inspections offline
+     When network connectivity is restored
+     Then all 5 inspections should sync to server
+     And conflict resolution should apply for stale records` },
    { id:'prop-005', type:'bug_detection', title:'SAP sandbox maintenance window undetected', description:'SAP integration tests fail every night during the 02:00-03:00 maintenance window. No health check detects this, causing false failure alerts. Recommend adding a pre-flight SAP health check.', confidence:94, status:'rejected', source:'Detected from Execution #157', affectedFiles:[], plan:'SAP Integration API', diff:null },
    { id:'prop-006', type:'testid_gap', title:'Missing data-test-id on 22 portal elements', description:'Automated scan of the project-portal repository detected 22 interactive elements lacking data-test-id attributes in the project creation and budget approval flows.', confidence:97, status:'proposed', source:'Detected from repo scan (project-portal)', affectedFiles:['src/components/Project/CreateForm.tsx', 'src/components/Budget/ApprovalPanel.tsx'], plan:'Project Management Portal',
      diff:`// CreateForm.tsx — 8 elements missing data-test-id
- <button onClick={handleCreate}>Create Project</button>
+ <button onClick={handleCreate} data-test-id="create-project">Create Project</button>

// ApprovalPanel.tsx — 6 elements missing
- <button onClick={() => approve(change)}>Approve</button>
+ <button onClick={() => approve(change)} data-test-id={\`approve-\${change.id}\`}>Approve</button>` },
    { id:'prop-007', type:'cross_platform', title:'Shared Gherkin → Generate iOS tests for Field Inspector', description:'The "Project Management Portal" web plan shares 12 scenarios with the Field Inspector mobile app. Generating XCTest equivalents would eliminate manual duplication. Estimated savings: ~35h/month.', confidence:87, status:'proposed', source:'Detected from cross-platform analysis', affectedFiles:['tests/ios/field-inspector.xctest.swift'], plan:'Project Management Portal',
      diff:`// Auto-generated from shared Gherkin → XCTest
+ func testCreateInspectionReport() throws {
+     let app = XCUIApplication()
+     app.textFields["email"].tap()
+     app.textFields["email"].typeText("jmoreno@ferrovial.com")
+     // ... generated from same Gherkin as web
+ }` },
    { id:'prop-008', type:'flaky_fix', title:'Stabilize toll camera image recognition test', description:'Toll camera OCR test fails intermittently (21% flake rate) due to variable image processing time. Proposed fix: use a pre-processed mock image and increase the assertion timeout from 5s to 15s.', confidence:90, status:'proposed', source:'Detected from flaky test analysis', affectedFiles:['tests/e2e/toll-system.spec.ts', 'tests/fixtures/mock-plates.ts'], plan:'Toll Collection System E2E',
      diff:`+ // Use pre-processed plate images for deterministic OCR
+ const MOCK_PLATES = {
+   car: { image: 'fixtures/plate-car-1234ABC.png', expected: '1234ABC' },
+   truck: { image: 'fixtures/plate-truck-5678DEF.png', expected: '5678DEF' },
+ };` },
  ],

  reports: [
    { id:'rep-001', name:'Project Portal — Nightly Regression', plan:'Project Management Portal', execution:'ex-001', format:'HTML', date:'Today 13:25', status:'ready', size:'2.6 MB' },
    { id:'rep-002', name:'SAP Integration — Weekly Summary', plan:'SAP Integration API', execution:null, format:'PDF', date:'Today 10:00', status:'ready', size:'1.2 MB' },
    { id:'rep-003', name:'Sprint 34 — QA Summary', plan:null, execution:null, format:'PDF', date:'Yesterday', status:'ready', size:'3.5 MB' },
    { id:'rep-004', name:'Toll System — XRay Export', plan:'Toll Collection System E2E', execution:'ex-003', format:'XRay', date:'Yesterday 22:10', status:'delivered', size:'780 KB' },
    { id:'rep-005', name:'All Plans — Monthly Report', plan:null, execution:null, format:'HTML', date:'Jun 1', status:'scheduled', size:null },
  ],

  deliveryConfigs: [
    { id:'del-001', name:'Nightly QA Report', trigger:'After every nightly regression', recipients:['qa-infra@ferrovial.com', '#qa-alerts (Teams)'], format:'HTML', plans:['Project Management Portal', 'SAP Integration API'], enabled:true },
    { id:'del-002', name:'Weekly Summary to Management', trigger:'Every Monday 09:00', recipients:['tech-leads@ferrovial.com'], format:'PDF', plans:['All plans'], enabled:true },
    { id:'del-003', name:'XRay Sync — Toll System', trigger:'After each execution', recipients:['Jira XRay (FRV project)'], format:'XRay', plans:['Toll Collection System E2E'], enabled:false },
  ],

  schedules: [
    { id:'sch-001', name:'Nightly Regression — Portal', plan:'Project Management Portal', env:'PRO', branch:'main', cron:'0 6 * * *', cronHuman:'Every day at 06:00 AM', enabled:true, lastRun:'Today 06:00', nextRun:'Tomorrow 06:00', lastStatus:'passed', last7: { passed:6, failed:1 }, autoReport:true, notifyOn:'failure', duration:'40m' },
    { id:'sch-002', name:'Nightly Regression — SAP', plan:'SAP Integration API', env:'PRO', branch:'main', cron:'0 6 * * *', cronHuman:'Every day at 06:00 AM', enabled:true, lastRun:'Today 06:00', nextRun:'Tomorrow 06:00', lastStatus:'failed', last7: { passed:3, failed:4 }, autoReport:true, notifyOn:'always', duration:'22m' },
    { id:'sch-003', name:'Health Check — Hourly', plan:'Project Management Portal', env:'PRO', branch:'main', cron:'0 * * * *', cronHuman:'Every hour', enabled:true, lastRun:'13:00', nextRun:'14:00', lastStatus:'passed', last7: { passed:160, failed:8 }, autoReport:false, notifyOn:'failure', duration:'4m', tags:['health-check','5-basic-tests'] },
    { id:'sch-004', name:'PR Validation — Portal', plan:'Project Management Portal', env:'DEV', branch:'feature/*', cron:null, cronHuman:'On PR with label: qa-portal', enabled:true, lastRun:'Today 10:00', nextRun:'On next PR', lastStatus:'passed', last7: { passed:4, failed:1 }, autoReport:false, notifyOn:'failure', prLabels:['qa-portal','qa-regression'], duration:'16m' },
    { id:'sch-005', name:'PR Validation — By Vertical', plan:'All Plans', env:'DEV', branch:'hotfix/*', cron:null, cronHuman:'On PR with vertical label', enabled:true, lastRun:'Today 08:00', nextRun:'On next PR', lastStatus:'passed', last7: { passed:3, failed:0 }, autoReport:true, notifyOn:'always', prLabels:['qa-tolls','qa-safety','qa-assets','qa-portal'], duration:'12m' },
    { id:'sch-006', name:'Weekly Full Suite', plan:'All Plans', env:'PRO', branch:'main', cron:'0 7 * * 1', cronHuman:'Every Monday at 07:00', enabled:true, lastRun:'Jun 2 07:00', nextRun:'Jun 9 07:00', lastStatus:'passed', last7: { passed:1, failed:0 }, autoReport:true, notifyOn:'always', duration:'50m' },
    { id:'sch-007', name:'Develop Branch — Assets', plan:'Asset Inventory API', env:'DEV', branch:'develop', cron:'0 */4 * * *', cronHuman:'Every 4 hours', enabled:false, lastRun:'Jun 1 16:00', nextRun:'—', lastStatus:'passed', last7: { passed:6, failed:0 }, autoReport:false, notifyOn:'failure', duration:'20m' },
  ],

  connectors: [
    { id:'con-001', name:'Jira + XRay', type:'task_tracker', icon:'jira', status:'connected', description:'Test management, execution tracking & requirements traceability', config:{ project:'FRV', board:'Sprint Board', url:'ferrovial.atlassian.net', xrayCloud:'Enabled', testExecutionIssueType:'Test Execution' }, lastSync:'5m ago' },
    { id:'con-002', name:'Azure DevOps', type:'code_repo', icon:'git', status:'connected', description:'Source code, PR triggers & CI/CD pipeline integration', config:{ org:'ferrovial', repos:['project-portal','sap-integration','toll-system','asset-api','mobile-inspector'], url:'dev.azure.com/ferrovial', prTrigger:'Enabled' }, lastSync:'2m ago' },
    { id:'con-003', name:'Azure Blob Storage', type:'storage', icon:'doc', status:'connected', description:'Test artifacts, screenshots & documentation', config:{ container:'qa-artifacts', region:'West Europe' }, lastSync:'45m ago' },
    { id:'con-004', name:'SharePoint', type:'storage', icon:'doc', status:'connected', description:'Shared documentation & project specs', config:{ site:'ferrovial.sharepoint.com/qa' }, lastSync:'1h ago' },
    { id:'con-005', name:'Microsoft Teams', type:'notification', icon:'chat', status:'connected', description:'Notifications & alerts by channel', config:{ tenant:'Ferrovial', channels:['#qa-alerts','#qa-portal','#qa-tolls','#qa-sap'] }, lastSync:'Active' },
    { id:'con-006', name:'SAP S/4HANA (Sandbox)', type:'external', icon:'api', status:'error', description:'ERP integration test environment', config:{ mode:'sandbox', url:'sap-sandbox.ferrovial.com' }, lastSync:'Failed 2h ago', error:'Sandbox under maintenance' },
    { id:'con-007', name:'SendGrid', type:'external', icon:'send', status:'connected', description:'Transactional email verification & delivery testing', config:{ apiKey:'SG.***' }, lastSync:'Active' },
    { id:'con-008', name:'OpenAPI Spec', type:'api_spec', icon:'api', status:'connected', description:'API definitions & schemas for portal services', config:{ version:'v2.8', endpoints:64 }, lastSync:'3h ago' },
    { id:'con-009', name:'GitHub', type:'code_repo', icon:'git', status:'not_configured', description:'Alternative Git hosting', config:null, lastSync:null },
    { id:'con-010', name:'Slack', type:'notification', icon:'chat', status:'not_configured', description:'Team notifications', config:null, lastSync:null },
  ],

  teamMembers: [
    { name:'Javier Moreno', email:'jmoreno@ferrovial.com', role:'Admin', status:'active', lastActive:'Just now', initials:'JM' },
    { name:'Ana Ruiz', email:'aruiz@ferrovial.com', role:'QA Expert', status:'active', lastActive:'2h ago', initials:'AR' },
    { name:'Pablo García', email:'pgarcia@ferrovial.com', role:'QA Expert', status:'active', lastActive:'4h ago', initials:'PG' },
    { name:'Laura Fernández', email:'lfernandez@ferrovial.com', role:'Viewer', status:'active', lastActive:'1d ago', initials:'LF' },
    { name:'Carlos Sánchez', email:'csanchez@ferrovial.com', role:'QA Expert', status:'pending', lastActive:'Invited', initials:'CS' },
  ],

  ssoProviders: [
    { name:'Microsoft Azure AD', status:'active', protocol:'SAML 2.0', domain:'ferrovial.com', lastLogin:'Today 13:20', users:28 },
    { name:'Okta', status:'inactive', protocol:'OIDC', domain:'ferrovial.com', lastLogin:'Never', users:0 },
  ],

  notificationChannels: [
    { id:'email', name:'Email', icon:'send', status:'connected', config:'SMTP via SendGrid', recipients:5 },
    { id:'teams', name:'Microsoft Teams', icon:'chat', status:'connected', config:'Connected to Ferrovial tenant', recipients:4 },
    { id:'slack', name:'Slack', icon:'chat', status:'not_configured', config:null, recipients:0 },
    { id:'webhook', name:'Webhook', icon:'connectors', status:'connected', config:'https://hooks.ferrovial.com/qa-alerts', recipients:1 },
    { id:'pagerduty', name:'PagerDuty', icon:'bell', status:'not_configured', config:null, recipients:0 },
  ],
};

window.QAAP_DATA = QAAP_DATA;
