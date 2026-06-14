require('dotenv').config();
const axios = require('axios');

const JIRA_URL = process.env.JIRA_URL || 'https://esmad-ecoscolas.atlassian.net';
const EMAIL = process.env.JIRA_EMAIL || '40220298@esmad.ipp.pt';
const API_TOKEN = process.env.JIRA_API_TOKEN;

const authHeader = 'Basic ' + Buffer.from(`${EMAIL}:${API_TOKEN}`).toString('base64');

async function inspectIssue(key) {
  try {
    const res = await axios.get(`${JIRA_URL}/rest/api/3/issue/${key}`, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
      }
    });
    console.log(`=== ${key} ===`);
    console.log(`Summary: ${res.data.fields.summary}`);
    console.log(`Type: ${res.data.fields.issuetype.name}`);
  } catch (err) {
    console.error(`❌ Erro ao inspecionar ${key}:`, err.response?.data || err.message);
  }
}

async function run() {
  await inspectIssue('PE-6');
  await inspectIssue('PE-7');
}

run();
