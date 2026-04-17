// Mock Data based on the API Plan - Grupo 31 EcoGest

export const mockUsers = [
  { id: 1, name: "Ana Silva", email: "admin@ecogest.pt", password: "123", role: "admin", status: "active", joined: "2025-09-01" },
  { id: 2, name: "Carlos Mendes", email: "coordenador@ecogest.pt", password: "123", role: "coordinator", status: "active", joined: "2025-09-05" },
  { id: 3, name: "Sofia Rodrigues", email: "conselheiro@ecogest.pt", password: "123", role: "council_member", status: "active", joined: "2025-10-01" },
  { id: 4, name: "Rui Ferreira", email: "secretario@ecogest.pt", password: "123", role: "secretary", status: "active", joined: "2025-10-15" },
  { id: 5, name: "João Almeida", email: "joao@ecogest.pt", password: "123", role: "user", status: "active", joined: "2026-01-10" },
  { id: 6, name: "Maria Costa", email: "maria@ecogest.pt", password: "123", role: "user", status: "inactive", joined: "2026-02-14" },
];

export const mockProjects = [
  { id: 1, name: "Eco Escolas 2026", year: 2026, level: "gold", status: "active", coordinator_id: 2, created_at: "2026-01-10T09:00:00Z" },
  { id: 2, name: "Eco Escolas 2025", year: 2025, level: "silver", status: "finished", coordinator_id: 2, created_at: "2025-01-15T09:00:00Z" },
];

export const mockActivities = [
  {
    id: 1,
    name: "Limpeza da Praia",
    description: "Atividade de limpeza das costas locais com apoio dos alunos e comunidade. Vamos recolher resíduos plásticos e sensibilizar para os problemas da poluição marítima.",
    date: "2026-05-10",
    location: "Praia de Matosinhos",
    project_id: 1,
    status: "active",
    area: "Environment",
    visibility: "public",
    participants_count: 23,
  },
  {
    id: 2,
    name: "Plantação de Árvores",
    description: "Criar uma barreira verde em torno do pátio escolar com espécies autóctones. Contribuindo para a biodiversidade local e a qualidade do ar.",
    date: "2026-06-15",
    location: "Pátio Escolar Principal",
    project_id: 1,
    status: "planned",
    area: "Biodiversity",
    visibility: "public",
    participants_count: 8,
  },
  {
    id: 3,
    name: "Workshop Energia Solar",
    description: "Sessão informativa e prática sobre energias renováveis, focada na energia solar. Alunos participam na montagem de um painel solar demonstrativo.",
    date: "2026-07-01",
    location: "Laboratório de Ciências",
    project_id: 1,
    status: "planned",
    area: "Energy",
    visibility: "public",
    participants_count: 15,
  },
  {
    id: 4,
    name: "Semana da Reciclagem",
    description: "Campanha de sensibilização sobre reciclagem e reutilização de materiais durante uma semana completa. Inclui jogos didáticos e concursos.",
    date: "2026-04-05",
    location: "Toda a Escola",
    project_id: 1,
    status: "completed",
    area: "Waste",
    visibility: "public",
    participants_count: 150,
  },
  {
    id: 5,
    name: "Visita ao Parque Natural",
    description: "Excursão ao Parque Natural da Arrábida para observação da fauna e flora autóctone. Sensibilização para a conservação dos ecossistemas marinhos.",
    date: "2026-08-20",
    location: "Parque Natural da Arrábida",
    project_id: 1,
    status: "planned",
    area: "Biodiversity",
    visibility: "public",
    participants_count: 30,
  },
];

export const mockParticipations = [
  { id: 1, activity_id: 1, user_id: 5, name: "João Almeida", email: "joao@ecogest.pt", joined_at: "2026-04-01T10:00:00Z" },
  { id: 2, activity_id: 1, email: "guest1@email.com", name: "Sara Lopes", joined_at: "2026-04-02T11:00:00Z" },
  { id: 3, activity_id: 1, email: "guest2@email.com", name: "Miguel Santos", joined_at: "2026-04-03T09:30:00Z" },
  { id: 4, activity_id: 4, user_id: 5, name: "João Almeida", email: "joao@ecogest.pt", joined_at: "2026-03-20T08:00:00Z" },
];

export const mockProposals = [
  {
    id: 1,
    title: "Eco Ponto Escolar",
    description: "Instalação de ecopontos novos nos corredores da escola para facilitar a reciclagem no dia-a-dia.",
    area: "Waste",
    start_date: "2026-09-01",
    end_date: "2026-09-15",
    resources: "Ecopontos, Sinalética, Voluntários",
    status: "pending",
    created_by: 3,
    created_at: "2026-04-10T14:00:00Z",
  },
  {
    id: 2,
    title: "Horta Escolar Sustentável",
    description: "Criação de uma horta escolar para produção de alimentos frescos e educação agrícola. Os alunos participarão na manutenção semanal.",
    area: "Food",
    start_date: "2026-10-01",
    end_date: "2026-12-01",
    resources: "Terra, Sementes, Ferramentas de jardinagem",
    status: "approved",
    created_by: 3,
    created_at: "2026-03-20T10:00:00Z",
  },
  {
    id: 3,
    title: "Monitorização da Qualidade do Ar",
    description: "Instalar sensores de qualidade do ar nos diferentes pontos da escola e analisar os dados em tempo real.",
    area: "Environment",
    start_date: "2026-11-01",
    end_date: "2027-06-30",
    resources: "Sensores IoT, Software de análise",
    status: "rejected",
    created_by: 3,
    created_at: "2026-02-15T09:00:00Z",
  },
];

export const mockMeetings = [
  {
    id: 1,
    title: "Reunião de Alinhamento Semestral",
    date: "2026-04-25",
    description: "Aprovação de propostas para o segundo semestre de 2026. Revisão de métricas e planeamento de atividades futuras.",
    project_id: 1,
    status: "scheduled",
    participants: 6,
  },
  {
    id: 2,
    title: "Workshop Avaliação de Impacto",
    date: "2026-05-10",
    description: "Avaliação do impacto ambiental das atividades realizadas no primeiro semestre.",
    project_id: 1,
    status: "scheduled",
    participants: 4,
  },
  {
    id: 3,
    title: "Reunião Kick-off 2026",
    date: "2026-01-15",
    description: "Reunião inicial para definir objetivos e estratégia do ano 2026.",
    project_id: 1,
    status: "completed",
    participants: 8,
  },
];

export const mockBackups = [
  { id: 1, description: "Weekly Backup", created_at: "2026-04-14T10:00:00Z", size: "42.3 MB" },
  { id: 2, description: "Monthly Backup - March", created_at: "2026-03-31T23:00:00Z", size: "128.7 MB" },
  { id: 3, description: "Monthly Backup - February", created_at: "2026-02-28T23:00:00Z", size: "115.2 MB" },
];
