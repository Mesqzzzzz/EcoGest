import * as data from './mockData';

// API Mock Service Layer
// In a real application, these would be fetch() or axios calls to a real backend.

const delay = (ms = 300) => new Promise(res => setTimeout(res, ms));

class ApiService {
  constructor() {
    this.users = [...data.mockUsers];
    this.projects = [...data.mockProjects];
    this.activities = [...data.mockActivities];
    this.participations = [...data.mockParticipations];
    this.proposals = [...data.mockProposals];
    this.meetings = [...data.mockMeetings];
    this.backups = [...data.mockBackups];
    this.currentUser = null;
    this._nextId = 100;
  }

  _nextID() { return ++this._nextId; }

  // --- Auth ---
  async login(email, password) {
    await delay();
    const user = this.users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error("Credenciais inválidas");
    if (user.status !== 'active') throw new Error("Conta inativa");
    this.currentUser = user;
    return { token: "MOCK_JWT", user };
  }

  async logout() {
    await delay(100);
    this.currentUser = null;
  }

  async getMe() {
    await delay();
    if (!this.currentUser) throw new Error("Unauthorized");
    return this.currentUser;
  }

  async updateProfile(payload) {
    await delay();
    if (!this.currentUser) throw new Error("Unauthorized");
    Object.assign(this.currentUser, payload);
    return { message: "Profile updated" };
  }

  // --- Activities (Public) ---
  async getActivities({ status } = {}) {
    await delay();
    let acts = this.activities.map(act => ({
      ...act,
      participants_count: this.participations.filter(p => p.activity_id === act.id).length
    }));
    if (status) acts = acts.filter(a => a.status === status);
    return acts;
  }

  async getActivity(id) {
    await delay();
    const act = this.activities.find(a => a.id === parseInt(id));
    if (!act) throw new Error("Activity not found");
    return {
      ...act,
      participants_count: this.participations.filter(p => p.activity_id === act.id).length
    };
  }

  async participateInActivity(id, payload) {
    await delay();
    const existing = this.participations.find(
      p => p.activity_id === parseInt(id) && (p.email === payload.email || p.user_id === this.currentUser?.id)
    );
    if (existing) throw new Error("Já participas nesta atividade");
    const newPart = { id: this._nextID(), activity_id: parseInt(id), joined_at: new Date().toISOString(), ...payload };
    this.participations.push(newPart);
    return { message: "Participation confirmed", id: newPart.id };
  }

  async getParticipants(activityId) {
    await delay();
    return this.participations.filter(p => p.activity_id === parseInt(activityId));
  }

  async cancelParticipation(activityId, participationId) {
    await delay();
    const idx = this.participations.findIndex(p => p.id === parseInt(participationId) && p.activity_id === parseInt(activityId));
    if (idx === -1) throw new Error("Participation not found");
    this.participations.splice(idx, 1);
    return { message: "Participation cancelled" };
  }

  // --- Admin Activities ---
  async adminGetActivities({ status } = {}) {
    await delay();
    let acts = this.activities.map(act => ({
      ...act,
      participants_count: this.participations.filter(p => p.activity_id === act.id).length
    }));
    if (status) acts = acts.filter(a => a.status === status);
    return acts;
  }

  async createActivity(payload) {
    await delay();
    const newAct = { id: this._nextID(), ...payload, status: 'planned', participants_count: 0 };
    this.activities.push(newAct);
    return newAct;
  }

  async updateActivity(id, payload) {
    await delay();
    const idx = this.activities.findIndex(a => a.id === parseInt(id));
    if (idx === -1) throw new Error("Not found");
    this.activities[idx] = { ...this.activities[idx], ...payload };
    return this.activities[idx];
  }

  async updateActivityStatus(id, status) {
    await delay();
    const idx = this.activities.findIndex(a => a.id === parseInt(id));
    if (idx === -1) throw new Error("Not found");
    this.activities[idx].status = status;
    return { message: "Activity status updated", status };
  }

  // --- Proposals ---
  async getProposals({ status } = {}) {
    await delay();
    let props = this.proposals;
    if (status) props = props.filter(p => p.status === status);
    return props;
  }

  async createProposal(payload) {
    await delay();
    const newP = { id: this._nextID(), ...payload, status: 'pending', created_at: new Date().toISOString(), created_by: this.currentUser?.id };
    this.proposals.push(newP);
    return { id: newP.id, status: 'pending' };
  }

