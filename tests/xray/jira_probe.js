require('dotenv').config();
const axios = require('axios');

const JIRA_URL = process.env.JIRA_URL || 'https://esmad-ecoscolas.atlassian.net';
const EMAIL = process.env.JIRA_EMAIL || '40220298@esmad.ipp.pt';
const API_TOKEN = process.env.JIRA_API_TOKEN;

if (!API_TOKEN) {
  console.error('❌ Erro: JIRA_API_TOKEN não está definido no .env!');
  process.exit(1);
}

const authHeader = 'Basic ' + Buffer.from(`${EMAIL}:${API_TOKEN}`).toString('base64');

async function probeJira() {
  console.log(`📡 A ligar ao Jira em ${JIRA_URL}...`);
  try {
    const res = await axios.get(`${JIRA_URL}/rest/api/3/project`, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
      }
    });
    console.log('✅ Conectado com sucesso!');
    console.log('Projetos encontrados:');
    res.data.forEach(p => {
      console.log(`- [${p.key}] ${p.name} (ID: ${p.id})`);
    });
  } catch (err) {
    console.error('❌ Falha na ligação ao Jira:', err.response?.data || err.message);
  }
}

probeJira();
