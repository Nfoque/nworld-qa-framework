// QAAP Mock Data — Viajes El Corte Inglés Travel QA
const QAAP_DATA = {
  user: { name: 'Patricia Moreno', email: 'pmoreno@viajeseci.es', role: 'QA Lead', initials: 'PM' },
  tenant: { name: 'VECI', slug: 'veci', logo: 'assets/veci-logo.png' },

  testPlans: [
    { id:'tp-001', name:'Flight Booking E2E', modality:'web', framework:'Playwright', status:'approved', scenarioCount:24, passRate:96, lastUpdated:'1h ago', assignedTo:'Patricia Moreno', health:'healthy', trend:[94,93,95,94,96,95,97,96,96], market:'Spain', vertical:'Flights', platforms:['Desktop','Mobile'] },
    { id:'tp-002', name:'Hotel Reservation API', modality:'api', framework:'Karate', status:'approved', scenarioCount:20, passRate:94, lastUpdated:'2h ago', assignedTo:'Patricia Moreno', health:'healthy', trend:[92,91,93,92,95,94,96,93,94], market:'Global', vertical:'Hotels', platforms:['API'] },
    { id:'tp-003', name:'Package Tour Builder', modality:'web', framework:'Playwright', status:'review', scenarioCount:18, passRate:88, lastUpdated:'30m ago', assignedTo:'David Iglesias', health:'degrading', trend:[96,94,92,90,88,91,89,87,88], market:'Spain', vertical:'Packages', platforms:['Desktop','Mobile'] },
    { id:'tp-004', name:'Payment & Invoicing API', modality:'api', framework:'Karate', status:'approved', scenarioCount:26, passRate:99, lastUpdated:'4h ago', assignedTo:'Raquel Vega', health:'healthy', trend:[98,99,99,98,99,99,100,99,99], market:'Global', vertical:'Payments', platforms:['API'] },
    { id:'tp-005', name:'Corporate Travel Portal', modality:'web', framework:'Playwright', status:'generating', scenarioCount:12, passRate:null, lastUpdated:'15m ago', assignedTo:'David Iglesias', health:null, trend:[], market:'Spain', vertical:'B2B', platforms:['Desktop'] },
    { id:'tp-006', name:'Mobile App Booking', modality:'ios', framework:'XCTest', status:'draft', scenarioCount:8, passRate:null, lastUpdated:'2d ago', assignedTo:'Raquel Vega', health:null, trend:[], market:'Spain', vertical:'Mobile', platforms:['iOS'] },
    { id:'tp-007', name:'Loyalty & Points System', modality:'api', framework:'Karate', status:'approved', scenarioCount:16, passRate:95, lastUpdated:'3h ago', assignedTo:'Patricia Moreno', health:'healthy', trend:[93,94,95,94,96,95,97,95,95], market:'Spain', vertical:'Loyalty', platforms:['API'] },
    { id:'tp-008', name:'Cancellation & Refund Flow', modality:'web', framework:'Playwright', status:'review', scenarioCount:14, passRate:83, lastUpdated:'1d ago', assignedTo:'David Iglesias', health:'degrading', trend:[91,89,87,85,84,83,82,83,83], market:'Spain', vertical:'Support', platforms:['Desktop'] },
  ],

  scenarios: [
    { id:'s-001', name:'Book round-trip flight Madrid–London', confidence:96, status:'approved', feature:'Flights' },
    { id:'s-002', name:'Hotel search with date flexibility', confidence:93, status:'approved', feature:'Hotels' },
    { id:'s-003', name:'Apply employee corporate discount', confidence:89, status:'approved', feature:'B2B' },
    { id:'s-004', name:'Cancel flight with full refund', confidence:68, status:'pending', feature:'Cancellation' },
    { id:'s-005', name:'Build beach package (flight+hotel)', confidence:92, status:'approved', feature:'Packages' },
    { id:'s-006', name:'Multi-passenger group booking', confidence:86, status:'pending', feature:'Flights' },
    { id:'s-007', name:'Invoice generation with VAT', confidence:95, status:'approved', feature:'Payments' },
    { id:'s-008', name:'Payment with Bizum', confidence:47, status:'rejected', feature:'Payments' },
    { id:'s-009', name:'Travel insurance add-on', confidence:74, status:'pending', feature:'Extras' },
    { id:'s-010', name:'Loyalty points redemption', confidence:99, status:'approved', feature:'Loyalty' },
    { id:'s-011', name:'Seat selection on flight', confidence:91, status:'approved', feature:'Flights' },
    { id:'s-012', name:'Booking confirmation SMS', confidence:87, status:'approved', feature:'Notifications' },
    { id:'s-013', name:'Invalid promo code handling', confidence:94, status:'approved', feature:'Payments' },
    { id:'s-014', name:'Back navigation preserves search', confidence:79, status:'pending', feature:'UX' },
    { id:'s-015', name:'Concurrent seat booking conflict', confidence:54, status:'rejected', feature:'Flights' },
  ],

  gherkinContent: `Feature: Flight Booking
  As a customer
  I want to book a round-trip flight
  So that I can travel to my destination

  @approved @confidence:96
  Scenario: Book round-trip flight Madrid–London
    Given I am logged in as "testclient@viajeseci.es"
    When I search for flights from "Madrid" to "London"
    And I select dates "Jul 10" to "Jul 17"
    And I select 2 adults
    Then I should see available flights
    When I select outbound flight "IB3170"
    And I select return flight "IB3171"
    And I complete passenger details
    And I pay with credit card
    Then I should see booking confirmation
    And I should receive confirmation email`,

  generatedCode: `import { test, expect } from '@playwright/test';

test.describe('Flight Booking', () => {
  test('book round-trip Madrid to London', async ({ page }) => {
    await page.goto('/flights');
    await page.fill('[data-testid="origin"]', 'Madrid');
    await page.fill('[data-testid="destination"]', 'London');
    await page.click('[data-testid="search-flights"]');
    await expect(page.locator('[data-testid="flight-results"]')).toBeVisible();
  });
});`,

  chatMessages: [
    { role:'system', content:'Plan loaded: Flight Booking E2E — 24 scenarios. Sources: Jira (VECI-Sprint-28), GitHub (veci/booking-web), Amadeus API v2.' },
    { role:'user', content:'Add test for Bizum payment method' },
    { role:'assistant', content:'Added **Scenario: Payment with Bizum**. Confidence: 47% — Bizum sandbox is unreliable for automated testing.', model:'Claude Sonnet 4' },
  ],

  executions: [
    { id:'ex-001', date:'Today 14:45', env:'PRE', status:'passed', passRate:94, duration:'5m 18s', trigger:'manual', passed:23, failed:1, skipped:0 },
    { id:'ex-002', date:'Today 08:00', env:'PRE', status:'failed', passRate:86, duration:'4m 52s', trigger:'cron', passed:21, failed:3, skipped:0 },
    { id:'ex-003', date:'Yesterday 22:00', env:'PRO', status:'passed', passRate:100, duration:'6m 10s', trigger:'cron', passed:24, failed:0, skipped:0 },
    { id:'ex-004', date:'Yesterday 15:30', env:'DEV', status:'passed', passRate:91, duration:'4m 05s', trigger:'webhook', passed:22, failed:2, skipped:0 },
    { id:'ex-005', date:'Jun 2 08:00', env:'PRE', status:'failed', passRate:82, duration:'5m 30s', trigger:'cron', passed:20, failed:4, skipped:0 },
  ],

  recentActivity: [
    { type:'execution', text:'Flight Booking E2E passed on PRE', time:'2h ago', status:'success' },
    { type:'generation', text:'Corporate Travel Portal generating…', time:'15m ago', status:'info' },
    { type:'review', text:'Package Tour Builder needs review', time:'30m ago', status:'warning' },
    { type:'approval', text:'Payment & Invoicing approved', time:'4h ago', status:'success' },
    { type:'alert', text:'Cancellation flow pass rate below 85%', time:'1h ago', status:'error' },
    { type:'proposal', text:'AI suggested 2 new tests for Packages', time:'5h ago', status:'info' },
  ],

  healthMetrics: { overallPassRate:93.1, totalExecutions:164, flakyTests:3, coverageScore:83 },
  healthPlans: [
    { name:'Flight Booking E2E', health:'healthy', passRate:96, trend:[94,93,95,94,96,95,97,96,96], lastRun:'1h ago', scenarios:24 },
    { name:'Package Tour Builder', health:'degrading', passRate:88, trend:[96,94,92,90,88,91,89,87,88], lastRun:'30m ago', scenarios:18 },
    { name:'Hotel Reservation API', health:'healthy', passRate:94, trend:[92,91,93,92,95,94,96,93,94], lastRun:'2h ago', scenarios:20 },
    { name:'Payment & Invoicing API', health:'healthy', passRate:99, trend:[98,99,99,98,99,99,100,99,99], lastRun:'4h ago', scenarios:26 },
  ],
  flakyTests: [
    { name:'Amadeus flight search timeout', plan:'Flight Booking E2E', flakeRate:28, lastFlake:'Today 08:00' },
    { name:'Package price calculation rounding', plan:'Package Tour Builder', flakeRate:20, lastFlake:'Yesterday' },
    { name:'Loyalty points sync delay', plan:'Loyalty & Points System', flakeRate:12, lastFlake:'Jun 2' },
  ],
  alerts: [
    { severity:'critical', message:'Cancellation flow pass rate dropped to 83%', time:'1h ago', plan:'Cancellation & Refund Flow' },
    { severity:'warning', message:'Flaky: Amadeus flight search timeout (28%)', time:'3h ago', plan:'Flight Booking E2E' },
    { severity:'info', message:'Hotel Reservation API recovered', time:'2h ago', plan:'Hotel Reservation API' },
  ],
  executionDetails: [
    { id:'ex-001', date:'Today 14:45', env:'PRE', status:'passed', passRate:94, duration:'5m 18s', trigger:'manual', triggeredBy:'Patricia Moreno', branch:'main', passed:23, failed:1, skipped:0, results:[
      { scenario:'Book round-trip flight Madrid–London', status:'passed', duration:'14.2s' },
      { scenario:'Hotel search with date flexibility', status:'passed', duration:'9.1s' },
      { scenario:'Cancel flight with full refund', status:'failed', duration:'22.3s', error:'Refund API returned 503 — Amadeus sandbox maintenance', screenshot:'cancel-fail.png', classification:'Environment Issue', rootCause:'Amadeus GDS sandbox scheduled maintenance window.' },
    ]},
    { id:'ex-002', date:'Today 08:00', env:'PRE', status:'failed', passRate:86, duration:'4m 52s', trigger:'cron', triggeredBy:'Scheduled', branch:'main', passed:21, failed:3, skipped:0, results:[] },
    { id:'ex-003', date:'Yesterday 22:00', env:'PRO', status:'passed', passRate:100, duration:'6m 10s', trigger:'cron', triggeredBy:'Scheduled', branch:'main', passed:24, failed:0, skipped:0, results:[] },
  ],
  aiProposals: [
    { id:'prop-001', type:'bug_detection', title:'Concurrent seat booking race condition', description:'Two users can select the same seat simultaneously. No optimistic locking on seat map.', confidence:91, status:'proposed', source:'Execution #148', affectedFiles:['src/services/SeatMapService.ts'], plan:'Flight Booking E2E', diff:null },
    { id:'prop-002', type:'coverage_gap', title:'No tests for multi-segment itineraries', description:'Complex routes (MAD→LHR→JFK) have zero coverage.', confidence:80, status:'proposed', source:'Source analysis', affectedFiles:['src/services/ItineraryService.ts'], plan:'Flight Booking E2E', diff:null },
    { id:'prop-003', type:'fix_proposal', title:'Update Amadeus API version assertion', description:'GDS responses changed field names in v2.1.', confidence:97, status:'accepted', source:'Execution #148', affectedFiles:['tests/e2e/flight-search.spec.ts'], plan:'Flight Booking E2E', diff:null },
  ],
  reports: [
    { id:'rep-001', name:'Flight Booking — Nightly Report', plan:'Flight Booking E2E', execution:'ex-001', format:'HTML', date:'Today 14:50', status:'ready', size:'2.3 MB' },
    { id:'rep-002', name:'Sprint 28 — QA Summary', plan:null, execution:null, format:'PDF', date:'Yesterday', status:'ready', size:'3.5 MB' },
  ],
  deliveryConfigs: [
    { id:'del-001', name:'Nightly QA Report', trigger:'After nightly regression', recipients:['qa-team@viajeseci.es','#qa-travel (Slack)'], format:'HTML', plans:['Flight Booking E2E','Package Tour Builder'], enabled:true },
  ],
  schedules: [
    { id:'sch-001', name:'Nightly — Flights', plan:'Flight Booking E2E', env:'PRO', branch:'main', cron:'0 5 * * *', cronHuman:'Every day at 05:00 AM', enabled:true, lastRun:'Today 05:00', nextRun:'Tomorrow 05:00', lastStatus:'passed', last7:{passed:6,failed:1}, autoReport:true, notifyOn:'failure', duration:'28m' },
    { id:'sch-002', name:'Weekly Full Suite', plan:'All Plans', env:'PRO', branch:'main', cron:'0 6 * * 1', cronHuman:'Every Monday at 06:00', enabled:true, lastRun:'Jun 2 06:00', nextRun:'Jun 9 06:00', lastStatus:'passed', last7:{passed:1,failed:0}, autoReport:true, notifyOn:'always', duration:'48m' },
  ],
  connectors: [
    { id:'con-001', name:'Jira', type:'task_tracker', icon:'jira', status:'connected', description:'Sprint tracking & test management', config:{ project:'VECI', url:'veci.atlassian.net' }, lastSync:'2m ago' },
    { id:'con-002', name:'GitHub', type:'code_repo', icon:'git', status:'connected', description:'Source code & CI/CD', config:{ org:'veci', repos:['booking-web','payment-api','loyalty-engine'] }, lastSync:'1m ago' },
    { id:'con-003', name:'Amadeus GDS', type:'external', icon:'api', status:'connected', description:'Flight inventory & pricing', config:{ mode:'test', url:'test.api.amadeus.com' }, lastSync:'15m ago' },
    { id:'con-004', name:'Slack', type:'notification', icon:'chat', status:'connected', description:'Notifications & alerts', config:{ workspace:'VECI', channels:['#qa-travel'] }, lastSync:'Active' },
    { id:'con-005', name:'Redsys', type:'external', icon:'api', status:'connected', description:'Payment gateway (Spain)', config:{ mode:'sandbox' }, lastSync:'30m ago' },
    { id:'con-006', name:'OpenAPI Spec', type:'api_spec', icon:'api', status:'connected', description:'API definitions', config:{ version:'v2.0', endpoints:72 }, lastSync:'2h ago' },
  ],
  teamMembers: [
    { name:'Patricia Moreno', email:'pmoreno@viajeseci.es', role:'Admin', status:'active', lastActive:'Just now', initials:'PM' },
    { name:'David Iglesias', email:'diglesias@viajeseci.es', role:'QA Expert', status:'active', lastActive:'1h ago', initials:'DI' },
    { name:'Raquel Vega', email:'rvega@viajeseci.es', role:'QA Expert', status:'active', lastActive:'3h ago', initials:'RV' },
    { name:'Sergio Ortiz', email:'sortiz@viajeseci.es', role:'Viewer', status:'active', lastActive:'1d ago', initials:'SO' },
  ],
  ssoProviders: [
    { name:'Azure AD', status:'active', protocol:'SAML 2.0', domain:'viajeseci.es', lastLogin:'Today 14:45', users:22 },
  ],
  notificationChannels: [
    { id:'email', name:'Email', icon:'send', status:'connected', config:'SMTP via Microsoft 365', recipients:4 },
    { id:'slack', name:'Slack', icon:'chat', status:'connected', config:'VECI workspace', recipients:3 },
    { id:'webhook', name:'Webhook', icon:'connectors', status:'connected', config:'https://hooks.veci.es/qa', recipients:1 },
  ],
};
window.QAAP_DATA = QAAP_DATA;