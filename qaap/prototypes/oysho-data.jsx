// QAAP Mock Data — Oysho Fashion & Sportswear QA
const QAAP_DATA = {
  user: { name: 'Clara Domínguez', email: 'cdominguez@oysho.com', role: 'QA Lead', initials: 'CD' },
  tenant: { name: 'Oysho', slug: 'oysho', logo: 'assets/oysho-logo.png' },

  testPlans: [
    { id:'tp-001', name:'Product Catalog E2E', modality:'web', framework:'Playwright', status:'approved', scenarioCount:28, passRate:97, lastUpdated:'1h ago', assignedTo:'Clara Domínguez', health:'healthy', trend:[95,94,96,95,97,96,98,97,97], market:'Global', vertical:'Catalog', platforms:['Desktop','Mobile'] },
    { id:'tp-002', name:'Checkout & Payment Flow', modality:'web', framework:'Playwright', status:'approved', scenarioCount:22, passRate:94, lastUpdated:'2h ago', assignedTo:'Clara Domínguez', health:'healthy', trend:[92,91,93,92,95,94,96,93,94], market:'Global', vertical:'Checkout', platforms:['Desktop','Mobile'] },
    { id:'tp-003', name:'Inventory Sync API', modality:'api', framework:'Karate', status:'review', scenarioCount:16, passRate:89, lastUpdated:'30m ago', assignedTo:'Nuria Campos', health:'degrading', trend:[96,94,92,90,88,91,89,87,89], market:'Global', vertical:'Inventory', platforms:['API'] },
    { id:'tp-004', name:'Order Management API', modality:'api', framework:'Karate', status:'approved', scenarioCount:30, passRate:99, lastUpdated:'4h ago', assignedTo:'Marcos Prieto', health:'healthy', trend:[98,99,99,98,99,99,100,99,99], market:'Global', vertical:'Orders', platforms:['API'] },
    { id:'tp-005', name:'Size Recommender Module', modality:'web', framework:'Cypress', status:'generating', scenarioCount:10, passRate:null, lastUpdated:'15m ago', assignedTo:'Nuria Campos', health:null, trend:[], market:'Global', vertical:'UX', platforms:['Desktop','Mobile'] },
    { id:'tp-006', name:'iOS Shopping App', modality:'ios', framework:'XCTest', status:'draft', scenarioCount:8, passRate:null, lastUpdated:'2d ago', assignedTo:'Marcos Prieto', health:null, trend:[], market:'Global', vertical:'Mobile', platforms:['iOS'] },
    { id:'tp-007', name:'Returns & Exchanges', modality:'web', framework:'Playwright', status:'approved', scenarioCount:18, passRate:95, lastUpdated:'3h ago', assignedTo:'Clara Domínguez', health:'healthy', trend:[93,94,95,94,96,95,97,95,95], market:'Spain', vertical:'Support', platforms:['Desktop','Mobile'] },
    { id:'tp-008', name:'Promotions & Discount Engine', modality:'api', framework:'Karate', status:'review', scenarioCount:14, passRate:84, lastUpdated:'1d ago', assignedTo:'Nuria Campos', health:'degrading', trend:[91,89,87,85,84,83,82,84,84], market:'Global', vertical:'Marketing', platforms:['API'] },
  ],

  scenarios: [
    { id:'s-001', name:'Browse product by category', confidence:96, status:'approved', feature:'Catalog' },
    { id:'s-002', name:'Add item to cart with size selection', confidence:93, status:'approved', feature:'Cart' },
    { id:'s-003', name:'Apply seasonal discount code', confidence:89, status:'approved', feature:'Promotions' },
    { id:'s-004', name:'Process return with store pickup', confidence:68, status:'pending', feature:'Returns' },
    { id:'s-005', name:'Guest checkout without account', confidence:92, status:'approved', feature:'Checkout' },
    { id:'s-006', name:'Wishlist sync across devices', confidence:86, status:'pending', feature:'UX' },
    { id:'s-007', name:'VAT calculation per country', confidence:95, status:'approved', feature:'Payments' },
    { id:'s-008', name:'Payment with Apple Pay', confidence:47, status:'rejected', feature:'Payments' },
    { id:'s-009', name:'Size guide recommendation', confidence:74, status:'pending', feature:'UX' },
    { id:'s-010', name:'Order tracking real-time updates', confidence:99, status:'approved', feature:'Orders' },
    { id:'s-011', name:'Product image zoom & gallery', confidence:91, status:'approved', feature:'Catalog' },
    { id:'s-012', name:'Shipping confirmation email', confidence:87, status:'approved', feature:'Notifications' },
    { id:'s-013', name:'Out-of-stock back-in-stock alert', confidence:94, status:'approved', feature:'Inventory' },
    { id:'s-014', name:'Filter by color and size', confidence:79, status:'pending', feature:'Catalog' },
    { id:'s-015', name:'Flash sale concurrent purchase', confidence:54, status:'rejected', feature:'Promotions' },
  ],

  gherkinContent: `Feature: Product Checkout
  As a customer
  I want to purchase items from the Oysho store
  So that I receive my sportswear order

  @approved @confidence:96
  Scenario: Browse and purchase product
    Given I am on the Oysho homepage
    When I navigate to "Sport" > "Leggings"
    And I select "High-Waist Training Leggings"
    And I choose size "M" and color "Black"
    And I click "Add to bag"
    Then the cart should show 1 item
    When I proceed to checkout
    And I enter shipping details
    And I pay with credit card
    Then I should see order confirmation`,

  generatedCode: `import { test, expect } from '@playwright/test';

test.describe('Product Catalog', () => {
  test('browse and add to cart', async ({ page }) => {
    await page.goto('/sport/leggings');
    await page.click('[data-testid="product-high-waist-training"]');
    await page.click('[data-testid="size-M"]');
    await page.click('[data-testid="add-to-bag"]');
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');
  });
});`,

  chatMessages: [
    { role:'system', content:'Plan loaded: Product Catalog E2E — 28 scenarios. Sources: Jira (OYSHO-Sprint-42), GitHub (oysho/web-store), API spec v5.0.' },
    { role:'user', content:'Add test for flash sale stock depletion' },
    { role:'assistant', content:'Added **Scenario: Flash sale concurrent purchase**. Confidence: 54% — Race condition in stock reservation under high concurrency.', model:'Claude Sonnet 4' },
  ],

  executions: [
    { id:'ex-001', date:'Today 14:45', env:'PRE', status:'passed', passRate:94, duration:'5m 42s', trigger:'manual', passed:26, failed:2, skipped:0 },
    { id:'ex-002', date:'Today 08:00', env:'PRE', status:'failed', passRate:86, duration:'5m 10s', trigger:'cron', passed:24, failed:4, skipped:0 },
    { id:'ex-003', date:'Yesterday 22:00', env:'PRO', status:'passed', passRate:100, duration:'6m 30s', trigger:'cron', passed:28, failed:0, skipped:0 },
    { id:'ex-004', date:'Yesterday 15:30', env:'DEV', status:'passed', passRate:91, duration:'4m 20s', trigger:'webhook', passed:25, failed:3, skipped:0 },
    { id:'ex-005', date:'Jun 2 08:00', env:'PRE', status:'failed', passRate:82, duration:'5m 50s', trigger:'cron', passed:23, failed:5, skipped:0 },
  ],

  recentActivity: [
    { type:'execution', text:'Product Catalog E2E passed on PRE', time:'2h ago', status:'success' },
    { type:'generation', text:'Size Recommender generating…', time:'15m ago', status:'info' },
    { type:'review', text:'Inventory Sync API needs review', time:'30m ago', status:'warning' },
    { type:'approval', text:'Order Management approved', time:'4h ago', status:'success' },
    { type:'alert', text:'Promotions Engine pass rate below 85%', time:'1h ago', status:'error' },
    { type:'proposal', text:'AI suggested 3 new tests for Catalog', time:'5h ago', status:'info' },
  ],

  healthMetrics: { overallPassRate:93.5, totalExecutions:190, flakyTests:4, coverageScore:84 },
  healthPlans: [
    { name:'Product Catalog E2E', health:'healthy', passRate:97, trend:[95,94,96,95,97,96,98,97,97], lastRun:'1h ago', scenarios:28 },
    { name:'Inventory Sync API', health:'degrading', passRate:89, trend:[96,94,92,90,88,91,89,87,89], lastRun:'30m ago', scenarios:16 },
    { name:'Checkout & Payment Flow', health:'healthy', passRate:94, trend:[92,91,93,92,95,94,96,93,94], lastRun:'2h ago', scenarios:22 },
    { name:'Order Management API', health:'healthy', passRate:99, trend:[98,99,99,98,99,99,100,99,99], lastRun:'4h ago', scenarios:30 },
  ],
  flakyTests: [
    { name:'Product image lazy loading', plan:'Product Catalog E2E', flakeRate:24, lastFlake:'Today 08:00' },
    { name:'Inventory cache invalidation', plan:'Inventory Sync API', flakeRate:20, lastFlake:'Yesterday' },
    { name:'Discount code race condition', plan:'Promotions & Discount Engine', flakeRate:16, lastFlake:'Jun 2' },
    { name:'Cart merge on login', plan:'Checkout & Payment Flow', flakeRate:10, lastFlake:'Jun 1' },
  ],
  alerts: [
    { severity:'critical', message:'Promotions Engine pass rate dropped to 84%', time:'1h ago', plan:'Promotions & Discount Engine' },
    { severity:'warning', message:'Flaky: Product image lazy loading (24%)', time:'3h ago', plan:'Product Catalog E2E' },
    { severity:'info', message:'Checkout flow recovered to healthy', time:'2h ago', plan:'Checkout & Payment Flow' },
  ],
  executionDetails: [
    { id:'ex-001', date:'Today 14:45', env:'PRE', status:'passed', passRate:94, duration:'5m 42s', trigger:'manual', triggeredBy:'Clara Domínguez', branch:'main', passed:26, failed:2, skipped:0, results:[
      { scenario:'Browse product by category', status:'passed', duration:'10.5s' },
      { scenario:'Add item to cart with size selection', status:'passed', duration:'8.2s' },
      { scenario:'Process return with store pickup', status:'failed', duration:'18.7s', error:'Store locator API returned empty results for postal code 28001', screenshot:'return-pickup-fail.png', classification:'Data Issue', rootCause:'Store database was refreshing — pickup locations temporarily unavailable.' },
    ]},
    { id:'ex-002', date:'Today 08:00', env:'PRE', status:'failed', passRate:86, duration:'5m 10s', trigger:'cron', triggeredBy:'Scheduled', branch:'main', passed:24, failed:4, skipped:0, results:[] },
    { id:'ex-003', date:'Yesterday 22:00', env:'PRO', status:'passed', passRate:100, duration:'6m 30s', trigger:'cron', triggeredBy:'Scheduled', branch:'main', passed:28, failed:0, skipped:0, results:[] },
  ],
  aiProposals: [
    { id:'prop-001', type:'bug_detection', title:'Flash sale stock oversell', description:'Under concurrent load, inventory can go negative during flash sales.', confidence:92, status:'proposed', source:'Execution #175', affectedFiles:['src/services/StockReservationService.ts'], plan:'Inventory Sync API', diff:null },
    { id:'prop-002', type:'coverage_gap', title:'No tests for multi-currency checkout', description:'International shoppers paying in USD/GBP have zero E2E coverage.', confidence:78, status:'proposed', source:'Source analysis', affectedFiles:['src/services/CurrencyService.ts'], plan:'Checkout & Payment Flow', diff:null },
    { id:'prop-003', type:'fix_proposal', title:'Update product API pagination format', description:'API changed from offset to cursor-based pagination in v5.0.', confidence:98, status:'accepted', source:'Execution #175', affectedFiles:['tests/e2e/catalog.spec.ts'], plan:'Product Catalog E2E', diff:null },
  ],
  reports: [
    { id:'rep-001', name:'Catalog — Nightly Regression', plan:'Product Catalog E2E', execution:'ex-001', format:'HTML', date:'Today 14:50', status:'ready', size:'2.6 MB' },
    { id:'rep-002', name:'Sprint 42 — QA Summary', plan:null, execution:null, format:'PDF', date:'Yesterday', status:'ready', size:'3.9 MB' },
  ],
  deliveryConfigs: [
    { id:'del-001', name:'Nightly QA Report', trigger:'After nightly regression', recipients:['qa@oysho.com','#qa-ecommerce (Slack)'], format:'HTML', plans:['Product Catalog E2E','Checkout & Payment Flow'], enabled:true },
  ],
  schedules: [
    { id:'sch-001', name:'Nightly — Catalog', plan:'Product Catalog E2E', env:'PRO', branch:'main', cron:'0 5 * * *', cronHuman:'Every day at 05:00 AM', enabled:true, lastRun:'Today 05:00', nextRun:'Tomorrow 05:00', lastStatus:'passed', last7:{passed:6,failed:1}, autoReport:true, notifyOn:'failure', duration:'32m' },
    { id:'sch-002', name:'Weekly Full Suite', plan:'All Plans', env:'PRO', branch:'main', cron:'0 6 * * 1', cronHuman:'Every Monday at 06:00', enabled:true, lastRun:'Jun 2 06:00', nextRun:'Jun 9 06:00', lastStatus:'passed', last7:{passed:1,failed:0}, autoReport:true, notifyOn:'always', duration:'52m' },
  ],
  connectors: [
    { id:'con-001', name:'Jira', type:'task_tracker', icon:'jira', status:'connected', description:'Sprint tracking & test management', config:{ project:'OYSHO', url:'inditex.atlassian.net' }, lastSync:'2m ago' },
    { id:'con-002', name:'GitHub', type:'code_repo', icon:'git', status:'connected', description:'Source code & CI/CD', config:{ org:'inditex', repos:['oysho-web','oysho-api','oysho-inventory'] }, lastSync:'1m ago' },
    { id:'con-003', name:'AWS S3', type:'storage', icon:'doc', status:'connected', description:'Test artifacts & screenshots', config:{ bucket:'oysho-qa', region:'eu-west-1' }, lastSync:'15m ago' },
    { id:'con-004', name:'Slack', type:'notification', icon:'chat', status:'connected', description:'Notifications & alerts', config:{ workspace:'Inditex Tech', channels:['#oysho-qa'] }, lastSync:'Active' },
    { id:'con-005', name:'Adyen', type:'external', icon:'api', status:'connected', description:'Payment gateway', config:{ mode:'test' }, lastSync:'30m ago' },
    { id:'con-006', name:'Algolia', type:'external', icon:'api', status:'connected', description:'Product search & recommendations', config:{ index:'oysho_products' }, lastSync:'10m ago' },
  ],
  teamMembers: [
    { name:'Clara Domínguez', email:'cdominguez@oysho.com', role:'Admin', status:'active', lastActive:'Just now', initials:'CD' },
    { name:'Nuria Campos', email:'ncampos@oysho.com', role:'QA Expert', status:'active', lastActive:'1h ago', initials:'NC' },
    { name:'Marcos Prieto', email:'mprieto@oysho.com', role:'QA Expert', status:'active', lastActive:'3h ago', initials:'MP' },
    { name:'Inés Gallego', email:'igallego@oysho.com', role:'Viewer', status:'active', lastActive:'1d ago', initials:'IG' },
  ],
  ssoProviders: [
    { name:'Okta', status:'active', protocol:'SAML 2.0', domain:'oysho.com', lastLogin:'Today 14:45', users:28 },
  ],
  notificationChannels: [
    { id:'email', name:'Email', icon:'send', status:'connected', config:'SMTP via Google Workspace', recipients:4 },
    { id:'slack', name:'Slack', icon:'chat', status:'connected', config:'Inditex Tech workspace', recipients:3 },
    { id:'webhook', name:'Webhook', icon:'connectors', status:'connected', config:'https://hooks.oysho.com/qa', recipients:1 },
  ],
};
window.QAAP_DATA = QAAP_DATA;