require('dotenv').config();
const axios = require('axios');

const JIRA_URL = process.env.JIRA_URL || 'https://esmad-ecoscolas.atlassian.net';
const EMAIL = process.env.JIRA_EMAIL || '40220298@esmad.ipp.pt';
const API_TOKEN = process.env.JIRA_API_TOKEN;

const authHeader = 'Basic ' + Buffer.from(`${EMAIL}:${API_TOKEN}`).toString('base64');

async function getIssueTypes() {
  try {
    const res = await axios.get(`${JIRA_URL}/rest/api/3/issuetype`, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
      }
    });
    console.log('Issue Types disponíveis globalmente:');
    res.data.forEach(t => {
      console.log(`- [${t.name}] (ID: ${t.id}) - Descrição: ${t.description}`);
    });
  } catch (err) {
    console.error('❌ Erro ao obter issue types:', err.response?.data || err.message);
  }
}

getIssueTypes();
