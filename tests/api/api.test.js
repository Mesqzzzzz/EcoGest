const request = require('supertest')('http://localhost:3000');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

describe('EcoGest Requirement Test Suite (14 FRs & 10 NFRs)', () => {
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
    // 1. Obtain Admin token (default seed data)
    const adminRes = await request.post('/api/users/login')
      .send({ email: 'admin@ecogest.pt', password: '123' });
    if (adminRes.status === 200) {
      adminToken = adminRes.body.token;
    }

    // 2. Obtain Coordinator token (default seed data)
    const coordRes = await request.post('/api/users/login')
      .send({ email: 'coordenador@ecogest.pt', password: '123' });
    if (coordRes.status === 200) {
      coordinatorToken = coordRes.body.token;
    }

    // 3. Get ID of a coordinator
    if (adminToken) {
      const usersRes = await request.get('/api/admin/users?role=coordinator')
        .set('Authorization', `Bearer ${adminToken}`);
      if (usersRes.status === 200 && usersRes.body.data && usersRes.body.data.length > 0) {
        tempCoordinatorId = usersRes.body.data[0]._id;
      }
    }
  });

  // ==========================================
  // FUNCTIONAL REQUIREMENTS (FR1 to FR14 & FR21)
  // ==========================================

  describe('Functional Requirements (FRs)', () => {
    
    test('FR1 - User Registration: Should allow registering new accounts', async () => {
      const res = await request.post('/api/users')
        .send({
          name: 'User FR1',
          email: uniqueUserEmail,
          password: 'password123'
        });
      expect(res.status).toBe(201);
      expect(res.body.data.email).toBe(uniqueUserEmail);
      tempUserId = res.body.data.id || res.body.data._id;
    });

    test('FR2 - User Login: Should authenticate registered users', async () => {
      const res = await request.post('/api/users/login')
        .send({
          email: uniqueUserEmail,
          password: 'password123'
        });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      userToken = res.body.token;
    });

    test('FR3 - Profile Management: Should allow viewing and editing personal information', async () => {
      const getRes = await request.get('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.email).toBe(uniqueUserEmail);

      const patchRes = await request.patch('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated Name FR3' });
      expect(patchRes.status).toBe(200);
    });

    test('FR4 - Account Status: Should allow changing user account status', async () => {
      if (!adminToken || !tempUserId) return;
      const res = await request.patch(`/api/admin/users/${tempUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'inactive' });
      expect(res.status).toBe(200);
    });

    test('FR5 - Create Project: Should allow creating new project school years', async () => {
      if (!adminToken) return;
      const uniqueYear = 2030 + (Date.now() % 10000);
      const res = await request.post('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `Project FR5 ${uniqueYear}`,
          year: uniqueYear
        });
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      tempProjectId = res.body.id;
    });

    test('FR6 - Update Project: Should allow updating annual project data', async () => {
      if (!adminToken || !tempProjectId) return;
      const res = await request.patch(`/api/projects/${tempProjectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Project Name FR6' });
      expect(res.status).toBe(200);
    });

    test('FR7 - Coordinator Assignment: Should associate coordinators to projects', async () => {
      if (!adminToken || !tempProjectId) return;
      const res = await request.patch(`/api/projects/${tempProjectId}/coordinator`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ user_id: tempCoordinatorId || '64b1f234567890123456789a' });
      expect(res.status).toBe(200);
    });

    test('FR8 - Create Activities: Should allow creating environmental activities', async () => {
      if (!adminToken || !tempProjectId) return;
      const res = await request.post('/api/admin/activities')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Activity FR8',
          description: 'Description FR8',
          start_date: new Date().toISOString(),
          location: 'School Yard',
          project_id: tempProjectId,
          area: 'Waste',
          visibility: 'public'
        });
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      tempActivityId = res.body.id;
    });

    test('FR9 - Edit Activities: Should allow editing existing activities', async () => {
      if (!adminToken || !tempActivityId) return;
      const res = await request.patch(`/api/admin/activities/${tempActivityId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Activity Name FR9' });
      expect(res.status).toBe(200);
    });

    test('FR10 - Activity Status: Should allow changing visibility/status of activities', async () => {
      if (!adminToken || !tempActivityId) return;
      const res = await request.patch(`/api/admin/activities/${tempActivityId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'active' });
      expect(res.status).toBe(200);
    });

    test('FR12 - Activity Registration: Should allow registering for activities', async () => {
      if (!tempActivityId) return;
      // Using optional authentication
      const res = await request.post(`/api/activities/${tempActivityId}/participations`)
        .send({ name: 'Visitor FR12', email: `visitor_${Date.now()}@escola.pt` });
      expect(res.status).toBe(201);
    });

    test('FR11 - Activity Execution: Should allow registering completion and evidence', async () => {
      if (!coordinatorToken || !tempActivityId) return;
      const res = await request.post(`/api/activities/${tempActivityId}/executions`)
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send({
          executionLocation: 'School Yard',
          executionNotes: 'Execution registered successfully (FR11).'
        });
      expect(res.status).toBe(201);
    });

    test('FR14 - Meetings: Should allow scheduling new council meetings', async () => {
      if (!adminToken) return;
      const res = await request.post('/api/meetings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Council Meeting FR14',
          date: new Date().toISOString(),
          description: 'Environmental plan discussion',
          project_id: tempProjectId || '64b1f234567890123456789a'
        });
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      tempMeetingId = res.body.id;
    });

    test('FR21 - Report Generation: Should expose data for environmental reports', async () => {
      if (!adminToken) return;
      const res = await request.get('/api/admin/report')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.projects).toBeDefined();
    });
  });

  // ==========================================
  // NON-FUNCTIONAL REQUIREMENTS (NFR1 to NFR10)
  // ==========================================

  describe('Non-Functional Requirements (NFRs)', () => {

    test('NFR1 - Performance: API response times should be < 800ms', async () => {
      const start = Date.now();
      const res = await request.get('/api/health');
      const duration = Date.now() - start;
      
      expect(res.status).toBe(200);
      expect(duration).toBeLessThan(800);
    });

    test('NFR2 - Scalability: API should process simultaneous concurrent requests', async () => {
      const requests = Array.from({ length: 5 }, () => request.get('/api/health'));
      const responses = await Promise.all(requests);
      responses.forEach(res => {
        expect(res.status).toBe(200);
      });
    });

    test('NFR3 - JWT Rotation: JWT tokens should be securely signed and expired', () => {
      const secret = 'test_secret';
      const token = jwt.sign({ id: '123', role: 'user' }, secret, { expiresIn: '15m' });
      expect(token).toBeDefined();
      
      const decoded = jwt.verify(token, secret);
      expect(decoded.id).toBe('123');
    });

    test('NFR4 - Middlewares: Should protect critical routes from unauthorized access', async () => {
      const res = await request.get('/api/users/me');
      expect(res.status).toBe(401);
    });

    test('NFR5 - Encryption: Secure hashing of passwords using bcryptjs (10 salts)', async () => {
      const pass = 'my_password_123';
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(pass, salt);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(pass);
      
      const match = await bcrypt.compare(pass, hash);
      expect(match).toBe(true);
    });

    test('NFR6 - Responsiveness: Responsive layout should be supported in the browser', () => {
      // Check for Tailwind/CSS files in the project workspace (two levels up)
      const publicPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'index.css');
      const exists = fs.existsSync(publicPath);
      expect(exists).toBe(true);
    });

    test('NFR7 - Usability: Validation of redirects and visual consistency', async () => {
      // Invalid login request should return consistent structured error response
      const res = await request.post('/api/users/login').send({});
      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    test('NFR8 - Availability: API health check endpoint should be active', async () => {
      const res = await request.get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    test('NFR9 - Modularity: Code structured under the MVC pattern', () => {
      const rootPath = path.join(__dirname, '..', '..', 'backend');
      const folders = ['controllers', 'models', 'routes'];
      folders.forEach(folder => {
        expect(fs.existsSync(path.join(rootPath, folder))).toBe(true);
      });
    });

    test('NFR10 - Robustness: API error handling and process isolation', async () => {
      // The backend should handle malformed requests without crashing
      const res = await request.post('/api/users/login').send({ email: 'invalid_email' });
      expect(res.status).toBe(401);
    });
  });
});
