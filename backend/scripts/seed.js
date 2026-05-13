require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const connectDB = require('../config/database');

const {
  User, Project, Activity, ActivityParticipant,
  Proposal, Meeting, MeetingDocument, CouncilMember,
} = require('../models');

async function seed() {
  await connectDB();
  console.log('\n🌱 A iniciar seed da base de dados...\n');

  // ── Limpar coleções ────────────────────────────────────────────────
  await Promise.all([
    User.deleteMany({}), Project.deleteMany({}),
    Activity.deleteMany({}), ActivityParticipant.deleteMany({}),
    Proposal.deleteMany({}), Meeting.deleteMany({}),
    MeetingDocument.deleteMany({}), CouncilMember.deleteMany({}),
  ]);
  console.log('🗑️  Coleções limpas.');

  // ── Utilizadores ──────────────────────────────────────────────────
  const hash = (pw) => bcrypt.hash(pw, 10);

  const [admin, coord, secretary, membro1, membro2, user1, user2] = await User.insertMany([
    { name: 'Administrador EcoGest', email: 'admin@ecogest.pt',          password: await hash('123'), role: 'admin',          status: 'active' },
    { name: 'Ana Coordenadora',       email: 'coordenador@ecogest.pt',    password: await hash('123'), role: 'coordinator',    status: 'active' },
    { name: 'Sofia Secretaria',       email: 'secretaria@ecogest.pt',     password: await hash('123'), role: 'secretary',      status: 'active' },
    { name: 'Carlos Membro',          email: 'membro1@ecogest.pt',        password: await hash('123'), role: 'council_member', status: 'active' },
    { name: 'Beatriz Membro',         email: 'membro2@ecogest.pt',        password: await hash('123'), role: 'council_member', status: 'active' },
    { name: 'João Silva',             email: 'joao@exemplo.pt',           password: await hash('123'), role: 'user',           status: 'active' },
    { name: 'Maria Santos',           email: 'maria@exemplo.pt',          password: await hash('123'), role: 'user',           status: 'active' },
  ]);
  console.log('👥 7 utilizadores criados.');

  // ── Projetos ──────────────────────────────────────────────────────
  const [proj2025, proj2026] = await Project.insertMany([
    { name: 'Eco Escolas 2025', year: 2025, coordinator: coord._id, status: 'finished', level: 'gold'   },
    { name: 'Eco Escolas 2026', year: 2026, coordinator: coord._id, status: 'active',   level: 'silver' },
  ]);
  console.log('📁 2 projetos criados.');

  // ── Membros do Conselho ───────────────────────────────────────────
  await CouncilMember.insertMany([
    { user: membro1._id, project: proj2026._id, role: 'Membro' },
    { user: membro2._id, project: proj2026._id, role: 'Membro' },
    { user: secretary._id, project: proj2026._id, role: 'Secretário' },
  ]);
  console.log('🏛️  Conselho configurado.');

  // ── Atividades ────────────────────────────────────────────────────
  const [actAgua, actRec, actJardim, actBio, actEnergia, actHorta, actMar, actAr] =
    await Activity.insertMany([
      {
        project: proj2026._id, name: 'Dia Mundial da Água',
        description: 'Sensibilização para a poupança de água e gestão sustentável dos recursos hídricos.',
        location: 'Escola EB 2/3', startDate: new Date('2026-03-22'),
        endDate: new Date('2026-03-22'), status: 'completed',
        visibility: 'public', areas: ['água'], createdBy: coord._id,
      },
      {
        project: proj2026._id, name: 'Campanha de Reciclagem',
        description: 'Recolha seletiva e sensibilização para a separação de resíduos na escola.',
        location: 'Pátio Principal', startDate: new Date('2026-04-01'),
        endDate: new Date('2026-04-30'), status: 'active',
        visibility: 'public', areas: ['resíduos'], createdBy: coord._id,
      },
      {
        project: proj2026._id, name: 'Jardim Sustentável',
        description: 'Criação de um jardim com plantas autóctones e sistemas de rega eficientes.',
        location: 'Espaço Verde da Escola', startDate: new Date('2026-05-15'),
        endDate: new Date('2026-06-15'), status: 'planned',
        visibility: 'public', areas: ['biodiversidade', 'água'], createdBy: coord._id,
      },
      {
        project: proj2026._id, name: 'Semana da Biodiversidade',
        description: 'Exposições, visitas e workshops sobre a fauna e flora local.',
        location: 'Biblioteca Escolar', startDate: new Date('2026-05-20'),
        endDate: new Date('2026-05-24'), status: 'active',
        visibility: 'public', areas: ['biodiversidade'], createdBy: admin._id,
      },
      {
        project: proj2026._id, name: 'Painéis Solares — Monitorização',
        description: 'Acompanhamento da produção energética dos painéis solares instalados.',
        location: 'Telhado do Pavilhão', startDate: new Date('2026-06-01'),
        endDate: new Date('2026-06-30'), status: 'planned',
        visibility: 'private', areas: ['energia'], createdBy: coord._id,
      },
      {
        project: proj2026._id, name: 'Horta Escolar — Plantação de Primavera',
        description: 'Plantação de legumes e ervas aromáticas na horta pedagógica.',
        location: 'Horta da Escola', startDate: new Date('2026-03-10'),
        endDate: new Date('2026-03-10'), status: 'completed',
        visibility: 'public', areas: ['alimentação sustentável'], createdBy: coord._id,
      },
      {
        project: proj2025._id, name: 'Limpeza da Praia — 2025',
        description: 'Ação de voluntariado para limpeza de microplásticos na praia local.',
        location: 'Praia da Costa', startDate: new Date('2025-09-21'),
        endDate: new Date('2025-09-21'), status: 'completed',
        visibility: 'public', areas: ['resíduos', 'água'], createdBy: coord._id,
      },
      {
        project: proj2026._id, name: 'Qualidade do Ar — Monitorização',
        description: 'Instalação de sensores para monitorização da qualidade do ar interior.',
        location: 'Salas de Aula', startDate: new Date('2026-09-01'),
        endDate: new Date('2026-12-31'), status: 'planned',
        visibility: 'public', areas: ['ar'], createdBy: admin._id,
      },
    ]);
  console.log('🌿 8 atividades criadas.');

  // ── Participações ─────────────────────────────────────────────────
  await ActivityParticipant.insertMany([
    { activity: actAgua._id,  user: user1._id },
    { activity: actAgua._id,  user: user2._id },
    { activity: actAgua._id,  user: membro1._id },
    { activity: actRec._id,   user: user1._id },
    { activity: actRec._id,   user: membro2._id },
    { activity: actBio._id,   user: user2._id },
    { activity: actBio._id,   user: user1._id },
    { activity: actHorta._id, user: user1._id },
    { activity: actHorta._id, guestName: 'Pedro Alves', guestEmail: 'pedro@gmail.com' },
    { activity: actMar._id,   user: user1._id },
    { activity: actMar._id,   user: user2._id },
    { activity: actMar._id,   user: membro1._id },
  ]);
  console.log('🙋 12 participações criadas.');

  // ── Propostas ─────────────────────────────────────────────────────
  const [prop1, prop2, prop3, prop4] = await Proposal.insertMany([
    {
      title: 'Campanha de Reutilização de Materiais',
      description: 'Recolha de materiais usados para reutilização criativa nas aulas de artes.',
      area: 'resíduos', startDate: new Date('2026-05-01'), endDate: new Date('2026-05-31'),
      resources: 'Caixas de recolha, voluntários', project: proj2026._id,
      createdBy: membro1._id, status: 'approved', reviewedBy: coord._id,
      reviewNote: 'Proposta aprovada. Atividade criada automaticamente.',
    },
    {
      title: 'Teatro Ambiental — Peça sobre Plásticos',
      description: 'Encenação de peça teatral sobre os malefícios dos plásticos descartáveis.',
      area: 'resíduos', startDate: new Date('2026-06-10'), endDate: new Date('2026-06-10'),
      resources: 'Adereços, figurinos reciclados', project: proj2026._id,
      createdBy: membro2._id, status: 'rejected', reviewedBy: coord._id,
      reviewNote: 'Atividade semelhante já existe no programa. Reavalie.',
    },
    {
      title: 'Compostagem Escolar',
      description: 'Implementação de compostores para restos orgânicos da cantina.',
      area: 'resíduos', startDate: new Date('2026-07-01'), endDate: new Date('2026-12-31'),
      resources: 'Compostores, formação inicial', project: proj2026._id,
      createdBy: membro1._id, status: 'pending',
    },
    {
      title: 'Poupança de Energia — Concurso de Turmas',
      description: 'Concurso entre turmas para incentivar a poupança de energia elétrica.',
      area: 'energia', startDate: new Date('2026-10-01'), endDate: new Date('2026-12-01'),
      resources: 'Medidores de consumo, prémios simbólicos', project: proj2026._id,
      createdBy: membro2._id, status: 'pending',
    },
  ]);
  console.log('📋 4 propostas criadas.');

  // ── Reuniões ──────────────────────────────────────────────────────
  const [meet1, meet2, meet3] = await Meeting.insertMany([
    {
      name: 'Reunião de Arranque — Eco Escolas 2026',
      date: new Date('2026-01-15T14:00:00'),
      description: 'Definição do plano anual, distribuição de tarefas e calendarização das atividades.',
      project: proj2026._id,
    },
    {
      name: 'Reunião de Acompanhamento — 1º Semestre',
      date: new Date('2026-04-20T15:30:00'),
      description: 'Avaliação das atividades do 1º semestre e revisão do plano para o 2º semestre.',
      project: proj2026._id,
    },
    {
      name: 'Reunião de Encerramento Anual',
      date: new Date('2026-07-10T14:00:00'),
      description: 'Análise dos resultados do ano letivo e preparação do relatório final.',
      project: proj2026._id,
    },
  ]);

  await MeetingDocument.insertMany([
    { meeting: meet1._id, name: 'Agenda_Reunião_Janeiro.pdf',      documentUrl: '/uploads/agenda_jan.pdf',   type: 'agenda',   uploadedBy: secretary._id },
    { meeting: meet1._id, name: 'Ata_Reunião_Janeiro.pdf',         documentUrl: '/uploads/ata_jan.pdf',      type: 'minutes',  uploadedBy: secretary._id },
    { meeting: meet2._id, name: 'Agenda_Reunião_Abril.pdf',        documentUrl: '/uploads/agenda_abr.pdf',   type: 'agenda',   uploadedBy: secretary._id },
    { meeting: meet2._id, name: 'Relatório_1Semestre.pdf',         documentUrl: '/uploads/rel_sem1.pdf',     type: 'other',    uploadedBy: coord._id },
  ]);
  console.log('📅 3 reuniões e 4 documentos criados.');

  // ── Resumo ─────────────────────────────────────────────────────────
  console.log('\n✅ Seed concluído com sucesso!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  📧 Credenciais de acesso:');
  console.log('  admin@ecogest.pt        / 123  (admin)');
  console.log('  coordenador@ecogest.pt  / 123  (coordinator)');
  console.log('  secretaria@ecogest.pt   / 123  (secretary)');
  console.log('  membro1@ecogest.pt      / 123  (council_member)');
  console.log('  membro2@ecogest.pt      / 123  (council_member)');
  console.log('  joao@exemplo.pt         / 123  (user)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed falhou:', err.message);
  process.exit(1);
});
