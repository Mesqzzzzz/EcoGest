require('dotenv').config();
const axios = require('axios');

const JIRA_URL = process.env.JIRA_URL || 'https://esmad-ecoscolas.atlassian.net';
const EMAIL = process.env.JIRA_EMAIL || '40220298@esmad.ipp.pt';
const API_TOKEN = process.env.JIRA_API_TOKEN;

const authHeader = 'Basic ' + Buffer.from(`${EMAIL}:${API_TOKEN}`).toString('base64');

async function listAllIssues() {
  console.log('🔍 Searching all issues in the PE project using /search/jql...');
  const jql = 'project = PE ORDER BY key ASC';
  try {
    const res = await axios.post(`${JIRA_URL}/rest/api/3/search/jql`, {
      jql: jql,
      maxResults: 100
    }, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    const issues = res.data.issues || [];
    console.log(`Found ${issues.length} issues. Loading details for each one...`);
    
    for (const item of issues) {
      try {
        const detailRes = await axios.get(`${JIRA_URL}/rest/api/3/issue/${item.id}`, {
          headers: {
            'Authorization': authHeader,
            'Accept': 'application/json'
          }
        });
        console.log(`- [${detailRes.data.key}] ${detailRes.data.fields.summary} (Type: ${detailRes.data.fields.issuetype.name})`);
      } catch (e) {
        console.error(`❌ Failed to get details for ID ${item.id}:`, e.message);
      }
    }
  } catch (err) {
    console.error('❌ JQL query error:', err.response?.data || err.message);
  }
}

listAllIssues();
