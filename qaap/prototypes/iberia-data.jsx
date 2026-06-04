// QAAP Mock Data — Iberia Airlines QA
const QAAP_DATA = {
  user: { name: 'Carlos Rivas', email: 'crivas@iberia.es', role: 'QA Lead', initials: 'CR' },
  tenant: { name: 'Iberia', slug: 'iberia', logo: 'assets/iberia-logo.png' },

  testPlans: [
    { id:'tp-001', name:'Flight Booking Engine E2E', modality:'web', framework:'Playwright', status:'approved', scenarioCount:32, passRate:96, lastUpdated:'1h ago', assignedTo:'Carlos Rivas', health:'healthy', trend:[94,93,95,94,96,95,97,96,96], market:'Global', vertical:'Booking', platforms:['Desktop','Mobile'] },
    { id:'tp-002', name:'Check-in & Boarding Pass', modality:'web', framework:'Playwright', status:'approved', scenarioCount:22, passRate:94, lastUpdated:'2h ago', assignedTo:'Carlos Rivas', health:'healthy', trend:[92,91,93,92,95,94,96,93,94], market:'Global', vertical:'Check-in', platforms:['Desktop','Mobile'] },
    { id:'tp-003', name:'Iberia Plus Loyalty API', modality:'api', framework:'Karate', status:'review', scenarioCount:18, passRate:89, lastUpdated:'30m ago', assignedTo:'Elena Martín', health:'degrading', trend:[96,94,92,90,88,91,89,87,89], market:'Global', vertical:'Loyalty', platforms:['API'] },
    { id:'tp-004', name:'NDC Offer & Order API', modality:'api', framework:'Karate', status:'approved', scenarioCount:36, passRate:99, lastUpdated:'4h ago', assignedTo:'Roberto Álvarez', health:'healthy', trend:[98,99,99,98,99,99,100,99,99], market:'Global', vertical:'NDC', platforms:['API'] },
    { id:'tp-005', name:'Disruption Management', modality:'web', framework:'Cypress', status:'generating', scenarioCount:12, passRate:null, lastUpdated:'15m ago', assignedTo:'Elena Martín', health:null, trend:[], market:'Global', vertical:'Operations', platforms:['Desktop'] },
    { id:'tp-006', name:'iOS Iberia App', modality:'ios', framework:'XCTest', status:'draft', scenarioCount:10, passRate:null, lastUpdated:'2d ago', assignedTo:'Roberto Álvarez', health:null, trend:[], market:'Global', vertical:'Mobile', platforms:['iOS'] },
    { id:'tp-007', name:'Ancillary Services (Seats, Bags)', modality:'web', framework:'Playwright', status:'approved', scenarioCount:20, passRate:95, lastUpdated:'3h ago', assignedTo:'Carlos Rivas', health:'healthy', trend:[93,94,95,94,96,95,97,95,95], market:'Global', vertical:'Ancillaries', platforms:['Desktop','Mobile'] },
    { id:'tp-008', name:'Revenue Management API', modality:'api', framework:'Karate', status:'review', scenarioCount:14, passRate:84, lastUpdated:'1d ago', assignedTo:'Elena Martín', health:'degrading', trend:[91,89,87,85,84,83,82,84,84], market:'Global', vertical:'Revenue', platforms:['API'] },
  ],

  scenarios: [
    { id:'s-001', name:'Book MAD-JFK round-trip economy', confidence:96, status:'approved', feature:'Booking' },
    { id:'s-002', name:'Online check-in with seat selection', confidence:93, status:'approved', feature:'Check-in' },
    { id:'s-003', name:'Redeem Avios for upgrade to Business', confidence:89, status:'approved', feature:'Loyalty' },
    { id:'s-004', name:'IRROPS: rebooking after cancellation', confidence:68, status:'pending', feature:'Disruption' },
    { id:'s-005', name:'Add extra baggage to booking', confidence:92, status:'approved', feature:'Ancillaries' },
    { id:'s-006', name:'Multi-city itinerary pricing', confidence:86, status:'pending', feature:'Booking' },
    { id:'s-007', name:'NDC offer search with Amadeus', confidence:95, status:'approved', feature:'NDC' },
    { id:'s-008', name:'Apple Pay on mobile booking', confidence:47, status:'rejected', feature:'Payments' },
    { id:'s-009', name:'Group booking (10+ pax)', confidence:74, status:'pending', feature:'Booking' },
    { id:'s-010', name:'Boarding pass wallet integration', confidence:99, status:'approved', feature:'Check-in' },
    { id:'s-011', name:'Lounge access validation', confidence:91, status:'approved', feature:'Loyalty' },
    { id:'s-012', name:'Flight status push notification', confidence:87, status:'approved', feature:'Operations' },
    { id:'s-013', name:'Fare family comparison display', confidence:94, status:'approved', feature:'Booking' },
    { id:'s-014', name:'PNR retrieve & manage booking', confidence:79, status:'pending', feature:'Booking' },
    { id:'s-015', name:'Concurrent seat selection conflict', confidence:54, status:'rejected', feature:'Ancillaries' },
  ],

  gherkinContent: `Feature: Flight Booking Engine
  As a passenger
  I want to book a flight on iberia.com
  So that I can travel to my destination

  @approved @confidence:96
  Scenario: Book MAD-JFK round-trip economy
    Given I am on iberia.com homepage
    When I search for flights from "Madrid (MAD)" to "New York (JFK)"
    And I select dates "Aug 15" to "Aug 22"
    And I choose 1 adult, Economy class
    Then I should see available flights
    When I select outbound flight "IB6251"
    And I select return flight "IB6252"
    And I choose fare "Economy Óptima"
    And I complete passenger details
    And I pay with credit card
    Then I should see booking confirmation with PNR
    And I should receive confirmation email

  @pending @confidence:68
  Scenario: IRROPS rebooking after cancellation
    Given flight "IB3214" MAD-BCN is cancelled
    And passenger "crivas@iberia.es" has a confirmed booking
    When the disruption management system triggers
    Then passenger should receive SMS notification
    And alternative flights should be offered
    When I select alternative "IB3218" 
    Then rebooking should be confirmed automatically`,

  generatedCode: `import { test, expect } from '@playwright/test';

test.describe('Flight Booking Engine', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.iberia.com');
    await page.click('[data-testid="cookie-accept"]');
  });

  test('book MAD-JFK round-trip economy', async ({ page }) => {
    await page.fill('[data-testid="origin"]', 'Madrid');
    await page.fill('[data-testid="destination"]', 'New York');
    await page.click('[data-testid="search-flights"]');
    await expect(page.locator('[data-testid="flight-results"]')).toBeVisible();
    await page.click('[data-testid="flight-IB6251"]');
    await expect(page.locator('[data-testid="fare-selector"]')).toBeVisible();
  });
});`,

  chatMessages: [
    { role:'system', content:'Plan loaded: Flight Booking Engine E2E — 32 scenarios. Sources: Jira (IBERIA-Sprint-56), GitHub (iberia/booking-web), Amadeus NDC API v21.2, internal DCS (Departure Control).' },
    { role:'user', content:'Add test for IRROPS automatic rebooking when flight is cancelled' },
    { role:'assistant', content:'Added **Scenario: IRROPS rebooking after cancellation**. Confidence: 68% — Disruption management relies on multiple external systems (DCS, crew scheduling, airport ops).', model:'Claude Sonnet 4' },
  ],

  executions: [
    { id:'ex-001', date:'Today 14:45', env:'PRE', status:'passed', passRate:94, duration:'6m 32s', trigger:'manual', passed:30, failed:2, skipped:0 },
    { id:'ex-002', date:'Today 08:00', env:'PRE', status:'failed', passRate:87, duration:'5m 48s', trigger:'cron', passed:28, failed:4, skipped:0 },
    { id:'ex-003', date:'Yesterday 22:00', env:'PRO', status:'passed', passRate:100, duration:'7m 15s', trigger:'cron', passed:32, failed:0, skipped:0 },
    { id:'ex-004', date:'Yesterday 15:30', env:'DEV', status:'passed', passRate:91, duration:'5m 05s', trigger:'webhook', passed:29, failed:3, skipped:0 },
    { id:'ex-005', date:'Jun 2 08:00', env:'PRE', status:'failed', passRate:82, duration:'6m 40s', trigger:'cron', passed:26, failed:6, skipped:0 },
  ],

  recentActivity: [
    { type:'execution', text:'Flight Booking Engine passed on PRE', time:'2h ago', status:'success' },
    { type:'generation', text:'Disruption Management generating…', time:'15m ago', status:'info' },
    { type:'review', text:'Iberia Plus Loyalty API needs review', time:'30m ago', status:'warning' },
    { type:'approval', text:'NDC Offer & Order API approved', time:'4h ago', status:'success' },
    { type:'alert', text:'Revenue Management pass rate below 85%', time:'1h ago', status:'error' },
    { type:'proposal', text:'AI suggested 3 new tests for NDC', time:'5h ago', status:'info' },
  ],

  healthMetrics: { overallPassRate:93.8, totalExecutions:204, flakyTests:4, coverageScore:85 },
  healthPlans: [
    { name:'Flight Booking Engine E2E', health:'healthy', passRate:96, trend:[94,93,95,94,96,95,97,96,96], lastRun:'1h ago', scenarios:32 },
    { name:'Iberia Plus Loyalty API', health:'degrading', passRate:89, trend:[96,94,92,90,88,91,89,87,89], lastRun:'30m ago', scenarios:18 },
    { name:'Check-in & Boarding Pass', health:'healthy', passRate:94, trend:[92,91,93,92,95,94,96,93,94], lastRun:'2h ago', scenarios:22 },
    { name:'NDC Offer & Order API', health:'healthy', passRate:99, trend:[98,99,99,98,99,99,100,99,99], lastRun:'4h ago', scenarios:36 },
  ],
  flakyTests: [
    { name:'Amadeus GDS search timeout', plan:'Flight Booking Engine E2E', flakeRate:26, lastFlake:'Today 08:00' },
    { name:'Boarding pass PDF generation', plan:'Check-in & Boarding Pass', flakeRate:18, lastFlake:'Yesterday' },
    { name:'Avios balance sync delay', plan:'Iberia Plus Loyalty API', flakeRate:14, lastFlake:'Jun 2' },
    { name:'Seat map WebSocket connection', plan:'Ancillary Services', flakeRate:11, lastFlake:'Jun 1' },
  ],
  alerts: [
    { severity:'critical', message:'Revenue Management pass rate dropped to 84%', time:'1h ago', plan:'Revenue Management API' },
    { severity:'warning', message:'Flaky: Amadeus GDS search timeout (26%)', time:'3h ago', plan:'Flight Booking Engine E2E' },
    { severity:'info', message:'Check-in flow recovered to healthy', time:'2h ago', plan:'Check-in & Boarding Pass' },
  ],
  executionDetails: [
    { id:'ex-001', date:'Today 14:45', env:'PRE', status:'passed', passRate:94, duration:'6m 32s', trigger:'manual', triggeredBy:'Carlos Rivas', branch:'main', passed:30, failed:2, skipped:0, results:[
      { scenario:'Book MAD-JFK round-trip economy', status:'passed', duration:'16.2s' },
      { scenario:'Online check-in with seat selection', status:'passed', duration:'11.4s' },
      { scenario:'Redeem Avios for upgrade to Business', status:'passed', duration:'9.8s' },
      { scenario:'IRROPS: rebooking after cancellation', status:'failed', duration:'24.7s', error:'DCS mock returned 503 — Departure Control System unavailable during maintenance window', screenshot:'irrops-fail.png', classification:'Environment Issue', rootCause:'DCS (Departure Control System) was in scheduled maintenance. The disruption engine depends on real-time DCS data to calculate rebooking options.' },
      { scenario:'Add extra baggage to booking', status:'passed', duration:'7.6s' },
    ]},
    { id:'ex-002', date:'Today 08:00', env:'PRE', status:'failed', passRate:87, duration:'5m 48s', trigger:'cron', triggeredBy:'Scheduled', branch:'main', passed:28, failed:4, skipped:0, results:[] },
    { id:'ex-003', date:'Yesterday 22:00', env:'PRO', status:'passed', passRate:100, duration:'7m 15s', trigger:'cron', triggeredBy:'Scheduled', branch:'main', passed:32, failed:0, skipped:0, results:[] },
  ],
  aiProposals: [
    { id:'prop-001', type:'bug_detection', title:'Seat selection race condition on high-demand flights', description:'Two passengers can simultaneously select the same seat on popular routes (MAD-BCN shuttle). Seat locking mechanism has a 2s gap.', confidence:93, status:'proposed', source:'Execution #192', affectedFiles:['src/services/SeatMapService.ts'], plan:'Ancillary Services (Seats, Bags)', diff:null },
    { id:'prop-002', type:'coverage_gap', title:'No tests for codeshare bookings (BA/AA)', description:'Codeshare flights operated by British Airways or American Airlines have zero E2E booking coverage.', confidence:82, status:'proposed', source:'Source analysis', affectedFiles:['src/services/CodeshareService.ts'], plan:'Flight Booking Engine E2E', diff:null },
    { id:'prop-003', type:'fix_proposal', title:'Update NDC schema version assertion', description:'Amadeus NDC responses now use schema v21.3 instead of v21.2.', confidence:98, status:'accepted', source:'Execution #192', affectedFiles:['tests/e2e/ndc-offer.spec.ts'], plan:'NDC Offer & Order API', diff:null },
    { id:'prop-004', type:'test_improvement', title:'Add Avios expiry edge case', description:'Avios points expiring mid-booking flow are not handled gracefully.', confidence:76, status:'proposed', source:'Trend analysis', affectedFiles:['src/services/LoyaltyService.ts'], plan:'Iberia Plus Loyalty API', diff:null },
  ],
  reports: [
    { id:'rep-001', name:'Booking Engine — Nightly Regression', plan:'Flight Booking Engine E2E', execution:'ex-001', format:'HTML', date:'Today 14:50', status:'ready', size:'2.8 MB' },
    { id:'rep-002', name:'NDC API — Weekly Summary', plan:'NDC Offer & Order API', execution:null, format:'PDF', date:'Today 10:00', status:'ready', size:'1.6 MB' },
    { id:'rep-003', name:'Sprint 56 — QA Summary', plan:null, execution:null, format:'PDF', date:'Yesterday', status:'ready', size:'4.2 MB' },
  ],
  deliveryConfigs: [
    { id:'del-001', name:'Nightly QA Report', trigger:'After nightly regression', recipients:['qa-digital@iberia.es','#qa-booking (Slack)'], format:'HTML', plans:['Flight Booking Engine E2E','Check-in & Boarding Pass'], enabled:true },
    { id:'del-002', name:'Weekly Summary to Product', trigger:'Every Monday 09:00', recipients:['product-leads@iberia.es'], format:'PDF', plans:['All plans'], enabled:true },
  ],
  schedules: [
    { id:'sch-001', name:'Nightly — Booking Engine', plan:'Flight Booking Engine E2E', env:'PRO', branch:'main', cron:'0 4 * * *', cronHuman:'Every day at 04:00 AM', enabled:true, lastRun:'Today 04:00', nextRun:'Tomorrow 04:00', lastStatus:'passed', last7:{passed:6,failed:1}, autoReport:true, notifyOn:'failure', duration:'35m' },
    { id:'sch-002', name:'Nightly — Check-in', plan:'Check-in & Boarding Pass', env:'PRO', branch:'main', cron:'0 4 * * *', cronHuman:'Every day at 04:00 AM', enabled:true, lastRun:'Today 04:00', nextRun:'Tomorrow 04:00', lastStatus:'passed', last7:{passed:5,failed:2}, autoReport:true, notifyOn:'always', duration:'20m' },
    { id:'sch-003', name:'PR Validation — NDC', plan:'NDC Offer & Order API', env:'DEV', branch:'feature/*', cron:null, cronHuman:'On PR with label: qa-ndc', enabled:true, lastRun:'Today 11:30', nextRun:'On next PR', lastStatus:'passed', last7:{passed:5,failed:1}, autoReport:false, notifyOn:'failure', prLabels:['qa-ndc'], duration:'15m' },
    { id:'sch-004', name:'Weekly Full Suite', plan:'All Plans', env:'PRO', branch:'main', cron:'0 5 * * 1', cronHuman:'Every Monday at 05:00', enabled:true, lastRun:'Jun 2 05:00', nextRun:'Jun 9 05:00', lastStatus:'passed', last7:{passed:1,failed:0}, autoReport:true, notifyOn:'always', duration:'55m' },
  ],
  connectors: [
    { id:'con-001', name:'Jira', type:'task_tracker', icon:'jira', status:'connected', description:'Sprint tracking & test management', config:{ project:'IBERIA', url:'iberia.atlassian.net' }, lastSync:'2m ago' },
    { id:'con-002', name:'GitHub', type:'code_repo', icon:'git', status:'connected', description:'Source code & CI/CD pipelines', config:{ org:'iberia', repos:['booking-web','checkin-api','ndc-gateway','loyalty-engine'] }, lastSync:'1m ago' },
    { id:'con-003', name:'Amadeus GDS', type:'external', icon:'api', status:'connected', description:'Flight inventory, pricing & NDC', config:{ mode:'certification', url:'ndc.amadeus.com' }, lastSync:'5m ago' },
    { id:'con-004', name:'Slack', type:'notification', icon:'chat', status:'connected', description:'Notifications & alerts', config:{ workspace:'Iberia Digital', channels:['#qa-booking','#qa-ops'] }, lastSync:'Active' },
    { id:'con-005', name:'AWS S3', type:'storage', icon:'doc', status:'connected', description:'Test artifacts & screenshots', config:{ bucket:'iberia-qa', region:'eu-west-1' }, lastSync:'10m ago' },
    { id:'con-006', name:'IATA NDC Schema', type:'api_spec', icon:'api', status:'connected', description:'NDC standard definitions', config:{ version:'21.3', endpoints:48 }, lastSync:'1h ago' },
  ],
  teamMembers: [
    { name:'Carlos Rivas', email:'crivas@iberia.es', role:'Admin', status:'active', lastActive:'Just now', initials:'CR' },
    { name:'Elena Martín', email:'emartin@iberia.es', role:'QA Expert', status:'active', lastActive:'1h ago', initials:'EM' },
    { name:'Roberto Álvarez', email:'ralvarez@iberia.es', role:'QA Expert', status:'active', lastActive:'3h ago', initials:'RA' },
    { name:'Sofía Pérez', email:'sperez@iberia.es', role:'Viewer', status:'active', lastActive:'1d ago', initials:'SP' },
  ],
  ssoProviders: [
    { name:'Azure AD', status:'active', protocol:'SAML 2.0', domain:'iberia.es', lastLogin:'Today 14:45', users:32 },
    { name:'IAG Connect', status:'active', protocol:'OIDC', domain:'iairgroup.com', lastLogin:'Today 12:00', users:8 },
  ],
  notificationChannels: [
    { id:'email', name:'Email', icon:'send', status:'connected', config:'SMTP via Microsoft 365', recipients:4 },
    { id:'slack', name:'Slack', icon:'chat', status:'connected', config:'Iberia Digital workspace', recipients:3 },
    { id:'webhook', name:'Webhook', icon:'connectors', status:'connected', config:'https://hooks.iberia.es/qa-alerts', recipients:1 },
  ],
};
window.QAAP_DATA = QAAP_DATA;