// ─── EcoGest Real API Service ────────────────────────────────────────────────
// Substitui o mock anterior por chamadas HTTP reais ao backend Node/MongoDB.

const BASE_URL = 'http://localhost:3000/api';

// ── Helpers de formatação ─────────────────────────────────────────────────────
const fmtDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
const pickId  = (obj) => obj?._id ?? obj?.id ?? null;

class ApiService {
  // ── currentUser lido do localStorage ────────────────────────────────────────
  get currentUser() {
    try { return JSON.parse(localStorage.getItem('ecogest_user')); } catch { return null; }
  }

  _getToken()  { return localStorage.getItem('ecogest_token'); }
  _getRefreshToken() { return localStorage.getItem('ecogest_refresh_token'); }
  _setAuth(token, refreshToken, user) {
    localStorage.setItem('ecogest_token', token);
    if (refreshToken) localStorage.setItem('ecogest_refresh_token', refreshToken);
    localStorage.setItem('ecogest_user', JSON.stringify(user));
  }
  _clearAuth() {
    localStorage.removeItem('ecogest_token');
    localStorage.removeItem('ecogest_refresh_token');
    localStorage.removeItem('ecogest_user');
  }

  // ── HTTP core ────────────────────────────────────────────────────────────────
  async _req(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    const token = this._getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    let data;
    try { data = await res.json(); } catch { data = {}; }

    if (!res.ok) {
      if (res.status === 401 && this._getRefreshToken() && path !== '/users/login' && path !== '/users/refresh') {
        try {
          await this.refreshSession();
          const newToken = this._getToken();
          headers['Authorization'] = `Bearer ${newToken}`;
          res = await fetch(`${BASE_URL}${path}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
          });
          try { data = await res.json(); } catch { data = {}; }
          if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
          return data;
        } catch (refreshErr) {
          this._clearAuth();
          window.location.href = '/login';
          throw refreshErr;
        }
      }
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    return data;
  }

  _get(path)        { return this._req('GET',    path); }
  _post(path, b)    { return this._req('POST',   path, b); }
  _patch(path, b)   { return this._req('PATCH',  path, b); }
  _delete(path)     { return this._req('DELETE', path); }

  // ── ID do projeto ativo (cacheado) ───────────────────────────────────────────
  async _activeProjectId() {
    if (this.__projId) return this.__projId;
    try {
      const { data } = await this._get('/projects?status=active');
      if (data?.length) this.__projId = pickId(data[0]);
    } catch { /* ignora */ }
    // Fallback: qualquer projeto
    if (!this.__projId) {
      try {
        const { data } = await this._get('/projects');
        if (data?.length) this.__projId = pickId(data[0]);
      } catch { /* ignora */ }
    }
    return this.__projId;
  }

  // ── Mappers: backend → frontend ──────────────────────────────────────────────
  _mapActivity(a) {
    return {
      id:               pickId(a),
      name:             a.name,
      description:      a.description,
      location:         a.location,
      date:             fmtDate(a.startDate ?? a.start_date),
      start_date:       fmtDate(a.startDate ?? a.start_date),
      end_date:         fmtDate(a.endDate   ?? a.end_date),
      status:           a.status,
      visibility:       a.visibility,
      area:             Array.isArray(a.areas) ? (a.areas[0] ?? '') : (a.area ?? ''),
      areas:            Array.isArray(a.areas) ? a.areas : [],
      participants_count: a.participants_count ?? 0,
      user_participation: a.user_participation || null,
      project:          a.project,
      images:           a.images ?? [],
      resources:        a.resources ?? '',
      execution_notes:  a.executionNotes ?? '',
      execution_location: a.executionLocation ?? '',
    };
  }

  _mapUser(u) {
    return {
      id:     pickId(u),
      name:   u.name,
      email:  u.email,
      role:   u.role,
      status: u.status,
      joined: fmtDate(u.createdAt),
    };
  }

  _mapProposal(p) {
    return {
      id:          pickId(p),
      title:       p.title,
      description: p.description,
      area:        p.area,
      start_date:  fmtDate(p.startDate ?? p.start_date),
      end_date:    fmtDate(p.endDate   ?? p.end_date),
      resources:   p.resources,
      status:      p.status,
      review_note: p.reviewNote,
      created_by:  p.createdBy,
    };
  }

  _mapMeeting(m) {
    const dateObj = m.date ? new Date(m.date) : null;
    const isPast  = dateObj && dateObj < new Date();
    return {
      id:          pickId(m),
      title:       m.name,
      name:        m.name,
      date:        fmtDate(m.date),
      description: m.description,
      project:     m.project,
      participants: 0,
      status:      isPast ? 'completed' : 'scheduled',
    };
  }

  _mapProject(p) {
    return {
      id:             pickId(p),
      name:           p.name,
      year:           p.year,
      status:         p.status,
      level:          p.level,
      coordinator:    p.coordinator,
      coordinator_id: pickId(p.coordinator),
      activitiesCount: p.activitiesCount ?? 0,
      areasCount:     p.areasCount ?? 0,
    };
  }

  // ── Auth ─────────────────────────────────────────────────────────────────────
  async login(email, password) {
    const data = await this._post('/users/login', { email, password });
    this._setAuth(data.token, data.refreshToken, data.user);
    return data;
  }

  async register(name, email, password) {
    const data = await this._post('/users', { name, email, password });
    return data;
  }

  async refreshSession() {
    const refreshToken = this._getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');
    
    const res = await fetch(`${BASE_URL}/users/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to refresh session');
    }
    
    this._setAuth(data.token, data.refreshToken, data.user);
    return data;
  }

  async logout() {
    const refreshToken = this._getRefreshToken();
    if (refreshToken) {
      try {
        await this._post('/users/logout-session', { refreshToken });
      } catch { /* ignorar falhas no logout */ }
    }
    this._clearAuth();
  }

  async getMe() { return this._get('/users/me'); }

  async updateProfile(payload) { return this._patch('/users/me', payload); }

  // ── Activities (públicas) ────────────────────────────────────────────────────
  async getActivities({ status } = {}) {
    const q = status ? `?status=${status}` : '';
    const { data } = await this._get(`/activities${q}`);
    return (data ?? []).map(a => this._mapActivity(a));
  }

  async getActivity(id) {
    const data = await this._get(`/activities/${id}`);
    return this._mapActivity(data);
  }

  async participateInActivity(id, payload) {
    return this._post(`/activities/${id}/participations`, payload);
  }

  async getParticipants(activityId) {
    const { data } = await this._get(`/activities/${activityId}/participants`);
    return (data ?? []).map(p => ({
      id:        pickId(p),
      name:      p.user?.name ?? p.guestName ?? 'Convidado',
      email:     p.user?.email ?? p.guestEmail ?? '',
      joined_at: p.createdAt,
    }));
  }

  async cancelParticipation(activityId, participationId) {
    return this._delete(`/activities/${activityId}/participations/${participationId}`);
  }

  // ── Admin Activities ─────────────────────────────────────────────────────────
  async adminGetActivities({ status } = {}) {
    const q = status ? `?status=${status}` : '';
    const { data } = await this._get(`/admin/activities${q}`);
    return (data ?? []).map(a => this._mapActivity(a));
  }

  async createActivity(payload) {
    const projectId = await this._activeProjectId();
    return this._post('/admin/activities', {
      name:        payload.name,
      description: payload.description,
      start_date:  payload.date,
      end_date:    payload.date,
      location:    payload.location,
      project_id:  projectId,
      area:        payload.area,
      resources:   payload.resources,
      visibility:  payload.visibility || 'public',
    });
  }

  async updateActivity(id, payload) {
    return this._patch(`/admin/activities/${id}`, {
      name:        payload.name,
      description: payload.description,
      location:    payload.location,
      status:      payload.status,
      resources:   payload.resources,
    });
  }

  async updateActivityStatus(id, status) {
    return this._patch(`/admin/activities/${id}/status`, { status });
  }

  async registerExecution(id, payload) {
    return this._post(`/activities/${id}/executions`, payload);
  }

  async addParticipant(id, payload) {
    return this._post(`/activities/${id}/participants`, payload);
  }

  async uploadPhoto(id, file) {
    const formData = new FormData();
    formData.append('photo', file);
    
    const headers = {};
    const token = this._getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/activities/${id}/photos`, {
      method: 'POST',
      headers,
      body: formData,
    });

    let data;
    try { data = await res.json(); } catch { data = {}; }
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  }

  // ── Proposals ────────────────────────────────────────────────────────────────
  async getProposals({ status } = {}) {
    const q = status ? `?status=${status}` : '';
    const { data } = await this._get(`/proposals${q}`);
    return (data ?? []).map(p => this._mapProposal(p));
  }

  async createProposal(payload) {
    const projectId = await this._activeProjectId();
    return this._post('/proposals', { ...payload, project_id: projectId });
  }

  async updateProposalStatus(id, status) {
    return this._patch(`/admin/proposals/${id}/status`, { status });
  }

  // ── Meetings ─────────────────────────────────────────────────────────────────
  async getMeetings() {
    const { data } = await this._get('/meetings');
    return (data ?? []).map(m => this._mapMeeting(m));
  }

  async createMeeting(payload) {
    const projectId = await this._activeProjectId();
    const raw = await this._post('/meetings', {
      name:       payload.title ?? payload.name,
      date:       payload.date,
      description: payload.description,
      project_id:  projectId,
    });
    return this._mapMeeting(raw);
  }

  async updateMeeting(id, payload) {
    const raw = await this._patch(`/meetings/${id}`, {
      name:       payload.title ?? payload.name,
      date:       payload.date,
      description: payload.description,
    });
    return this._mapMeeting(raw);
  }

  async deleteMeeting(id) { return this._delete(`/meetings/${id}`); }

  // ── Projects ─────────────────────────────────────────────────────────────────
  async getProjects({ status } = {}) {
    const q = status ? `?status=${status}` : '';
    const { data } = await this._get(`/projects${q}`);
    return (data ?? []).map(p => this._mapProject(p));
  }

  async createProject(payload) {
    this.__projId = null; // invalidar cache
    return this._post('/projects', payload);
  }

  async updateProjectStatus(id, status) {
    this.__projId = null;
    return this._patch(`/projects/${id}/status`, { status });
  }

  // ── Users (admin) ────────────────────────────────────────────────────────────
  async getUsers() {
    const { data } = await this._get('/admin/users');
    return (data ?? []).map(u => this._mapUser(u));
  }

  async createUser(payload)       { return this._post('/admin/users', payload); }
  async updateUser(id, payload)   { return this._patch(`/admin/users/${id}`, payload); }
  async updateUserStatus(id, s)   { return this._patch(`/admin/users/${id}/status`, { status: s }); }

  // ── Dashboard ────────────────────────────────────────────────────────────────
  async getDashboardMetrics() {
    const [dash, meetData] = await Promise.all([
      this._get('/admin/dashboard'),
      this._get('/meetings'),
    ]);
    return {
      activities:   dash.activities,
      participants: dash.participants,
      meetings:     (meetData.data ?? []).length,
      users:        0,
      proposals:    dash.proposals,
      monthlyStats: dash.monthlyStats ?? [],
    };
  }

  // ── Backups ──────────────────────────────────────────────────────────────────
  async getBackups() {
    const { data } = await this._get('/admin/backups');
    return (data ?? []).map(b => ({
      id: pickId(b), description: b.description,
      created_at: b.createdAt, size: b.size,
    }));
  }

  async createBackup(description) {
    const d = await this._post('/admin/backups', { description });
    return { id: d.id, description, created_at: d.createdAt, size: 'N/A' };
  }

  async restoreBackup(id) {
    return this._post(`/admin/backups/${id}/restore`, { confirm: true });
  }

  // ── Report ───────────────────────────────────────────────────────────────────
  async getReport() { return this._get('/admin/report'); }
  async generateReport(payload = {}) { return this._post('/admin/report', payload); }

  // ── Meeting Documents & Photos ───────────────────────────────────────────────
  async getMeetingDocuments(meetingId) {
    const { data } = await this._get(`/meetings/${meetingId}/documents`);
    return data ?? [];
  }

  async uploadMeetingDocument(meetingId, file, type = 'ata') {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', type);
    
    const headers = {};
    const token = this._getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/meetings/${meetingId}/documents`, {
      method: 'POST',
      headers,
      body: formData,
    });

    let data;
    try { data = await res.json(); } catch { data = {}; }
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  }

  async deleteMeetingDocument(docId) {
    return this._delete(`/meetings/documents/${docId}`);
  }

  // ── Audits ───────────────────────────────────────────────────────────────────
  async getAuditQuestions() {
    const { data } = await this._get('/audits/questions');
    return data ?? [];
  }

  async getAuditResponses(projectId) {
    const { data } = await this._get(`/audits/responses/${projectId}`);
    return data ?? [];
  }

  async submitAuditResponses(payload) {
    return this._post('/audits/responses', payload);
  }

  async getAuditReport(projectId) {
    return this._get(`/audits/report/${projectId}`);
  }
}

export const api = new ApiService();
