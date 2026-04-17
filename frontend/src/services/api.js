const BASE_URL = 'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('ecogest_token');
    this.currentUser = JSON.parse(localStorage.getItem('ecogest_user'));
  }

  async _request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.message || 'Request failed');
    }

    return result;
  }

  // --- Auth ---
  async login(email, password) {
    const result = await this._request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.token = result.token;
    this.currentUser = result.user;
    localStorage.setItem('ecogest_token', result.token);
    localStorage.setItem('ecogest_user', JSON.stringify(result.user));

    return result;
  }

  async logout() {
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem('ecogest_token');
    localStorage.removeItem('ecogest_user');
  }

  async getMe() {
    const user = await this._request('/users/me');
    this.currentUser = user;
    localStorage.setItem('ecogest_user', JSON.stringify(user));
    return user;
  }

  async updateProfile(payload) {
    return await this._request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  // --- Activities (Public/Shared) ---
  async getActivities(params = {}) {
    const query = new URLSearchParams(params).toString();
    const result = await this._request(`/activities?${query}`);
    return result.data; // Backend uses { data: [...] }
  }

  async getActivity(id) {
    const result = await this._request(`/activities/${id}`);
    // Map backend response if needed. Backend returns raw object.
    return {
      ...result,
      id: result.activity_id // mapping for consistency
    };
  }

  async participateInActivity(id, payload) {
    return await this._request(`/activities/${id}/participations`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getParticipants(activityId) {
    const result = await this._request(`/activities/${activityId}/participants`);
    return result.data;
  }

  async cancelParticipation(activityId, participationId) {
    return await this._request(`/activities/${activityId}/participations/${participationId}`, {
      method: 'DELETE',
    });
  }

  // --- Admin/Coordinator Activities ---
  async adminGetActivities(params = {}) {
    const query = new URLSearchParams(params).toString();
    const result = await this._request(`/admin/activities?${query}`);
    return result.data.map(a => ({ ...a, id: a.activity_id }));
  }

  async createActivity(payload) {
    return await this._request('/admin/activities', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateActivity(id, payload) {
    return await this._request(`/admin/activities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async updateActivityStatus(id, status) {
    return await this._request(`/admin/activities/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // --- Proposals ---
  async getProposals(params = {}) {
    const query = new URLSearchParams(params).toString();
    const result = await this._request(`/proposals?${query}`);
    return result.data.map(p => ({ ...p, id: p.proposal_id }));
  }

  async createProposal(payload) {
    return await this._request('/proposals', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateProposalStatus(id, status, review_note = '') {
    return await this._request(`/admin/proposals/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, review_note }),
    });
  }

  // --- Meetings ---
  async getMeetings() {
    const result = await this._request('/meetings');
    return result.data.map(m => ({ ...m, id: m.meeting_id }));
  }

  async createMeeting(payload) {
    return await this._request('/meetings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateMeeting(id, payload) {
    return await this._request(`/meetings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async deleteMeeting(id) {
    return await this._request(`/meetings/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Projects ---
  async getProjects(params = {}) {
    const query = new URLSearchParams(params).toString();
    const result = await this._request(`/projects?${query}`);
    return result.data.map(p => ({ ...p, id: p.project_id }));
  }

  async createProject(payload) {
    return await this._request('/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateProjectStatus(id, status) {
    return await this._request(`/projects/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // --- Users Admin ---
  async getUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    const result = await this._request(`/admin/users?${query}`);
    return result.data.map(u => ({ ...u, id: u.user_id }));
  }

  async createUser(payload) {
    return await this._request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateUser(id, payload) {
    return await this._request(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async updateUserStatus(id, status) {
    return await this._request(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // --- Dashboard ---
  async getDashboardMetrics() {
    return await this._request('/admin/dashboard');
  }

  // --- Backups ---
  async getBackups() {
    const result = await this._request('/admin/backups');
    return result.data.map(b => ({ ...b, id: b.backup_id }));
  }

  async createBackup(description) {
    return await this._request('/admin/backups', {
      method: 'POST',
      body: JSON.stringify({ description }),
    });
  }

  async restoreBackup(id) {
    return await this._request(`/admin/backups/${id}/restore`, {
      method: 'POST',
      body: JSON.stringify({ confirm: true }),
    });
  }

  // --- Report ---
  async getReport() {
    return await this._request('/admin/report');
  }
}

export const api = new ApiService();