  async updateProposalStatus(id, status) {
    await delay();
    const idx = this.proposals.findIndex(p => p.id === parseInt(id));
    if (idx === -1) throw new Error("Not found");
    this.proposals[idx].status = status;
    if (status === 'approved') {
      // Auto-create activity from approved proposal
      const p = this.proposals[idx];
      const newAct = {
        id: this._nextID(), name: p.title, description: p.description,
        date: p.start_date, location: "A definir", project_id: 1,
        status: 'planned', area: p.area, visibility: 'public', participants_count: 0,
      };
      this.activities.push(newAct);
    }
    return { message: `Proposal ${status}` };
  }

  // --- Meetings ---
  async getMeetings() {
    await delay();
    return this.meetings;
  }

  async createMeeting(payload) {
    await delay();
    const newM = { id: this._nextID(), ...payload, status: 'scheduled' };
    this.meetings.push(newM);
    return newM;
  }

  async updateMeeting(id, payload) {
    await delay();
    const idx = this.meetings.findIndex(m => m.id === parseInt(id));
    if (idx === -1) throw new Error("Not found");
    this.meetings[idx] = { ...this.meetings[idx], ...payload };
    return this.meetings[idx];
  }

  async deleteMeeting(id) {
    await delay();
    const idx = this.meetings.findIndex(m => m.id === parseInt(id));
    if (idx === -1) throw new Error("Not found");
    this.meetings.splice(idx, 1);
    return { message: "Meeting deleted" };
  }

  // --- Projects ---
  async getProjects({ status } = {}) {
    await delay();
    let projs = this.projects;
    if (status) projs = projs.filter(p => p.status === status);
    return projs;
  }

  async createProject(payload) {
    await delay();
    const newP = { id: this._nextID(), ...payload, status: 'planning' };
    this.projects.push(newP);
    return { id: newP.id, status: 'planning' };
  }

  async updateProjectStatus(id, status) {
    await delay();
    const idx = this.projects.findIndex(p => p.id === parseInt(id));
    if (idx === -1) throw new Error("Not found");
    this.projects[idx].status = status;
    return { status };
  }

  // --- Users Admin ---
  async getUsers() {
    await delay();
    return this.users;
  }

  async createUser(payload) {
    await delay();
    const exists = this.users.find(u => u.email === payload.email);
    if (exists) throw new Error("Email already in use");
    const newU = { id: this._nextID(), ...payload, status: 'active', joined: new Date().toISOString().split('T')[0] };
    this.users.push(newU);
    return newU;
  }

  async updateUser(id, payload) {
    await delay();
    const idx = this.users.findIndex(u => u.id === parseInt(id));
    if (idx === -1) throw new Error("Not found");
    this.users[idx] = { ...this.users[idx], ...payload };
    return this.users[idx];
  }

  async updateUserStatus(id, status) {
    await delay();
    const idx = this.users.findIndex(u => u.id === parseInt(id));
    if (idx === -1) throw new Error("Not found");
    this.users[idx].status = status;
    return { message: "User status updated" };
  }

  // --- Dashboard ---
  async getDashboardMetrics() {
    await delay();
    const thisMonth = new Date().getMonth();
    return {
      activities: {
        total: this.activities.length,
        planned: this.activities.filter(a => a.status === 'planned').length,
        active: this.activities.filter(a => a.status === 'active').length,
        completed: this.activities.filter(a => a.status === 'completed').length,
      },
      participants: this.participations.length,
      meetings: this.meetings.length,
      users: this.users.length,
      proposals: {
        total: this.proposals.length,
        pending: this.proposals.filter(p => p.status === 'pending').length,
        approved: this.proposals.filter(p => p.status === 'approved').length,
        rejected: this.proposals.filter(p => p.status === 'rejected').length,
      }
    };
  }

  // --- Backups ---
  async getBackups() {
    await delay();
    return this.backups;
  }

  async createBackup(description) {
    await delay();
    const newB = { id: this._nextID(), description, created_at: new Date().toISOString(), size: `${(Math.random() * 50 + 10).toFixed(1)} MB` };
    this.backups.unshift(newB);
    return newB;
  }

  async restoreBackup(id) {
    await delay(1500);
    const backup = this.backups.find(b => b.id === parseInt(id));
    if (!backup) throw new Error("Backup not found");
    return { message: "System restored successfully" };
  }

  // --- Report ---
  async getReport() {
    await delay();
    return {
      total_activities: this.activities.length,
      completed_activities: this.activities.filter(a => a.status === 'completed').length,
      participants: this.participations.length,
      meetings: this.meetings.length,
      engagement_rate: `${Math.round((this.activities.filter(a => a.status !== 'planned').length / this.activities.length) * 100)}%`,
      projects: this.projects.length,
    };
  }
}

export const api = new ApiService();
