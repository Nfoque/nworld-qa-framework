// QAAP Mock Data — Booking.com Travel & Hospitality QA
const QAAP_DATA = {
  user: { name: 'Sarah van der Berg', email: 'svdberg@booking.com', role: 'QA Lead', initials: 'SB' },
  tenant: { name: 'Booking.com', slug: 'booking', logo: 'assets/booking-logo.png' },

  testPlans: [
    { id:'tp-001', name:'Hotel Search & Availability', modality:'web', framework:'Playwright', status:'approved', scenarioCount:28, passRate:97, lastUpdated:'1h ago', assignedTo:'Sarah van der Berg', health:'healthy', trend:[95,94,96,95,97,96,98,97,97], market:'Global', vertical:'Search', platforms:['Desktop','Mobile'] },
    { id:'tp-002', name:'Booking Checkout E2E', modality:'web', framework:'Playwright', status:'approved', scenarioCount:22, passRate:94, lastUpdated:'2h ago', assignedTo:'Sarah van der Berg', health:'healthy', trend:[92,91,93,92,95,94,96,93,94], market:'Global', vertical:'Checkout', platforms:['Desktop','Mobile'] },
    { id:'tp-003', name:'Payment Gateway API', modality:'api', framework:'Karate', status:'review', scenarioCount:16, passRate:89, lastUpdated:'30m ago', assignedTo:'Mark de Vries', health:'degrading', trend:[96,94,92,90,88,91,89,87,89], market:'Global', vertical:'Payments', platforms:['API'] },
    { id:'tp-004', name:'Property Listing API', modality:'api', framework:'Karate', status:'approved', scenarioCount:34, passRate:99, lastUpdated:'4h ago', assignedTo:'Lisa Bakker', health:'healthy', trend:[98,99,99,98,99,99,100,99,99], market:'Global', vertical:'Inventory', platforms:['API'] },
    { id:'tp-005', name:'Guest Reviews Module', modality:'web', framework:'Cypress', status:'generating', scenarioCount:10, passRate:null, lastUpdated:'15m ago', assignedTo:'Mark de Vries', health:null, trend:[], market:'Global', vertical:'Reviews', platforms:['Desktop','Mobile'] },
    { id:'tp-006', name:'Mobile Search & Book', modality:'ios', framework:'XCTest', status:'draft', scenarioCount:8, passRate:null, lastUpdated:'2d ago', assignedTo:'Lisa Bakker', health:null, trend:[], market:'Global', vertical:'Mobile', platforms:['iOS'] },
    { id:'tp-007', name:'Price Sync Engine', modality:'api', framework:'Karate', status:'approved', scenarioCount:19, passRate:96, lastUpdated:'3h ago', assignedTo:'Sarah van der Berg', health:'healthy', trend:[93,94,95,94,96,95,97,96,96], market:'Global', vertical:'Pricing', platforms:['API'] },
    { id:'tp-008', name:'Confirmation & Notification Emails', modality:'api', framework:'Karate', status:'review', scenarioCount:11, passRate:84, lastUpdated:'1d ago', assignedTo:'Mark de Vries', health:'degrading', trend:[91,89,87,85,84,83,82,84,84], market:'Global', vertical:'Notifications', platforms:['API'] },
  ],

  scenarios: [
    { id:'s-001', name:'Successful hotel booking with credit card', confidence:96, status:'approved', feature:'Checkout' },
    { id:'s-002', name:'Booking with saved payment method', confidence:93, status:'approved', feature:'Checkout' },
    { id:'s-003', name:'Apply Genius loyalty discount', confidence:89, status:'approved', feature:'Checkout' },
    { id:'s-004', name:'Free cancellation policy verification', confidence:68, status:'pending', feature:'Policy' },
    { id:'s-005', name:'Guest checkout without account', confidence:92, status:'approved', feature:'Checkout' },
    { id:'s-006', name:'Multi-room booking for group', confidence:86, status:'pending', feature:'Rooms' },
    { id:'s-007', name:'City tax calculation per night', confidence:95, status:'approved', feature:'Pricing' },
    { id:'s-008', name:'Payment with 3DS verification', confidence:47, status:'rejected', feature:'Payment' },
    { id:'s-009', name:'Booking with currency conversion', confidence:74, status:'pending', feature:'Payment' },
    { id:'s-010', name:'Add breakfast to reservation', confidence:99, status:'approved', feature:'Extras' },
    { id:'s-011', name:'Room upgrade during checkout', confidence:91, status:'approved', feature:'Rooms' },
    { id:'s-012', name:'Booking confirmation email delivery', confidence:87, status:'approved', feature:'Notifications' },
    { id:'s-013', name:'Promo code validation — invalid code', confidence:94, status:'approved', feature:'Checkout' },
    { id:'s-014', name:'Back navigation preserves room selection', confidence:79, status:'pending', feature:'Navigation' },
    { id:'s-015', name:'Concurrent room booking race condition', confidence:54, status:'rejected', feature:'Checkout' },
  ],

  gherkinContent: `Feature: Hotel Booking Checkout
  As a registered guest
  I want to complete a hotel reservation
  So that I can book accommodation for my trip

  @approved @confidence:96
  Scenario: Successful hotel booking with credit card
    Given I am logged in as "testguest@booking.com"
    And I have selected "Grand Hotel Amsterdam" for "Jun 15-17" (2 nights)
    When I navigate to the booking page
    Then I should see the reservation summary with room type "Deluxe Double"
    And the total should display "€298.00"
    When I enter guest name "John Smith"
    And I enter email "john.smith@email.com"
    And I select "Credit Card" as payment method
    And I enter card number "4242 4242 4242 4242"
    And I enter expiry date "12/27"
    And I enter CVV "123"
    And I click "Complete Booking"
    Then I should see the booking confirmation page
    And the confirmation should show booking ID matching "BK-\\\\d+"
    And I should receive a confirmation email within 60 seconds
    And the room availability should update in inventory

  @pending @confidence:68
  Scenario: Free cancellation policy verification
    Given I am logged in as "testguest@booking.com"
    And I have a confirmed booking "BK-90421" with free cancellation
    When I navigate to "My Bookings"
    And I click "Cancel Booking" on "BK-90421"
    Then I should see "Free cancellation — no charge"
    And I should see the cancellation deadline
    When I confirm cancellation
    Then the booking status should change to "Cancelled"
    And a full refund should be initiated
    And the room should be released back to inventory

  @approved @confidence:89
  Scenario: Apply Genius loyalty discount
    Given I am logged in as a Genius Level 2 member
    And I have selected a Genius-eligible property
    When I navigate to the booking page
    Then I should see "Genius discount" badge
    And the discount should show "-10%"
    When I complete the payment
    Then the final total should reflect the Genius discount`,

  generatedCode: `import { test, expect } from '@playwright/test';

test.describe('Hotel Booking Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'testguest@booking.com');
    await page.fill('[data-testid="password"]', 'TestPass123!');
    await page.click('[data-testid="login-btn"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('successful hotel booking with credit card', async ({ page }) => {
    // Search for hotel
    await page.goto('/search?city=amsterdam&checkin=2026-06-15&checkout=2026-06-17');
    await page.click('[data-testid="hotel-grand-amsterdam"]');
    await page.click('[data-testid="room-deluxe-double"] [data-testid="select-room"]');

    // Verify reservation summary
    await expect(page.locator('[data-testid="room-type"]'))
      .toContainText('Deluxe Double');
    await expect(page.locator('[data-testid="total"]'))
      .toContainText('€298.00');

    // Guest details
    await page.fill('[data-testid="guest-name"]', 'John Smith');
    await page.fill('[data-testid="guest-email"]', 'john.smith@email.com');

    // Payment
    await page.click('[data-testid="payment-card"]');
    const cardFrame = page.frameLocator('[data-testid="card-frame"]');
    await cardFrame.locator('[name="cardNumber"]')
      .fill('4242424242424242');
    await cardFrame.locator('[name="expiry"]').fill('1227');
    await cardFrame.locator('[name="cvv"]').fill('123');

    // Complete booking
    await page.click('[data-testid="complete-booking"]');
    await expect(page.locator('[data-testid="confirmation"]'))
      .toBeVisible();
    await expect(page.locator('[data-testid="booking-id"]'))
      .toHaveText(/BK-\\d+/);
  });
});`,

  chatMessages: [
    { role:'system', content:'Plan loaded: Booking Checkout E2E — 22 scenarios, 16 approved, 4 pending, 2 rejected. Sources: Jira (BK-Sprint-82), GitHub (booking/web-frontend), OpenAPI spec v4.2.' },
    { role:'user', content:'Add a negative test for double-booking the same room' },
    { role:'assistant', content:'I\'ve added **Scenario 23: Concurrent room booking race condition**. It covers the case where two guests try to book the last available room simultaneously.\n\nThe scenario verifies:\n• First guest completes booking successfully\n• Second guest sees "Room no longer available"\n• Inventory count remains consistent\n\n**Confidence: 54%** — The race condition window is hard to reproduce reliably. I recommend using a mutex lock in the test to simulate concurrent requests.', model:'Claude Sonnet 4' },
    { role:'user', content:'Do we cover the Genius loyalty discount flow?' },
    { role:'assistant', content:'Yes — Scenario 3 covers "Apply Genius loyalty discount" with **confidence 89%**. However, there are gaps:\n\n1. Only Level 2 discounts are tested, not Level 1 or Level 3\n2. No test for Genius discount stacking with promo codes\n3. Missing verification of Genius badge display on property cards\n\nI recommend:\n• Adding Level 1 and Level 3 discount tiers\n• Testing discount + promo code combination rules\n\nWant me to generate these additional scenarios?', model:'Claude Sonnet 4' },
  ],

  executions: [
    { id:'ex-001', date:'Today 14:45', env:'PRE', status:'passed', passRate:94, duration:'5m 18s', trigger:'manual', passed:21, failed:1, skipped:0 },
    { id:'ex-002', date:'Today 08:00', env:'PRE', status:'failed', passRate:86, duration:'4m 52s', trigger:'cron', passed:19, failed:3, skipped:0 },
    { id:'ex-003', date:'Yesterday 22:00', env:'PRO', status:'passed', passRate:100, duration:'6m 10s', trigger:'cron', passed:22, failed:0, skipped:0 },
    { id:'ex-004', date:'Yesterday 15:30', env:'DEV', status:'passed', passRate:91, duration:'4m 05s', trigger:'webhook', passed:20, failed:2, skipped:0 },
    { id:'ex-005', date:'Jun 2 08:00', env:'PRE', status:'failed', passRate:82, duration:'5m 30s', trigger:'cron', passed:18, failed:4, skipped:0 },
  ],

  recentActivity: [
    { type:'execution', text:'Booking Checkout E2E passed on PRE', time:'2h ago', status:'success' },
    { type:'generation', text:'Guest Reviews Module generating…', time:'15m ago', status:'info' },
    { type:'review', text:'Payment Gateway API needs review', time:'30m ago', status:'warning' },
    { type:'approval', text:'Property Listing API approved by Sarah', time:'4h ago', status:'success' },
    { type:'alert', text:'Payment Gateway pass rate below 90%', time:'1h ago', status:'error' },
    { type:'proposal', text:'AI suggested 3 new test cases for Search', time:'5h ago', status:'info' },
  ],

  healthMetrics: { overallPassRate:93.8, totalExecutions:182, flakyTests:4, coverageScore:85 },

  healthPlans: [
    { name:'Hotel Search & Availability', health:'healthy', passRate:97, trend:[95,94,96,95,97,96,98,97,97], lastRun:'1h ago', scenarios:28 },
    { name:'Payment Gateway API', health:'degrading', passRate:89, trend:[96,94,92,90,88,91,89,87,89], lastRun:'30m ago', scenarios:16 },
    { name:'Booking Checkout E2E', health:'healthy', passRate:94, trend:[92,91,93,92,95,94,96,93,94], lastRun:'2h ago', scenarios:22 },
    { name:'Property Listing API', health:'healthy', passRate:99, trend:[98,99,99,98,99,99,100,99,99], lastRun:'4h ago', scenarios:34 },
  ],

  flakyTests: [
    { name:'Payment retry after gateway timeout', plan:'Payment Gateway API', flakeRate:31, lastFlake:'Today 08:00' },
    { name:'Search autocomplete race condition', plan:'Hotel Search & Availability', flakeRate:24, lastFlake:'Yesterday' },
    { name:'Room availability cache sync', plan:'Price Sync Engine', flakeRate:18, lastFlake:'Jun 2' },
    { name:'Map pin clustering on zoom', plan:'Hotel Search & Availability', flakeRate:12, lastFlake:'Jun 1' },
  ],

  alerts: [
    { severity:'critical', message:'Payment Gateway pass rate dropped to 89%', time:'1h ago', plan:'Payment Gateway API' },
    { severity:'warning', message:'Flaky test: Payment retry after gateway timeout (31% flake rate)', time:'3h ago', plan:'Payment Gateway API' },
    { severity:'info', message:'Booking Checkout E2E recovered to healthy status', time:'2h ago', plan:'Booking Checkout E2E' },
  ],

  executionDetails: [
    { id:'ex-001', date:'Today 14:45', env:'PRE', status:'passed', passRate:94, duration:'5m 18s', trigger:'manual', triggeredBy:'Sarah van der Berg', branch:'main', passed:21, failed:1, skipped:0,
      results: [
        { scenario:'Successful hotel booking with credit card', status:'passed', duration:'14.1s' },
        { scenario:'Booking with saved payment method', status:'passed', duration:'9.8s' },
        { scenario:'Apply Genius loyalty discount', status:'passed', duration:'11.2s' },
        { scenario:'Free cancellation policy verification', status:'failed', duration:'16.7s', error:'Expected cancellation deadline text "Free cancellation before Jun 14" but got "Free cancellation before June 14, 2026"', screenshot:'cancellation-policy-fail.png', classification:'Assertion Mismatch', rootCause:'The date format was updated in the latest UI release (v8.12.0) to use the full date format instead of abbreviated. The test assertion needs to be updated to match the new format.' },
        { scenario:'Guest checkout without account', status:'passed', duration:'12.5s' },
        { scenario:'Multi-room booking for group', status:'passed', duration:'15.3s' },
        { scenario:'City tax calculation per night', status:'passed', duration:'8.4s' },
        { scenario:'Payment with 3DS verification', status:'passed', duration:'19.8s' },
        { scenario:'Add breakfast to reservation', status:'passed', duration:'7.1s' },
        { scenario:'Room upgrade during checkout', status:'passed', duration:'10.6s' },
      ]
    },
    { id:'ex-002', date:'Today 08:00', env:'PRE', status:'failed', passRate:86, duration:'4m 52s', trigger:'cron', triggeredBy:'Scheduled', branch:'main', passed:19, failed:3, skipped:0,
      results: [
        { scenario:'Successful hotel booking with credit card', status:'passed', duration:'13.5s' },
        { scenario:'Free cancellation policy verification', status:'failed', duration:'15.9s', error:'Timeout waiting for cancellation confirmation modal', classification:'Timeout', rootCause:'The booking management service was experiencing high latency (>25s) due to a database migration running in the PRE environment.' },
        { scenario:'Payment with 3DS verification', status:'failed', duration:'30.2s', error:'3DS iframe did not load within timeout', classification:'Environment Issue', rootCause:'Adyen 3DS sandbox was undergoing maintenance. Scheduled maintenance window was not communicated to QA team.' },
        { scenario:'Concurrent room booking race condition', status:'failed', duration:'24.1s', error:'Expected availability count to decrease by 1 but decreased by 2', classification:'Race Condition', rootCause:'The inventory lock mechanism has a ~80ms timing window where duplicate reservations can be created under concurrent load.' },
      ]
    },
    { id:'ex-003', date:'Yesterday 22:00', env:'PRO', status:'passed', passRate:100, duration:'6m 10s', trigger:'cron', triggeredBy:'Scheduled', branch:'main', passed:22, failed:0, skipped:0, results:[] },
    { id:'ex-004', date:'Yesterday 15:30', env:'DEV', status:'passed', passRate:91, duration:'4m 05s', trigger:'webhook', triggeredBy:'PR #1247', branch:'feature/genius-v3', passed:20, failed:2, skipped:0, results:[] },
    { id:'ex-005', date:'Jun 2 08:00', env:'PRE', status:'failed', passRate:82, duration:'5m 30s', trigger:'cron', triggeredBy:'Scheduled', branch:'main', passed:18, failed:4, skipped:0, results:[] },
  ],

  aiProposals: [
    { id:'prop-001', type:'bug_detection', title:'Race condition in concurrent room booking', description:'Analysis of Execution #182 revealed a timing window where two simultaneous booking requests can reserve the same room. The inventory lock in RoomAvailabilityService.reserveRoom() has a ~80ms vulnerability window when under high concurrency.', confidence:92, status:'proposed', source:'Detected from Execution #182', affectedFiles:['src/services/RoomAvailabilityService.ts', 'src/middleware/inventoryLock.ts'], plan:'Booking Checkout E2E',
      diff:`- async reserveRoom(roomId: string, dates: DateRange): Promise<Reservation> {
-   const available = await this.inventoryRepo.checkAvailability(roomId, dates);
-   if (!available) throw new RoomUnavailableError();
+ async reserveRoom(roomId: string, dates: DateRange): Promise<Reservation> {
+   return await this.inventoryRepo.transaction(async (tx) => {
+     const available = await tx.checkAvailability(roomId, dates, { forUpdate: true });
+     if (!available) throw new RoomUnavailableError();
+     return await tx.createReservation({ roomId, dates, status: 'confirmed' });
+   });` },
    { id:'prop-002', type:'test_improvement', title:'Add negative tests for payment timeout scenarios', description:'Current test suite only covers successful payments and card rejection. Missing coverage for gateway timeout (30s), network interruption, and partial charge states. These represent 15% of production support tickets in the last 30 days.', confidence:85, status:'proposed', source:'Detected from trend analysis', affectedFiles:['tests/e2e/booking-checkout.spec.ts'], plan:'Booking Checkout E2E',
      diff:`+ Scenario: Payment gateway timeout handling
+   Given I am logged in and have a room selected
+   When I submit payment and the gateway times out after 30s
+   Then I should see "Payment is taking longer than expected"
+   And a retry button should be available
+   And my room selection should be preserved` },
    { id:'prop-003', type:'fix_proposal', title:'Update cancellation date format assertion', description:'Test "Free cancellation policy verification" fails because the UI changed date format from abbreviated ("Jun 14") to full ("June 14, 2026") in v8.12.0.', confidence:98, status:'accepted', source:'Detected from Execution #182', affectedFiles:['tests/e2e/booking-checkout.spec.ts'], plan:'Booking Checkout E2E',
      diff:`- Then I should see "Free cancellation before Jun 14"
+ Then I should see "Free cancellation before June 14, 2026"` },
    { id:'prop-004', type:'coverage_gap', title:'No tests for booking modification flow', description:'The booking modification feature (change dates, room type, guest count) added in Sprint 80 has zero E2E coverage. This flow handles price recalculation, availability re-check, and payment adjustment — all critical paths with high production traffic.', confidence:78, status:'proposed', source:'Detected from source change in commit b7e4d19', affectedFiles:['src/services/BookingModificationService.ts', 'src/api/bookings/modify.ts'], plan:'Booking Checkout E2E',
      diff:`+ Feature: Booking Modification
+   Scenario: Change booking dates within same property
+     Given a confirmed booking "BK-90421" for Jun 15-17
+     When I change dates to Jun 18-20
+     Then availability should be checked for new dates
+     And price should be recalculated
+     And the price difference should be charged/refunded` },
    { id:'prop-005', type:'bug_detection', title:'Adyen 3DS sandbox maintenance not detected', description:'3DS authentication tests have failed intermittently for the past 48 hours. Root cause: Adyen sandbox was under scheduled maintenance. QA was not notified. Affects 4 scenarios in Payment Gateway API.', confidence:95, status:'rejected', source:'Detected from Execution #183', affectedFiles:[], plan:'Payment Gateway API', diff:null },
    { id:'prop-006', type:'testid_gap', title:'Missing data-test-id on 18 interactive elements', description:'Automated scan of the web-frontend repository detected 18 interactive elements in the booking checkout that lack data-test-id attributes. This blocks reliable automation of 8 scenarios, forcing fragile CSS selectors.', confidence:97, status:'proposed', source:'Detected from repo scan (web-frontend)', affectedFiles:['src/components/Booking/PaymentForm.tsx', 'src/components/Booking/RoomSelector.tsx', 'src/components/Booking/GuestDetails.tsx'], plan:'Booking Checkout E2E',
      diff:`// PaymentForm.tsx — 6 elements missing data-test-id
- <button onClick={handleSubmit}>Complete Booking</button>
+ <button onClick={handleSubmit} data-test-id="complete-booking">Complete Booking</button>

// RoomSelector.tsx — 5 elements missing
- <div className="room-option" onClick={() => selectRoom(room)}>
+ <div className="room-option" data-test-id={\`room-\${room.type}\`} onClick={() => selectRoom(room)}>` },
    { id:'prop-007', type:'cross_platform', title:'Shared Gherkin → Generate iOS tests from web plan', description:'The "Booking Checkout E2E" plan currently only generates Playwright tests. The same Gherkin scenarios can generate XCTest + XCUI tests for the iOS app, eliminating manual duplication across platforms. Estimated savings: ~60h/month.', confidence:88, status:'proposed', source:'Detected from cross-platform analysis', affectedFiles:['tests/ios/booking-checkout.xctest.swift'], plan:'Booking Checkout E2E',
      diff:`// Auto-generated from shared Gherkin → XCTest
+ func testSuccessfulHotelBooking() throws {
+     let app = XCUIApplication()
+     // Login
+     app.textFields["email"].tap()
+     app.textFields["email"].typeText("testguest@booking.com")
+     app.secureTextFields["password"].typeText("TestPass123!")
+     app.buttons["login-btn"].tap()
+     // Search & select hotel
+     app.searchFields["destination"].tap()
+     app.searchFields["destination"].typeText("Amsterdam")
+     // ... generated from same Gherkin as web
+ }` },
    { id:'prop-008', type:'flaky_fix', title:'Stabilize search autocomplete with debounce mock', description:'Hotel Search autocomplete test fails intermittently (24% flake rate) due to race conditions between keystroke events and API responses. Proposed fix: inject a deterministic debounce mock and use a fixed-response stub for the autocomplete API.', confidence:91, status:'proposed', source:'Detected from flaky test analysis', affectedFiles:['tests/e2e/search.spec.ts', 'tests/helpers/searchMocks.ts'], plan:'Hotel Search & Availability',
      diff:`+ // Mock autocomplete with deterministic debounce
+ export async function mockSearchAutocomplete(page: Page) {
+   await page.route('**/api/autocomplete**', route => {
+     route.fulfill({
+       status: 200,
+       body: JSON.stringify(MOCK_SUGGESTIONS),
+       headers: { 'Content-Type': 'application/json' }
+     });
+   });
+ }` },
  ],

  reports: [
    { id:'rep-001', name:'Booking Checkout — Nightly Regression', plan:'Booking Checkout E2E', execution:'ex-001', format:'HTML', date:'Today 14:50', status:'ready', size:'2.8 MB' },
    { id:'rep-002', name:'Payment Gateway — Weekly Summary', plan:'Payment Gateway API', execution:null, format:'PDF', date:'Today 10:00', status:'ready', size:'1.3 MB' },
    { id:'rep-003', name:'Sprint 82 — QA Summary', plan:null, execution:null, format:'PDF', date:'Yesterday', status:'ready', size:'4.1 MB' },
    { id:'rep-004', name:'Booking Checkout — XRay Export', plan:'Booking Checkout E2E', execution:'ex-003', format:'XRay', date:'Yesterday 22:10', status:'delivered', size:'920 KB' },
    { id:'rep-005', name:'All Plans — Monthly Report', plan:null, execution:null, format:'HTML', date:'Jun 1', status:'scheduled', size:null },
  ],

  deliveryConfigs: [
    { id:'del-001', name:'Nightly QA Report', trigger:'After every nightly regression', recipients:['qa-team@booking.com', '#qa-alerts (Slack)'], format:'HTML', plans:['Booking Checkout E2E', 'Payment Gateway API'], enabled:true },
    { id:'del-002', name:'Weekly Summary to Engineering', trigger:'Every Monday 09:00', recipients:['eng-leads@booking.com'], format:'PDF', plans:['All plans'], enabled:true },
    { id:'del-003', name:'XRay Sync — Checkout', trigger:'After each execution', recipients:['Jira XRay (BK project)'], format:'XRay', plans:['Booking Checkout E2E'], enabled:false },
  ],

  schedules: [
    { id:'sch-001', name:'Nightly Regression — Checkout', plan:'Booking Checkout E2E', env:'PRO', branch:'main', cron:'0 5 * * *', cronHuman:'Every day at 05:00 AM', enabled:true, lastRun:'Today 05:00', nextRun:'Tomorrow 05:00', lastStatus:'passed', last7: { passed:6, failed:1 }, autoReport:true, notifyOn:'failure', duration:'35m' },
    { id:'sch-002', name:'Nightly Regression — Payments', plan:'Payment Gateway API', env:'PRO', branch:'main', cron:'0 5 * * *', cronHuman:'Every day at 05:00 AM', enabled:true, lastRun:'Today 05:00', nextRun:'Tomorrow 05:00', lastStatus:'failed', last7: { passed:4, failed:3 }, autoReport:true, notifyOn:'always', duration:'20m' },
    { id:'sch-003', name:'Health Check — Hourly', plan:'Hotel Search & Availability', env:'PRO', branch:'main', cron:'0 * * * *', cronHuman:'Every hour', enabled:true, lastRun:'14:00', nextRun:'15:00', lastStatus:'passed', last7: { passed:165, failed:3 }, autoReport:false, notifyOn:'failure', duration:'3m', tags:['health-check','5-basic-tests'] },
    { id:'sch-004', name:'PR Validation — Checkout', plan:'Booking Checkout E2E', env:'DEV', branch:'feature/*', cron:null, cronHuman:'On PR with label: qa-checkout', enabled:true, lastRun:'Today 11:30', nextRun:'On next PR', lastStatus:'passed', last7: { passed:5, failed:1 }, autoReport:false, notifyOn:'failure', prLabels:['qa-checkout','qa-regression'], duration:'14m' },
    { id:'sch-005', name:'PR Validation — By Vertical', plan:'All Plans', env:'DEV', branch:'hotfix/*', cron:null, cronHuman:'On PR with vertical label', enabled:true, lastRun:'Today 09:00', nextRun:'On next PR', lastStatus:'passed', last7: { passed:4, failed:0 }, autoReport:true, notifyOn:'always', prLabels:['qa-payments','qa-search','qa-inventory','qa-checkout'], duration:'10m' },
    { id:'sch-006', name:'Weekly Full Suite', plan:'All Plans', env:'PRO', branch:'main', cron:'0 6 * * 1', cronHuman:'Every Monday at 06:00', enabled:true, lastRun:'Jun 2 06:00', nextRun:'Jun 9 06:00', lastStatus:'passed', last7: { passed:1, failed:0 }, autoReport:true, notifyOn:'always', duration:'55m' },
    { id:'sch-007', name:'Develop Branch — Inventory', plan:'Property Listing API', env:'DEV', branch:'develop', cron:'0 */4 * * *', cronHuman:'Every 4 hours', enabled:false, lastRun:'Jun 1 16:00', nextRun:'—', lastStatus:'passed', last7: { passed:6, failed:0 }, autoReport:false, notifyOn:'failure', duration:'18m' },
  ],

  connectors: [
    { id:'con-001', name:'Jira + XRay', type:'task_tracker', icon:'jira', status:'connected', description:'Test management, execution tracking & requirements traceability', config:{ project:'BK', board:'Sprint Board', url:'booking.atlassian.net', xrayCloud:'Enabled', testExecutionIssueType:'Test Execution' }, lastSync:'3m ago' },
    { id:'con-002', name:'GitHub + Actions', type:'code_repo', icon:'git', status:'connected', description:'Source code, PR triggers & CI/CD pipeline integration', config:{ org:'booking', repos:['web-frontend','api-gateway','payment-service','inventory-engine','mobile-ios'], url:'github.com/bookingcom', actionsWorkflow:'qa-regression.yml', prTrigger:'Enabled' }, lastSync:'1m ago' },
    { id:'con-003', name:'AWS S3', type:'storage', icon:'doc', status:'connected', description:'Test artifacts, screenshots & report storage', config:{ bucket:'booking-qa-artifacts', region:'eu-west-1' }, lastSync:'30m ago' },
    { id:'con-004', name:'Google Drive', type:'storage', icon:'doc', status:'not_configured', description:'Shared documentation & specifications', config:null, lastSync:null },
    { id:'con-005', name:'Slack', type:'notification', icon:'chat', status:'connected', description:'Notifications & alerts by vertical channel', config:{ workspace:'Booking.com', channels:['#qa-alerts','#qa-checkout','#qa-payments','#qa-search'] }, lastSync:'Active' },
    { id:'con-006', name:'Adyen (Payment Sandbox)', type:'external', icon:'api', status:'error', description:'Payment gateway test environment', config:{ mode:'sandbox', url:'checkout-test.adyen.com' }, lastSync:'Failed 2h ago', error:'Sandbox under maintenance' },
    { id:'con-007', name:'Mailgun', type:'external', icon:'send', status:'connected', description:'Transactional email verification & delivery testing', config:{ domain:'sandbox.booking.com', apiKey:'key-***' }, lastSync:'Active' },
    { id:'con-008', name:'OpenAPI Spec', type:'api_spec', icon:'api', status:'connected', description:'API definitions & schemas for all booking services', config:{ version:'v4.2', endpoints:86 }, lastSync:'2h ago' },
    { id:'con-009', name:'Amadeus API', type:'external', icon:'api', status:'connected', description:'Travel inventory, availability & pricing data', config:{ mode:'test', url:'test.api.amadeus.com' }, lastSync:'15m ago' },
    { id:'con-010', name:'Microsoft Teams', type:'notification', icon:'chat', status:'not_configured', description:'Team notifications & alerts', config:null, lastSync:null },
  ],

  // ─── Settings data for overrides ───
  teamMembers: [
    { name:'Sarah van der Berg', email:'svdberg@booking.com', role:'Admin', status:'active', lastActive:'Just now', initials:'SB' },
    { name:'Mark de Vries', email:'mdvries@booking.com', role:'QA Expert', status:'active', lastActive:'1h ago', initials:'MV' },
    { name:'Lisa Bakker', email:'lbakker@booking.com', role:'QA Expert', status:'active', lastActive:'3h ago', initials:'LB' },
    { name:'Tom Jansen', email:'tjansen@booking.com', role:'Viewer', status:'active', lastActive:'1d ago', initials:'TJ' },
    { name:'Emma Visser', email:'evisser@booking.com', role:'QA Expert', status:'pending', lastActive:'Invited', initials:'EV' },
  ],

  ssoProviders: [
    { name:'Okta', status:'active', protocol:'SAML 2.0', domain:'booking.com', lastLogin:'Today 14:45', users:31 },
    { name:'Google Workspace', status:'inactive', protocol:'OIDC', domain:'booking.com', lastLogin:'Never', users:0 },
  ],

  notificationChannels: [
    { id:'email', name:'Email', icon:'send', status:'connected', config:'SMTP via Mailgun', recipients:4 },
    { id:'slack', name:'Slack', icon:'chat', status:'connected', config:'Connected to Booking.com workspace', recipients:3 },
    { id:'teams', name:'Microsoft Teams', icon:'chat', status:'not_configured', config:null, recipients:0 },
    { id:'webhook', name:'Webhook', icon:'connectors', status:'connected', config:'https://hooks.booking.com/qa-alerts', recipients:1 },
    { id:'pagerduty', name:'PagerDuty', icon:'bell', status:'not_configured', config:null, recipients:0 },
  ],
};

window.QAAP_DATA = QAAP_DATA;
