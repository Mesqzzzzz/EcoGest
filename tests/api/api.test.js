const request = require('supertest')('http://localhost:3000');

describe('PE-1 - Testes de API & Segurança do EcoGest', () => {
  let authToken = '';
  let uniqueEmail = `testuser_${Date.now()}@escola.pt`;
  let tempProjectId = '';
  let tempActivityId = '';

  describe('TC014 - RNF4 - Proteção de endpoints', () => {
    test('Deve bloquear pedidos a rotas protegidas sem token JWT', async () => {
      const response = await request.get('/api/users/me');
      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    test('Deve bloquear pedidos a rotas protegidas com token JWT inválido', async () => {
      const response = await request.get('/api/users/me')
        .set('Authorization', 'Bearer invalid_token_here');
      expect(response.status).toBe(401);
    });
  });

  describe('TC001 - RF1 - Registo de utilizador', () => {
    test('Deve criar uma nova conta de utilizador com sucesso', async () => {
      const response = await request.post('/api/users')
        .send({
          name: 'Utilizador Automação',
          email: uniqueEmail,
          password: 'password123'
        });
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.data.email).toBe(uniqueEmail);
    });

    test('Deve falhar ao registar com email duplicado', async () => {
      const response = await request.post('/api/users')
        .send({
          name: 'Utilizador Automação Duplicado',
          email: uniqueEmail,
          password: 'password123'
        });
      expect(response.status).toBe(409);
    });
  });

  describe('TC002 - RF2 - Login de Utilizador', () => {
    test('Deve iniciar sessão e retornar access token e refresh token', async () => {
      const response = await request.post('/api/users/login')
        .send({
          email: uniqueEmail,
          password: 'password123'
        });
      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      authToken = response.body.token;
    });

    test('Deve recusar login com credenciais erradas', async () => {
      const response = await request.post('/api/users/login')
        .send({
          email: uniqueEmail,
          password: 'wrongpassword'
        });
      expect(response.status).toBe(401);
    });
  });

  describe('TC003 - RF3 - Gestão de perfil', () => {
    test('Deve ler o perfil do utilizador autenticado', async () => {
      const response = await request.get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.status).toBe(200);
      expect(response.body.email).toBe(uniqueEmail);
    });

    test('Deve atualizar as informações do perfil com sucesso', async () => {
      const response = await request.patch('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Nome Atualizado API'
        });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Profile updated');
    });
  });

  describe('TC004 - RF5 - Criar projeto (admin) & TC006 - RF8 - Criar atividade', () => {
    let adminToken = '';

    beforeAll(async () => {
      // Login como administrador (dados padrão do seed do EcoGest)
      const loginRes = await request.post('/api/users/login')
        .send({
          email: 'admin@ecogest.pt',
          password: '123'
        });
      if (loginRes.status === 200) {
        adminToken = loginRes.body.token;
      }
    });

    test('Deve permitir que o administrador crie um novo projeto anual', async () => {
      if (!adminToken) return;
      const uniqueYear = Math.floor(Math.random() * (2099 - 2030) + 2030);
      const response = await request.post('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `Projeto Teste API ${uniqueYear}`,
          year: uniqueYear
        });
      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      tempProjectId = response.body.id;
    });

    test('Deve permitir criar uma nova atividade ecológica', async () => {
      if (!adminToken || !tempProjectId) return;
      const response = await request.post('/api/admin/activities')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Atividade Teste API',
          description: 'Descrição Atividade Teste API',
          start_date: new Date().toISOString(),
          location: 'Escola Central',
          project_id: tempProjectId,
          area: 'Água',
          visibility: 'public'
        });
      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      tempActivityId = response.body.id;
    });
  });
});
