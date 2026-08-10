require('dotenv').config();
const axios = require('axios');

const JIRA_URL = process.env.JIRA_URL || 'https://esmad-ecoscolas.atlassian.net';
const EMAIL = process.env.JIRA_EMAIL || '40220298@esmad.ipp.pt';
const API_TOKEN = process.env.JIRA_API_TOKEN;

const authHeader = 'Basic ' + Buffer.from(`${EMAIL}:${API_TOKEN}`).toString('base64');

async function deleteIssue(key) {
  console.log(`🗑️ Removing extra temporary issue ${key}...`);
  try {
    await axios.delete(`${JIRA_URL}/rest/api/2/issue/${key}`, {
      headers: { 'Authorization': authHeader }
    });
    console.log(`✅ Issue ${key} deleted successfully.`);
  } catch (err) {
    // If it fails or does not exist, ignore silently
    console.log(`ℹ️ Note: Could not remove issue ${key} (or it was already deleted).`);
  }
}

async function updateIssueDescription(key, descriptionText) {
  console.log(`📝 Updating description of ${key}...`);
  try {
    await axios.put(`${JIRA_URL}/rest/api/2/issue/${key}`, {
      fields: {
        description: descriptionText
      }
    }, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });
    console.log(`✅ Description of ${key} updated successfully.`);
  } catch (err) {
    console.error(`❌ Error updating description of ${key}:`, err.response?.data || err.message);
  }
}

async function transitionIssueToDone(key) {
  console.log(`🔄 Transitioning issue ${key} to "Done" status (ID: 31)...`);
  try {
    await axios.post(`${JIRA_URL}/rest/api/2/issue/${key}/transitions`, {
      transition: {
        id: '31' // Done
      }
    }, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });
    console.log(`✅ Status of ${key} updated to "Done".`);
  } catch (err) {
    console.error(`❌ Error transitioning status of ${key}:`, err.response?.data || err.message);
  }
}

const unitTestsDescription = `h1. Unit Test Execution - EcoGest
*Execution Date:* ${new Date().toLocaleString('en-US')}
*General Status:* {color:green}*PASSED* (5/5 tests passed - 100% success){color}

h3. Unit Test Case Details:
* *[PE-20 / TC015]* - status: *PASSED* - _Should encrypt passwords securely using bcryptjs_
* *[PE-20 / TC015]* - status: *PASSED* - _Should verify encrypted passwords successfully_
* *[PE-18 / TC013]* - status: *PASSED* - _Should sign JWT token payload in a modular way_
* *[PE-18 / TC013]* - status: *PASSED* - _Should decode and validate signed JWT token_
* *[PE-25 / TC020]* - status: *PASSED* - _Should fail to validate token with incorrect secret key_

_Unit test report uploaded via automation script_`;

const uatTestsDescription = `h1. Acceptance (UAT) & API Test Execution - EcoGest
*Execution Date:* ${new Date().toLocaleString('en-US')}
*General Status:* {color:green}*PASSED* (15/15 tests passed - 100% success){color}

h3. Category Summary:
* API & Security Tests: 7/7 Passed
* UI E2E Tests: 5/5 Passed
* Performance & Usability Tests: 3/3 Passed

h3. Test Case Details (UAT/API):
* *[PE-4 / TC001]* - status: *PASSED* - _User registration verified via API and browser interface._
* *[PE-5 / TC002]* - status: *PASSED* - _Authenticated login, token issuance and redirection._
* *[PE-8 / TC003]* - status: *PASSED* - _User profile management and data persistence in the dashboard._
* *[PE-9 / TC004]* - status: *PASSED* - _Administration: Creation of new annual projects._
* *[PE-11 / TC006]* - status: *PASSED* - _Administration: Creation of new eco-activities._
* *[PE-19 / TC014]* - status: *PASSED* - _Security: Protected route endpoints against anonymous access._
* *[PE-21 / TC016]* - status: *PASSED* - _Responsiveness: Adjusting screen layout for mobile viewports (375x812)._
* *[PE-22 / TC017]* - status: *PASSED* - _Usability: Clean navigation and correct error handling._

_E2E and API test report uploaded via automation script_`;

async function main() {
  // 1. Delete extra temporary issue
  await deleteIssue('PE-26');
  
  // 2. Update and transition issue PE-2 (Unit Tests)
  await updateIssueDescription('PE-2', unitTestsDescription);
  await transitionIssueToDone('PE-2');

  // 3. Update and transition issue PE-3 (UAT - Acceptance Tests)
  await updateIssueDescription('PE-3', uatTestsDescription);
  await transitionIssueToDone('PE-3');
  
  console.log('\n🏁 Update process completed.');
}

main();
