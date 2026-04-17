const { User, Project, Activity, Proposal, Meeting } = require('../models');

async function checkTable() {
  const tableName = process.argv[2] || 'Users'; // Default table
  try {
    const models = { Users: User, Projects: Project, Activities: Activity, Proposals: Proposal, Meetings: Meeting };
    
    // Case insensitive match
    const modelKey = Object.keys(models).find(k => k.toLowerCase() === tableName.toLowerCase());
    const Model = models[modelKey];

    if (!Model) {
      console.log(`\n❌ Tabela "${tableName}" não mapeada no script.`);
      console.log(`Tabelas disponíveis: ${Object.keys(models).join(', ')}`);
      process.exit(0);
    }

    const data = await Model.findAll();
    console.log(`\n=== Dados da Tabela: ${modelKey} ===`);
    if (data.length === 0) {
      console.log('Tabela vazia.');
    } else {
      // Show first 20 rows nicely formatted
      console.table(data.slice(0, 20).map(d => {
        const item = d.toJSON();
        // Remove timestamps for cleaner view
        delete item.createdAt;
        delete item.updatedAt;
        delete item.password; // Don't show hashed pass
        return item;
      }));
    }
    process.exit(0);
  } catch (error) {
    console.error('Erro ao consultar:', error.message);
    process.exit(1);
  }
}

checkTable();
