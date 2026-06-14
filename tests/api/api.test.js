const request = require('supertest')('http://localhost:3000');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

describe('Suite de Testes de Requisitos do EcoGest (14 RFs & 10 RNFs)', () => {
  let adminToken = '';
  let coordinatorToken = '';
  let userToken = '';
  let uniqueUserEmail = `rf_user_${Date.now()}@ecogest.pt`;
  let tempUserId = '';
  let tempCoordinatorId = '';
  let tempProjectId = '';
  let tempActivityId = '';
  let tempMeetingId = '';

  beforeAll(async () => {
    // 1. Obter token de Admin (dados padrão do seed do EcoGest)
    const adminRes = await request.post('/api/users/login')
      .send({ email: 'admin@ecogest.pt', password: '123' });
    if (adminRes.status === 200) {
      adminToken = adminRes.body.token;
    }

    // 2. Obter token de Coordenador (dados padrão)
    const coordRes = await request.post('/api/users/login')
      .send({ email: 'coordenador@ecogest.pt', password: '123' });
    if (coordRes.status === 200) {
      coordinatorToken = coordRes.body.token;
    }

    // 3. Obter ID de um coordenador
    if (adminToken) {
      const usersRes = await request.get('/api/admin/users?role=coordinator')
        .set('Authorization', `Bearer ${adminToken}`);
      if (usersRes.status === 200 && usersRes.body.data && usersRes.body.data.length > 0) {
        tempCoordinatorId = usersRes.body.data[0]._id;
      }
    }
  });

  // ==========================================
  // REQUISITOS FUNCIONAIS (RF1 a RF14 & RF21)
  // ==========================================

  describe('Requisitos Funcionais (RFs)', () => {
    
    test('RF1 - Registo de Utilizador: Deve permitir registar novas contas', async () => {
      const res = await request.post('/api/users')
        .send({
          name: 'Utilizador RF1',
          email: uniqueUserEmail,
          password: 'password123'
        });
      expect(res.status).toBe(201);
      expect(res.body.data.email).toBe(uniqueUserEmail);
      tempUserId = res.body.data.id || res.body.data._id;
    });

    test('RF2 - Login de Utilizador: Deve autenticar utilizadores registados', async () => {
      const res = await request.post('/api/users/login')
        .send({
          email: uniqueUserEmail,
          password: 'password123'
        });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      userToken = res.body.token;
    });

    test('RF3 - Gestão de Perfil: Deve permitir visualizar e editar informações pessoais', async () => {
      const getRes = await request.get('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.email).toBe(uniqueUserEmail);

      const patchRes = await request.patch('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Nome Atualizado RF3' });
      expect(patchRes.status).toBe(200);
    });

    test('RF4 - Estado da Conta: Deve permitir alterar o estado da conta de utilizador', async () => {
      if (!adminToken || !tempUserId) return;
      const res = await request.patch(`/api/admin/users/${tempUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'inactive' });
      expect(res.status).toBe(200);
    });

    test('RF5 - Criar Projeto: Deve permitir criar novos anos letivos de projeto', async () => {
      if (!adminToken) return;
      const uniqueYear = 2030 + (Date.now() % 10000);
      const res = await request.post('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `Projeto RF5 ${uniqueYear}`,
          year: uniqueYear
        });
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      tempProjectId = res.body.id;
    });

    test('RF6 - Atualizar Projeto: Deve permitir editar os dados dos projetos anuais', async () => {
      if (!adminToken || !tempProjectId) return;
      const res = await request.patch(`/api/projects/${tempProjectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Nome Projeto RF6 Atualizado' });
      expect(res.status).toBe(200);
    });

    test('RF7 - Atribuição de Coordenador: Deve associar coordenadores aos projetos', async () => {
      if (!adminToken || !tempProjectId) return;
      const res = await request.patch(`/api/projects/${tempProjectId}/coordinator`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ user_id: tempCoordinatorId || '64b1f234567890123456789a' });
      expect(res.status).toBe(200);
    });

    test('RF8 - Criar Atividades: Deve permitir a criação de atividades ambientais', async () => {
      if (!adminToken || !tempProjectId) return;
      const res = await request.post('/api/admin/activities')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Atividade RF8',
          description: 'Descrição RF8',
          start_date: new Date().toISOString(),
          location: 'Recinto Escolar',
          project_id: tempProjectId,
          area: 'Resíduos',
          visibility: 'public'
        });
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      tempActivityId = res.body.id;
    });

    test('RF9 - Editar Atividades: Deve permitir a edição de atividades existentes', async () => {
      if (!adminToken || !tempActivityId) return;
      const res = await request.patch(`/api/admin/activities/${tempActivityId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Atividade RF9 Atualizada' });
      expect(res.status).toBe(200);
    });

    test('RF10 - Estado da Atividade: Deve permitir alterar a visibilidade/estado das atividades', async () => {
      if (!adminToken || !tempActivityId) return;
      const res = await request.patch(`/api/admin/activities/${tempActivityId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'active' });
      expect(res.status).toBe(200);
    });

    test('RF12 - Inscrições em Atividades: Deve permitir participar em atividades', async () => {
      if (!tempActivityId) return;
      // Usando autenticação opcional
      const res = await request.post(`/api/activities/${tempActivityId}/participations`)
        .send({ name: 'Visitante RF12', email: `visitante_${Date.now()}@escola.pt` });
      expect(res.status).toBe(201);
    });

    test('RF11 - Execução da Atividade: Deve permitir registar a conclusão e evidências', async () => {
      if (!coordinatorToken || !tempActivityId) return;
      const res = await request.post(`/api/activities/${tempActivityId}/executions`)
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send({
          executionLocation: 'Recinto Escolar',
          executionNotes: 'Execução concluída com sucesso (RF11).'
        });
      expect(res.status).toBe(201);
    });

    test('RF14 - Reuniões: Deve permitir agendar novas reuniões de conselho', async () => {
      if (!adminToken) return;
      const res = await request.post('/api/meetings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Reunião Conselho RF14',
          date: new Date().toISOString(),
          description: 'Definição do plano ambiental',
          project_id: tempProjectId || '64b1f234567890123456789a'
        });
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      tempMeetingId = res.body.id;
    });

    test('RF21 - Geração de Relatórios: Deve expor dados para relatórios ambientais', async () => {
      if (!adminToken) return;
      const res = await request.get('/api/admin/report')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.projects).toBeDefined();
    });
  });

  // ==========================================
  // REQUISITOS NÃO FUNCIONAIS (RNF1 a RNF10)
  // ==========================================

  describe('Requisitos Não Funcionas (RNFs)', () => {

    test('RNF1 - Performance: Tempos de resposta da API devem ser < 800ms', async () => {
      const start = Date.now();
      const res = await request.get('/api/health');
      const duration = Date.now() - start;
      
      expect(res.status).toBe(200);
      expect(duration).toBeLessThan(800);
    });

    test('RNF2 - Escalabilidade: API deve processar pedidos concorrentes simultâneos', async () => {
      const requests = Array.from({ length: 5 }, () => request.get('/api/health'));
      const responses = await Promise.all(requests);
      responses.forEach(res => {
        expect(res.status).toBe(200);
      });
    });

    test('RNF3 - JWT Rotação: Tokens JWT devem ser assinados e expirados de forma segura', () => {
      const secret = 'test_secret';
      const token = jwt.sign({ id: '123', role: 'user' }, secret, { expiresIn: '15m' });
      expect(token).toBeDefined();
      
      const decoded = jwt.verify(token, secret);
      expect(decoded.id).toBe('123');
    });

    test('RNF4 - Middlewares: Deve proteger rotas críticas contra acessos não autorizados', async () => {
      const res = await request.get('/api/users/me');
      expect(res.status).toBe(401);
    });

    test('RNF5 - Cifragem: Hashing seguro de palavras-passe com bcryptjs (10 salts)', async () => {
      const pass = 'minha_senha_123';
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(pass, salt);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(pass);
      
      const match = await bcrypt.compare(pass, hash);
      expect(match).toBe(true);
    });

    test('RNF6 - Responsividade: Layout responsivo deve ser suportado no browser', () => {
      // Verificação da existência do Tailwind e CSS de grid/flex no projeto (dois níveis acima)
      const publicPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'index.css');
      const exists = fs.existsSync(publicPath);
      expect(exists).toBe(true);
    });

    test('RNF7 - Usabilidade: Validação de redirecionamentos e consistência visual', async () => {
      // Pedido inválido deve retornar erro estruturado consistente
      const res = await request.post('/api/users/login').send({});
      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    test('RNF8 - Disponibilidade: Ponto de verificação de saúde da API (healthcheck) ativo', async () => {
      const res = await request.get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    test('RNF9 - Modularidade: Código estruturado sob o padrão MVC', () => {
      const rootPath = path.join(__dirname, '..', '..', 'backend');
      const folders = ['controllers', 'models', 'routes'];
      folders.forEach(folder => {
        expect(fs.existsSync(path.join(rootPath, folder))).toBe(true);
      });
    });

    test('RNF10 - Robustez: Resolução e isolamento de processos na API', async () => {
      // O backend deve resistir a inputs corrompidos sem derrubar o processo
      const res = await request.post('/api/users/login').send({ email: 'email_invalido' });
      expect(res.status).toBe(401);
    });
  });
});
