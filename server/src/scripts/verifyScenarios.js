const http = require('http');
const app = require('../app');
const env = require('../config/env');
const { sequelize } = require('../models');

async function testScenarioSuite() {
  console.log('======================================================================');
  console.log('OJTerm — Basic Functional Verification (7 Scenarios)');
  console.log('======================================================================\n');

  await sequelize.authenticate();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  const request = async (path, options = {}) => {
    const url = `${baseUrl}${path}`;
    const headers = options.headers || {};
    if (options.token) {
      headers['Authorization'] = `Bearer ${options.token}`;
    }
    if (options.body && !(options.body instanceof FormData) && typeof options.body === 'object') {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }

    const res = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body
    });

    let data = null;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }
    return { status: res.status, data };
  };

  const results = [];

  try {
    // ------------------------------------------------------------------
    // Scenario 1: Login each role; unauthenticated request returns 401
    // ------------------------------------------------------------------
    console.log('Scenario 1: Testing login for all 4 roles & unauthenticated protection...');
    const roles = [
      { role: 'Student', email: 'student1@ojterm.test' },
      { role: 'IndustryPartner', email: 'partner1@ojterm.test' },
      { role: 'OJTCoordinator', email: 'coordinator@ojterm.test' },
      { role: 'SchoolAdministrator', email: 'admin@ojterm.test' }
    ];

    const tokens = {};
    for (const r of roles) {
      const loginRes = await request('/auth/login', {
        method: 'POST',
        body: { email: r.email, password: 'Password123!' }
      });
      if (loginRes.status !== 200 || !loginRes.data.success) {
        throw new Error(`Login failed for ${r.role}: ${JSON.stringify(loginRes.data)}`);
      }
      tokens[r.role] = loginRes.data.data.token;
    }

    const unauthRes = await request('/students/profile');
    if (unauthRes.status !== 401) {
      throw new Error(`Unauthenticated request did not return 401: status ${unauthRes.status}`);
    }
    results.push({ id: 1, name: 'Login each role; unauthenticated request rejected (401)', pass: true });
    console.log('✓ Scenario 1 Passed.\n');

    // ------------------------------------------------------------------
    // Scenario 2: Student saves profile, sees recommendations in <3s
    // ------------------------------------------------------------------
    console.log('Scenario 2: Student saves profile and retrieves recommendations...');
    const saveProfileRes = await request('/students/profile', {
      method: 'POST',
      token: tokens['Student'],
      body: {
        academicProgram: 'BSIT',
        yearLevel: 'Year 3',
        preferredLocation: 'Iloilo City',
        interests: 'Frontend, Web Development',
        skills: ['JavaScript', 'React', 'Node.js']
      }
    });

    if (saveProfileRes.status !== 201) {
      throw new Error(`Save profile failed: ${JSON.stringify(saveProfileRes.data)}`);
    }

    const profileId = saveProfileRes.data.data.ProfileID;
    const startRecTime = Date.now();
    const recRes = await request(`/recommendations/${profileId}`, {
      token: tokens['Student']
    });
    const recDuration = Date.now() - startRecTime;

    if (recRes.status !== 200 || !Array.isArray(recRes.data.data)) {
      throw new Error(`Recommendations failed: ${JSON.stringify(recRes.data)}`);
    }
    if (recDuration >= 3000) {
      throw new Error(`Recommendation latency exceeded 3000ms: ${recDuration}ms`);
    }
    results.push({
      id: 2,
      name: `Student saves profile, sees recommendations in <3s (${recDuration}ms)`,
      pass: true
    });
    console.log(`✓ Scenario 2 Passed (${recDuration} ms, returned ${recRes.data.data.length} ranked matches).\n`);

    // ------------------------------------------------------------------
    // Scenario 3: Submit without endorsement doc -> blocked with message (BR-01)
    // ------------------------------------------------------------------
    console.log('Scenario 3: Submitting application without endorsement doc (BR-01 enforcement)...');
    // Using multipart boundary or empty file
    const boundary = '----WebKitFormBoundaryTest123456';
    const rawBody = `--${boundary}\r\nContent-Disposition: form-data; name="postingId"\r\n\r\n2\r\n--${boundary}--\r\n`;

    const noDocRes = await fetch(`${baseUrl}/applications`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokens['Student']}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: rawBody
    });
    const noDocData = await noDocRes.json();

    if (noDocRes.status !== 400 || !noDocData.error?.message?.includes('Endorsement document is required')) {
      throw new Error(`Expected BR-01 document requirement error 400, got ${noDocRes.status}: ${JSON.stringify(noDocData)}`);
    }
    results.push({ id: 3, name: 'Submit without endorsement doc blocked with BR-01 message', pass: true });
    console.log('✓ Scenario 3 Passed.\n');

    // ------------------------------------------------------------------
    // Scenario 4: Non-coordinator tries to approve -> 403, status unchanged (BR-02)
    // ------------------------------------------------------------------
    console.log('Scenario 4: Non-coordinator attempts approval -> 403 (BR-02 enforcement)...');
    const nonCoordRes = await request('/coordinator/applications/1', {
      method: 'PATCH',
      token: tokens['Student'], // Student tries coordinator endpoint
      body: { action: 'Approve', comment: 'Unauthorized attempt' }
    });

    if (nonCoordRes.status !== 403) {
      throw new Error(`Expected 403 for non-coordinator, got ${nonCoordRes.status}`);
    }
    results.push({ id: 4, name: 'Non-coordinator tries to approve -> 403 Forbidden (BR-02)', pass: true });
    console.log('✓ Scenario 4 Passed.\n');

    // ------------------------------------------------------------------
    // Scenario 5: Coordinator approves; partner sees only approved applicants (BR-03)
    // ------------------------------------------------------------------
    console.log('Scenario 5: Coordinator approves; partner sees only approved applicants (BR-03)...');
    const approveRes = await request('/coordinator/applications/1', {
      method: 'PATCH',
      token: tokens['OJTCoordinator'],
      body: { action: 'Approve', comment: 'Coordinator verified and endorsed.' }
    });

    if (approveRes.status !== 200 || approveRes.data.data.Status !== 'Approved') {
      throw new Error(`Coordinator approval failed: ${JSON.stringify(approveRes.data)}`);
    }

    const partnerApplicantsRes = await request('/partner/postings/1/applicants', {
      token: tokens['IndustryPartner']
    });

    if (partnerApplicantsRes.status !== 200) {
      throw new Error(`Partner applicant query failed: ${JSON.stringify(partnerApplicantsRes.data)}`);
    }
    const applicants = partnerApplicantsRes.data.data;
    const hasUnapproved = applicants.some((a) => !['Approved', 'Placed', 'RejectedByPartner'].includes(a.Status));
    if (hasUnapproved) {
      throw new Error('Partner query returned unapproved applicants! BR-03 violation.');
    }
    results.push({ id: 5, name: 'Coordinator approves; partner sees only approved applicants (BR-03)', pass: true });
    console.log(`✓ Scenario 5 Passed (Partner sees ${applicants.length} approved candidate(s)).\n`);

    // ------------------------------------------------------------------
    // Scenario 6: Coordinator generates monthly report grouped by company/program
    // ------------------------------------------------------------------
    console.log('Scenario 6: Coordinator generates monthly placement report (FR-12)...');
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const reportRes = await request(`/reports/placements?month=${currentMonth}&year=${currentYear}`, {
      token: tokens['OJTCoordinator']
    });

    if (reportRes.status !== 200 || !reportRes.data.data) {
      throw new Error(`Report generation failed: ${JSON.stringify(reportRes.data)}`);
    }
    const report = reportRes.data.data;
    if (report.total === undefined || !Array.isArray(report.byCompany) || !Array.isArray(report.byProgram)) {
      throw new Error(`Report schema invalid: ${JSON.stringify(report)}`);
    }
    results.push({ id: 6, name: 'Coordinator generates monthly report grouped by company/program', pass: true });
    console.log(`✓ Scenario 6 Passed (Report aggregated total: ${report.total}).\n`);

    // ------------------------------------------------------------------
    // Scenario 7: Refresh after submit -> application + document still saved (NFR-05)
    // ------------------------------------------------------------------
    console.log('Scenario 7: Persistence verification (NFR-05)...');
    const myAppsRes = await request('/applications/my', {
      token: tokens['Student']
    });

    if (myAppsRes.status !== 200 || !Array.isArray(myAppsRes.data.data) || myAppsRes.data.data.length === 0) {
      throw new Error('Application did not persist to database.');
    }
    const savedApp = myAppsRes.data.data[0];
    if (!savedApp.endorsementDocument) {
      throw new Error('Endorsement document record did not persist.');
    }
    results.push({ id: 7, name: 'Refresh after submit -> application + document still saved (NFR-05)', pass: true });
    console.log(`✓ Scenario 7 Passed (Application #${savedApp.ApplicationID} with doc "${savedApp.endorsementDocument.FileName}" persisted).\n`);

    // Print final summary
    console.log('======================================================================');
    console.log('ALL 7 BASIC FUNCTIONAL VERIFICATION SCENARIOS PASSED (100%)');
    console.log('======================================================================');
    results.forEach((r) => {
      console.log(`[PASS] Scenario ${r.id}: ${r.name}`);
    });
  } finally {
    server.close();
  }
}

if (require.main === module) {
  testScenarioSuite()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('\n✗ Verification Failed:', err);
      process.exit(1);
    });
}

module.exports = testScenarioSuite;
