const { User, Project } = require('../models');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    // Create Admin
    const adminExists = await User.findOne({ where: { email: 'admin@ecogest.pt' } });
    if (!adminExists) {
      const hashedAdmin = await bcrypt.hash('123', 10);
      await User.create({
        name: 'Administrador',
        email: 'admin@ecogest.pt',
        password: hashedAdmin,
        role: 'admin'
      });
      console.log('Admin user created (admin@ecogest.pt / 123)');
    }

    // Create Coordinator
    const coordExists = await User.findOne({ where: { email: 'coordenador@ecogest.pt' } });
    if (!coordExists) {
      const hashedCoord = await bcrypt.hash('123', 10);
      await User.create({
        name: 'Coordenador Eco Escolas',
        email: 'coordenador@ecogest.pt',
        password: hashedCoord,
        role: 'coordinator'
      });
      console.log('Coordinator user created (coordenador@ecogest.pt / 123)');
    }

    // Create current project
    const currentYear = new Date().getFullYear();
    const projectExists = await Project.findOne({ where: { year: currentYear } });
    if (!projectExists) {
      const coord = await User.findOne({ where: { role: 'coordinator' } });
      await Project.create({
        name: `Eco Escolas ${currentYear}`,
        year: currentYear,
        coordinator_id: coord ? coord.user_id : null,
        status: 'active',
        level_id: 'silver'
      });
      console.log(`Initial project for ${currentYear} created.`);
    }

    console.log('Seeding finished.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
