// QAAP Mock Data — realistic e-commerce QA scenarios
const QAAP_DATA = {
  user: { name: 'Elena García', email: 'elena.garcia@techmart.com', role: 'QA Lead', initials: 'EG' },
  tenant: { name: 'TechMart', slug: 'techmart', logo: null },

  testPlans: [
    { id:'tp-001', name:'Checkout Flow E2E', modality:'web', framework:'Playwright', status:'approved', scenarioCount:24, passRate:96, lastUpdated:'2h ago', assignedTo:'Elena García', health:'healthy', trend:[94,92,95,93,97,96,98,95,96], market:'Spain', vertical:'Checkout', platforms:['Desktop','Mobile'] },
    { id:'tp-002', name:'Payment Gateway API', modality:'api', framework:'Karate', status:'review', scenarioCount:18, passRate:88, lastUpdated:'45m ago', assignedTo:'Elena García', health:'degrading', trend:[96,94,91,89,87,90,88,86,88], market:'All', vertical:'Payments', platforms:['API'] },
    { id:'tp-003', name:'Product Search & Filters', modality:'web', framework:'Cypress', status:'generating', scenarioCount:12, passRate:null, lastUpdated:'12m ago', assignedTo:'Carlos Ruiz', health:null, trend:[], market:'Spain', vertical:'Catalog', platforms:['Desktop','Mobile'] },
    { id:'tp-004', name:'User Authentication', modality:'web', framework:'Playwright', status:'draft', scenarioCount:8, passRate:91, lastUpdated:'1d ago', assignedTo:'Elena García', health:'healthy', trend:[89,90,88,91,90,92,91,91], market:'Spain', vertical:'Auth', platforms:['Desktop','Mobile'] },
    { id:'tp-005', name:'Order Management API', modality:'api', framework:'Karate', status:'approved', scenarioCount:31, passRate:99, lastUpdated:'3h ago', assignedTo:'Marta López', health:'healthy', trend:[97,98,99,98,99,99,100,99,99], market:'All', vertical:'Orders', platforms:['API'] },
    { id:'tp-006', name:'Mobile App Login', modality:'ios', framework:'XCTest', status:'draft', scenarioCount:6, passRate:null, lastUpdated:'2d ago', assignedTo:'Carlos Ruiz', health:null, trend:[], market:'Spain', vertical:'Auth', platforms:['iOS'] },
    { id:'tp-007', name:'France Market Flows', modality:'web', framework:'Playwright', status:'approved', scenarioCount:15, passRate:94, lastUpdated:'5h ago', assignedTo:'Marta López', health:'healthy', trend:[91,93,92,94,93,95,94,94,94], market:'France', vertical:'Checkout', platforms:['Desktop'] },
    { id:'tp-008', name:'Newsletter & Transactional Emails', modality:'api', framework:'Karate', status:'review', scenarioCount:9, passRate:82, lastUpdated:'1d ago', assignedTo:'Carlos Ruiz', health:'degrading', trend:[90,88,85,84,83,82,81,82,82], market:'All', vertical:'Notifications', platforms:['API'] },
  ],

  scenarios: [
    { id:'s-001', name:'Successful checkout with credit card', confidence:95, status:'approved', feature:'Checkout' },
    { id:'s-002', name:'Checkout with saved address', confidence:92, status:'approved', feature:'Checkout' },
    { id:'s-003', name:'Apply discount code at checkout', confidence:88, status:'approved', feature:'Checkout' },
    { id:'s-004', name:'Checkout with expired credit card', confidence:67, status:'pending', feature:'Payment' },
    { id:'s-005', name:'Guest checkout flow', confidence:91, status:'approved', feature:'Checkout' },
    { id:'s-006', name:'Add new shipping address during checkout', confidence:85, status:'pending', feature:'Shipping' },
    { id:'s-007', name:'Order total with tax calculation', confidence:94, status:'approved', feature:'Pricing' },
    { id:'s-008', name:'Payment retry after 3DS failure', confidence:45, status:'rejected', feature:'Payment' },
    { id:'s-009', name:'Checkout with multiple payment methods', confidence:72, status:'pending', feature:'Payment' },
    { id:'s-010', name:'Empty cart redirect', confidence:98, status:'approved', feature:'Cart' },
    { id:'s-011', name:'Shipping method selection', confidence:90, status:'approved', feature:'Shipping' },
    { id:'s-012', name:'Order confirmation email', confidence:86, status:'approved', feature:'Notifications' },
    { id:'s-013', name:'Promo code validation — invalid code', confidence:93, status:'approved', feature:'Checkout' },
    { id:'s-014', name:'Back navigation preserves cart state', confidence:78, status:'pending', feature:'Cart' },
    { id:'s-015', name:'Concurrent checkout race condition', confidence:52, status:'rejected', feature:'Checkout' },
  ],

  gherkinContent: `Feature: Checkout Flow
  As a registered user
  I want to complete the checkout process
  So that I can purchase items in my cart

  @approved @confidence:95
  Scenario: Successful checkout with credit card
    Given I am logged in as "testuser@techmart.com"
    And I have 3 items in my cart totaling €149.97
    When I navigate to the checkout page
    Then I should see the order summary with 3 items
    And the total should display "€149.97"
    When I select shipping address "Home - Calle Mayor 12, Madrid"
    And I select "Standard Delivery (3-5 days)"
    And I select "Credit Card" as payment method
    And I enter card number "4242 4242 4242 4242"
    And I enter expiry date "12/27"
    And I enter CVV "123"
    And I click "Place Order"
    Then I should see the order confirmation page
    And the confirmation should show order number matching "ORD-\\\\d+"
    And I should receive a confirmation email within 60 seconds
    And my cart should be empty

  @pending @confidence:67
  Scenario: Checkout with expired credit card
    Given I am logged in as "testuser@techmart.com"
    And I have items in my cart
    When I navigate to the checkout page
    And I select "Credit Card" as payment method
    And I enter card number "4000 0000 0000 0069"
    And I enter expiry date "01/20"
    And I enter CVV "123"
    And I click "Place Order"
    Then I should see error message "Your card has expired"
    And I should remain on the payment step
    And no order should be created

  @approved @confidence:88
  Scenario: Apply discount code at checkout
    Given I am logged in as "testuser@techmart.com"
    And I have items in my cart totaling €200.00
    When I navigate to the checkout page
    And I enter promo code "SUMMER25"
    And I click "Apply"
    Then the discount should show "-€50.00"
    And the new total should display "€150.00"
    When I complete the payment
    Then the order should reflect the discounted total`,

  generatedCode: `import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'testuser@techmart.com');
    await page.fill('[data-testid="password"]', 'TestPass123!');
    await page.click('[data-testid="login-btn"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('successful checkout with credit card', async ({ page }) => {
    // Add items to cart
    await page.goto('/products');
    for (const product of ['SKU-001', 'SKU-002', 'SKU-003']) {
      await page.click(\`[data-testid="add-to-cart-\${product}"]\`);
    }

    // Navigate to checkout
    await page.click('[data-testid="cart-icon"]');
    await page.click('[data-testid="checkout-btn"]');
    await expect(page.locator('[data-testid="order-summary"]'))
      .toContainText('3 items');
    await expect(page.locator('[data-testid="total"]'))
      .toContainText('€149.97');

    // Shipping
    await page.click('[data-testid="address-home"]');
    await page.click('[data-testid="shipping-standard"]');

    // Payment
    await page.click('[data-testid="payment-card"]');
    const cardFrame = page.frameLocator('[data-testid="card-frame"]');
    await cardFrame.locator('[name="cardNumber"]')
      .fill('4242424242424242');
    await cardFrame.locator('[name="expiry"]').fill('1227');
    await cardFrame.locator('[name="cvv"]').fill('123');

    // Place order
    await page.click('[data-testid="place-order"]');
    await expect(page.locator('[data-testid="confirmation"]'))
      .toBeVisible();
    await expect(page.locator('[data-testid="order-number"]'))
      .toHaveText(/ORD-\\d+/);
  });
});`,

  chatMessages: [
    { role:'system', content:'Plan loaded: Checkout Flow E2E — 24 scenarios, 18 approved, 4 pending, 2 rejected. Sources: Jira (TM-Sprint-47), GitHub (techmart/web-frontend), OpenAPI spec v3.1.' },
    { role:'user', content:'Add a negative test for payment gateway timeout' },
    { role:'assistant', content:'I\'ve added **Scenario 25: Payment gateway timeout handling**. It covers the case where the payment provider doesn\'t respond within 30 seconds.\n\nThe scenario verifies:\n• User sees "Payment processing is taking longer than expected"\n• Retry button becomes available after timeout\n• Cart and shipping selections are preserved\n\n**Confidence: 78%** — I\'d recommend confirming the timeout threshold with the backend team.', model:'Claude Sonnet 4' },
    { role:'user', content:'Check if we cover the 3DS authentication flow' },
    { role:'assistant', content:'Looking at the current plan, Scenario 8 covers "Payment retry after 3DS failure" but has **low confidence (45%)**. Issues:\n\n1. 3DS redirect URL pattern isn\'t in the connected OpenAPI spec\n2. Test environment lacks 3DS sandbox credentials\n\nI recommend:\n• Adding 3DS sandbox config to environment settings\n• Splitting into 3 scenarios: successful 3DS, failed 3DS, 3DS timeout\n\nWant me to generate these scenarios?', model:'Claude Sonnet 4' },
  ],

  executions: [
    { id:'ex-001', date:'Today 14:32', env:'PRE', status:'passed', passRate:96, duration:'4m 12s', trigger:'manual', passed:23, failed:1, skipped:0 },
    { id:'ex-002', date:'Today 09:15', env:'PRE', status:'failed', passRate:88, duration:'3m 58s', trigger:'cron', passed:21, failed:3, skipped:0 },
    { id:'ex-003', date:'Yesterday 22:00', env:'PRO', status:'passed', passRate:100, duration:'4m 45s', trigger:'cron', passed:24, failed:0, skipped:0 },
    { id:'ex-004', date:'Yesterday 14:00', env:'DEV', status:'passed', passRate:92, duration:'3m 30s', trigger:'webhook', passed:22, failed:2, skipped:0 },
    { id:'ex-005', date:'Jun 2 09:00', env:'PRE', status:'failed', passRate:83, duration:'4m 01s', trigger:'cron', passed:20, failed:4, skipped:0 },
  ],

  recentActivity: [
    { type:'execution', text:'Checkout Flow E2E passed on PRE', time:'2h ago', status:'success' },
    { type:'generation', text:'Product Search & Filters generating…', time:'12m ago', status:'info' },
    { type:'review', text:'Payment Gateway API needs review', time:'45m ago', status:'warning' },
    { type:'approval', text:'Order Management API approved by Elena', time:'3h ago', status:'success' },
    { type:'alert', text:'Payment Gateway pass rate below 90%', time:'1h ago', status:'error' },
    { type:'proposal', text:'AI suggested 3 new test cases for Auth', time:'4h ago', status:'info' },
  ],

  healthMetrics: { overallPassRate:94.2, totalExecutions:147, flakyTests:3, coverageScore:82 },

  healthPlans: [
    { name:'Checkout Flow E2E', health:'healthy', passRate:96, trend:[94,92,95,93,97,96,98,95,96], lastRun:'2h ago', scenarios:24 },
    { name:'Payment Gateway API', health:'degrading', passRate:88, trend:[96,94,91,89,87,90,88,86,88], lastRun:'45m ago', scenarios:18 },
    { name:'User Authentication', health:'healthy', passRate:91, trend:[89,90,88,91,90,92,91,91,93], lastRun:'1d ago', scenarios:8 },
    { name:'Order Management API', health:'healthy', passRate:99, trend:[97,98,99,98,99,99,100,99,99], lastRun:'3h ago', scenarios:31 },
  ],

  flakyTests: [
    { name:'Payment retry after gateway reset', plan:'Payment Gateway API', flakeRate:34, lastFlake:'Today 09:15' },
    { name:'Search filter sort order', plan:'Product Search & Filters', flakeRate:22, lastFlake:'Yesterday' },
    { name:'Session token refresh timing', plan:'User Authentication', flakeRate:15, lastFlake:'Jun 2' },
  ],

  alerts: [
    { severity:'critical', message:'Payment Gateway pass rate dropped to 88%', time:'1h ago', plan:'Payment Gateway API' },
    { severity:'warning', message:'Flaky test detected: Payment retry after gateway reset (34% flake rate)', time:'3h ago', plan:'Payment Gateway API' },
    { severity:'info', message:'Checkout Flow E2E recovered to healthy status', time:'2h ago', plan:'Checkout Flow E2E' },
  ],

  // ─── Execution Detail Data ───
  executionDetails: [
    { id:'ex-001', date:'Today 14:32', env:'PRE', status:'passed', passRate:96, duration:'4m 12s', trigger:'manual', triggeredBy:'Elena García', branch:'main', passed:23, failed:1, skipped:0,
      results: [
        { scenario:'Successful checkout with credit card', status:'passed', duration:'12.3s' },
        { scenario:'Checkout with saved address', status:'passed', duration:'8.7s' },
        { scenario:'Apply discount code at checkout', status:'passed', duration:'9.1s' },
        { scenario:'Checkout with expired credit card', status:'failed', duration:'15.2s', error:'Expected error message "Your card has expired" but got "Payment declined"', screenshot:'checkout-expired-card-fail.png', classification:'Assertion Mismatch', rootCause:'The error message was updated in the latest API release (v2.4.1) to use a generic "Payment declined" message instead of specific reasons. The test assertion needs to be updated to match the new copy.' },
        { scenario:'Guest checkout flow', status:'passed', duration:'11.4s' },
        { scenario:'Add new shipping address during checkout', status:'passed', duration:'13.8s' },
        { scenario:'Order total with tax calculation', status:'passed', duration:'7.2s' },
        { scenario:'Payment retry after 3DS failure', status:'passed', duration:'18.6s' },
        { scenario:'Empty cart redirect', status:'passed', duration:'3.1s' },
        { scenario:'Shipping method selection', status:'passed', duration:'6.9s' },
      ]
    },
    { id:'ex-002', date:'Today 09:15', env:'PRE', status:'failed', passRate:88, duration:'3m 58s', trigger:'cron', triggeredBy:'Scheduled', branch:'main', passed:21, failed:3, skipped:0,
      results: [
        { scenario:'Successful checkout with credit card', status:'passed', duration:'11.9s' },
        { scenario:'Checkout with expired credit card', status:'failed', duration:'14.8s', error:'Timeout waiting for error message element', classification:'Timeout', rootCause:'The payment gateway sandbox was experiencing high latency (>30s response time). This is an infrastructure issue, not a code bug.' },
        { scenario:'Payment retry after 3DS failure', status:'failed', duration:'30.1s', error:'3DS iframe did not load within timeout', classification:'Environment Issue', rootCause:'3DS sandbox credentials expired on June 3rd. Needs renewal in Stripe dashboard.' },
        { scenario:'Concurrent checkout race condition', status:'failed', duration:'22.4s', error:'Expected order count to be 1 but got 2', classification:'Race Condition', rootCause:'The optimistic locking mechanism in the checkout service has a known timing window of ~50ms where duplicate orders can be created under concurrent load.' },
      ]
    },
    { id:'ex-003', date:'Yesterday 22:00', env:'PRO', status:'passed', passRate:100, duration:'4m 45s', trigger:'cron', triggeredBy:'Scheduled', branch:'main', passed:24, failed:0, skipped:0, results:[] },
    { id:'ex-004', date:'Yesterday 14:00', env:'DEV', status:'passed', passRate:92, duration:'3m 30s', trigger:'webhook', triggeredBy:'PR #347', branch:'feature/new-payment', passed:22, failed:2, skipped:0, results:[] },
    { id:'ex-005', date:'Jun 2 09:00', env:'PRE', status:'failed', passRate:83, duration:'4m 01s', trigger:'cron', triggeredBy:'Scheduled', branch:'main', passed:20, failed:4, skipped:0, results:[] },
  ],

  // ─── AI Proposals Data ───
  aiProposals: [
    { id:'prop-001', type:'bug_detection', title:'Race condition in concurrent checkout', description:'Analysis of Execution #47 revealed a timing window where two simultaneous checkout requests can create duplicate orders. The optimistic lock in OrderService.createOrder() has a ~50ms vulnerability window.', confidence:92, status:'proposed', source:'Detected from Execution #47', affectedFiles:['src/services/OrderService.ts', 'src/middleware/lockMiddleware.ts'], plan:'Checkout Flow E2E',
      diff:`- async createOrder(cart: Cart): Promise<Order> {
-   const existing = await this.orderRepo.findByCartId(cart.id);
-   if (existing) throw new DuplicateOrderError();
+ async createOrder(cart: Cart): Promise<Order> {
+   return await this.orderRepo.transaction(async (tx) => {
+     const existing = await tx.findByCartId(cart.id, { forUpdate: true });
+     if (existing) throw new DuplicateOrderError();
+     return await tx.create({ ...cart.toOrder(), status: 'pending' });
+   });` },
    { id:'prop-002', type:'test_improvement', title:'Add negative tests for payment timeout scenarios', description:'Current test suite only covers successful payment flows and card rejection. Missing coverage for gateway timeout (30s), network interruption, and partial payment states. These represent 12% of production incidents in the last 30 days.', confidence:85, status:'proposed', source:'Detected from trend analysis', affectedFiles:['tests/e2e/checkout.spec.ts'], plan:'Checkout Flow E2E',
      diff:`+ Scenario: Payment gateway timeout handling
+   Given I am logged in and have items in cart
+   When I submit payment and gateway times out after 30s
+   Then I should see "Payment is taking longer than expected"
+   And a retry button should be available
+   And my cart should be preserved` },
    { id:'prop-003', type:'fix_proposal', title:'Update expired card error assertion', description:'Test "Checkout with expired credit card" is failing because the API changed the error message from "Your card has expired" to "Payment declined" in v2.4.1. The test assertion needs updating.', confidence:98, status:'accepted', source:'Detected from Execution #47', affectedFiles:['tests/e2e/checkout.spec.ts'], plan:'Checkout Flow E2E',
      diff:`- Then I should see error message "Your card has expired"
+ Then I should see error message "Payment declined"` },
    { id:'prop-004', type:'coverage_gap', title:'No tests for order cancellation flow', description:'The order cancellation feature (added in Sprint 45) has zero E2E test coverage. This flow handles refund initiation, inventory restoration, and notification dispatch — all critical paths.', confidence:78, status:'proposed', source:'Detected from source change in commit a3f8c21', affectedFiles:['src/services/CancellationService.ts', 'src/api/orders/cancel.ts'], plan:'Order Management API',
      diff:`+ Feature: Order Cancellation
+   Scenario: Cancel pending order within grace period
+     Given an order "ORD-001" with status "pending"
+     And the order was placed less than 30 minutes ago
+     When I request cancellation
+     Then the order status should be "cancelled"
+     And a refund should be initiated
+     And inventory should be restored` },
    { id:'prop-005', type:'bug_detection', title:'3DS sandbox credentials expired', description:'The 3DS authentication tests have been failing intermittently since June 3rd. Root cause: the Stripe 3DS sandbox credentials expired. This affects 3 test scenarios in the Payment Gateway API plan.', confidence:95, status:'rejected', source:'Detected from Execution #48', affectedFiles:[], plan:'Payment Gateway API',
      diff:null },
    { id:'prop-006', type:'testid_gap', title:'Missing data-test-id on 14 interactive elements', description:'Automated scan of the web-frontend repository detected 14 interactive elements (buttons, inputs, links) in the checkout flow that lack data-test-id attributes. Without these, test selectors must rely on fragile CSS/XPath selectors that break on UI refactors. This blocks reliable automation of 6 scenarios.', confidence:97, status:'proposed', source:'Detected from repo scan (web-frontend)', affectedFiles:['src/components/Checkout/PaymentForm.tsx', 'src/components/Checkout/ShippingSelector.tsx', 'src/components/Cart/CartSummary.tsx'], plan:'Checkout Flow E2E',
      diff:`// PaymentForm.tsx — 5 elements missing data-test-id
- <button onClick={handleSubmit}>Place Order</button>
+ <button onClick={handleSubmit} data-test-id="checkout-place-order">Place Order</button>

- <input type="text" name="cardNumber" />
+ <input type="text" name="cardNumber" data-test-id="payment-card-number" />

- <select name="expiryMonth">
+ <select name="expiryMonth" data-test-id="payment-expiry-month">

// ShippingSelector.tsx — 4 elements missing
- <div className="address-option" onClick={() => select(addr)}>
+ <div className="address-option" data-test-id={\`shipping-address-\${addr.id}\`} onClick={() => select(addr)}>` },
    { id:'prop-007', type:'cross_platform', title:'Shared Gherkin → Generate iOS tests from web plan', description:'The "Checkout Flow E2E" plan currently only generates Playwright tests for web. The same Gherkin scenarios can be automatically codified for iOS using WebDriverIO + Appium, eliminating the need to manually duplicate and maintain test logic across platforms. This would save ~40h/month of manual cross-platform test synchronization.', confidence:88, status:'proposed', source:'Detected from cross-platform analysis', affectedFiles:['tests/ios/checkout.wdio.ts'], plan:'Checkout Flow E2E',
      diff:`// Auto-generated from shared Gherkin → WebDriverIO + Appium
+ describe('Checkout Flow - iOS', () => {
+   it('successful checkout with credit card', async () => {
+     await $('~login-email').setValue('testuser@techmart.com');
+     await $('~login-password').setValue('TestPass123!');
+     await $('~login-btn').click();
+     
+     // Navigate to cart
+     await $('~tab-cart').click();
+     await expect($('~cart-item-count')).toHaveText('3');
+     
+     // Checkout
+     await $('~checkout-btn').click();
+     await $('~address-home').click();
+     await $('~shipping-standard').click();
+     await $('~payment-card').click();
+     // ... generated from same Gherkin as web
+   });
+ });` },
    { id:'prop-008', type:'flaky_fix', title:'Auto-fix: Stabilize OAuth login test with token injection', description:'The "User Authentication" test fails intermittently (34% flake rate) because OAuth redirect times out in PRO. Proposed fix: inject a pre-obtained auth token via API before the test, bypassing the OAuth UI flow. This pattern is already used successfully in 3 other test suites.', confidence:91, status:'proposed', source:'Detected from flaky test analysis', affectedFiles:['tests/e2e/auth.spec.ts', 'tests/helpers/authHelper.ts'], plan:'User Authentication',
      diff:`// New auth helper — bypass OAuth with token injection
+ export async function injectAuthToken(page: Page) {
+   const token = await getServiceToken({
+     clientId: process.env.OAUTH_CLIENT_ID,
+     clientSecret: process.env.OAUTH_CLIENT_SECRET,
+     scope: 'user:read user:write'
+   });
+   await page.evaluate((t) => {
+     localStorage.setItem('auth_token', t);
+   }, token);
+   await page.reload();
+ }

// In test — replace flaky OAuth UI flow
- await page.click('[data-testid="oauth-login"]');
- await page.waitForNavigation({ timeout: 30000 });
+ await injectAuthToken(page);` },
  ],

  // ─── Reports Data ───
  reports: [
    { id:'rep-001', name:'Checkout Flow — Nightly Regression', plan:'Checkout Flow E2E', execution:'ex-001', format:'HTML', date:'Today 14:35', status:'ready', size:'2.4 MB' },
    { id:'rep-002', name:'Payment Gateway — Weekly Summary', plan:'Payment Gateway API', execution:null, format:'PDF', date:'Today 10:00', status:'ready', size:'1.1 MB' },
    { id:'rep-003', name:'Sprint 47 — QA Summary', plan:null, execution:null, format:'PDF', date:'Yesterday', status:'ready', size:'3.8 MB' },
    { id:'rep-004', name:'Checkout Flow — XRay Export', plan:'Checkout Flow E2E', execution:'ex-003', format:'XRay', date:'Yesterday 22:05', status:'delivered', size:'856 KB' },
    { id:'rep-005', name:'All Plans — Monthly Report', plan:null, execution:null, format:'HTML', date:'Jun 1', status:'scheduled', size:null },
  ],

  deliveryConfigs: [
    { id:'del-001', name:'Nightly QA Report', trigger:'After every nightly regression', recipients:['qa-team@techmart.com', '#qa-channel (Slack)'], format:'HTML', plans:['Checkout Flow E2E', 'Payment Gateway API'], enabled:true },
    { id:'del-002', name:'Weekly Summary to Management', trigger:'Every Monday 09:00', recipients:['tech-leads@techmart.com'], format:'PDF', plans:['All plans'], enabled:true },
    { id:'del-003', name:'XRay Sync — Checkout', trigger:'After each execution', recipients:['Jira XRay (TM project)'], format:'XRay', plans:['Checkout Flow E2E'], enabled:false },
  ],

  // ─── Schedules Data ───
  schedules: [
    { id:'sch-001', name:'Nightly Regression — Main', plan:'Checkout Flow E2E', env:'PRO', branch:'main', cron:'0 5 * * *', cronHuman:'Every day at 05:00 AM', enabled:true, lastRun:'Today 05:00', nextRun:'Tomorrow 05:00', lastStatus:'passed', last7: { passed:7, failed:0 }, autoReport:true, notifyOn:'failure', duration:'30m' },
    { id:'sch-002', name:'Nightly Regression — Payment', plan:'Payment Gateway API', env:'PRO', branch:'main', cron:'0 5 * * *', cronHuman:'Every day at 05:00 AM', enabled:true, lastRun:'Today 05:00', nextRun:'Tomorrow 05:00', lastStatus:'failed', last7: { passed:5, failed:2 }, autoReport:true, notifyOn:'always', duration:'18m' },
    { id:'sch-003', name:'Health Check — Hourly', plan:'Checkout Flow E2E', env:'PRO', branch:'main', cron:'0 * * * *', cronHuman:'Every hour', enabled:true, lastRun:'14:00', nextRun:'15:00', lastStatus:'passed', last7: { passed:168, failed:2 }, autoReport:false, notifyOn:'failure', duration:'2m', tags:['health-check','5-basic-tests'] },
    { id:'sch-004', name:'PR Validation — Checkout', plan:'Checkout Flow E2E', env:'DEV', branch:'feature/*', cron:null, cronHuman:'On PR with label: qa-checkout', enabled:true, lastRun:'Today 11:30', nextRun:'On next PR', lastStatus:'passed', last7: { passed:4, failed:1 }, autoReport:false, notifyOn:'failure', prLabels:['qa-checkout','qa-regression'], duration:'12m' },
    { id:'sch-005', name:'PR Validation — By Vertical', plan:'All Plans', env:'DEV', branch:'hotfix/*', cron:null, cronHuman:'On PR with vertical label', enabled:true, lastRun:'Today 09:15', nextRun:'On next PR', lastStatus:'passed', last7: { passed:3, failed:0 }, autoReport:true, notifyOn:'always', prLabels:['qa-payments','qa-auth','qa-catalog','qa-checkout'], duration:'8m' },
    { id:'sch-006', name:'Weekly Full Suite', plan:'All Plans', env:'PRO', branch:'main', cron:'0 6 * * 1', cronHuman:'Every Monday at 06:00', enabled:true, lastRun:'Jun 2 06:00', nextRun:'Jun 9 06:00', lastStatus:'passed', last7: { passed:1, failed:0 }, autoReport:true, notifyOn:'always', duration:'45m' },
    { id:'sch-007', name:'Develop Branch — Orders', plan:'Order Management API', env:'DEV', branch:'develop', cron:'0 */4 * * *', cronHuman:'Every 4 hours', enabled:false, lastRun:'Jun 1 16:00', nextRun:'—', lastStatus:'passed', last7: { passed:6, failed:0 }, autoReport:false, notifyOn:'failure', duration:'15m' },
  ],

  // ─── Connectors Data ───
  connectors: [
    { id:'con-001', name:'Jira + XRay', type:'task_tracker', icon:'jira', status:'connected', description:'Test management, execution tracking & requirements traceability', config:{ project:'TM', board:'Sprint Board', url:'techmart.atlassian.net', xrayCloud:'Enabled', testExecutionIssueType:'Test Execution' }, lastSync:'5m ago' },
    { id:'con-002', name:'GitHub + Actions', type:'code_repo', icon:'git', status:'connected', description:'Source code, PR triggers & CI/CD pipeline integration', config:{ org:'techmart', repos:['web-frontend','api-gateway','payment-service','mob-app-ios'], url:'github.com/techmart', actionsWorkflow:'qa-regression.yml', prTrigger:'Enabled' }, lastSync:'2m ago' },
    { id:'con-003', name:'AWS S3', type:'storage', icon:'doc', status:'connected', description:'Test artifacts, screenshots & documentation', config:{ bucket:'techmart-qa-docs', region:'eu-west-1' }, lastSync:'1h ago' },
    { id:'con-004', name:'Google Drive', type:'storage', icon:'doc', status:'not_configured', description:'Shared documentation & specs', config:null, lastSync:null },
    { id:'con-005', name:'Slack', type:'notification', icon:'chat', status:'connected', description:'Notifications & alerts by vertical', config:{ workspace:'TechMart', channels:['#qa-alerts','#qa-checkout','#qa-payments','#qa-auth'] }, lastSync:'Active' },
    { id:'con-006', name:'Stripe (3DS Sandbox)', type:'external', icon:'api', status:'error', description:'Payment gateway test environment', config:{ mode:'sandbox', url:'api.stripe.com' }, lastSync:'Failed 2h ago', error:'API key expired' },
    { id:'con-007', name:'Gmail API', type:'external', icon:'send', status:'connected', description:'OTP verification & transactional email testing', config:{ serviceAccount:'qa-bot@techmart.iam.gserviceaccount.com', scopes:'gmail.readonly' }, lastSync:'Active' },
    { id:'con-008', name:'OpenAPI Spec', type:'api_spec', icon:'api', status:'connected', description:'API definitions & schemas (itxrest productsArray)', config:{ version:'v3.1', endpoints:47 }, lastSync:'3h ago' },
    { id:'con-009', name:'Bitbucket', type:'code_repo', icon:'git', status:'not_configured', description:'Alternative Git hosting', config:null, lastSync:null },
    { id:'con-010', name:'Microsoft Teams', type:'notification', icon:'chat', status:'not_configured', description:'Team notifications', config:null, lastSync:null },
  ],
};

window.QAAP_DATA = QAAP_DATA;
