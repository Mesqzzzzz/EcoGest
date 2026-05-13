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
  _setAuth(token, user) {
    localStorage.setItem('ecogest_token', token);
    localStorage.setItem('ecogest_user', JSON.stringify(user));
  }
  _clearAuth() {
    localStorage.removeItem('ecogest_token');
    localStorage.removeItem('ecogest_user');
  }

  // ── HTTP core ────────────────────────────────────────────────────────────────
  async _req(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    const token = this._getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    let data;
    try { data = await res.json(); } catch { data = {}; }
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
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
    };
  }

  // ── Auth ─────────────────────────────────────────────────────────────────────
  async login(email, password) {
    const data = await this._post('/users/login', { email, password });
    this._setAuth(data.token, data.user);
    return data;
  }

  async logout() { this._clearAuth(); }

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
      name:      p.user?.name ?? p.guestName ?? 'Guest',
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
      visibility:  payload.visibility || 'public',
    });
  }

  async updateActivity(id, payload) {
    return this._patch(`/admin/activities/${id}`, {
      name:        payload.name,
      description: payload.description,
      location:    payload.location,
      status:      payload.status,
    });
  }

  async updateActivityStatus(id, status) {
    return this._patch(`/admin/activities/${id}/status`, { status });
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
}

export const api = new ApiService();
