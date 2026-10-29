const fs = require('fs');
const path = require('path');

const apiPath = path.resolve(__dirname, '../../wegrow-clientportal-frontend/src/services/api.ts');

const newApiContent = `import { User, ClientData, SessionFeedback, BusinessUpdate } from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('wg:token');
  return token ? { Authorization: \`Bearer \${token}\` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers
  };

  const response = await fetch(\`\${API_BASE}\${endpoint}\`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || \`Request failed with status \${response.status}\`);
  }

  return response.json();
}

export function normalizeClient(raw: any): ClientData {
  if (!raw) return raw;
  const clientId = raw.clientId || raw.id || raw._id || '';
  const id = clientId;

  return {
    ...raw,
    id,
    clientId,
    logo: raw.logo || null,
    status: raw.status || 'Active',
    actions: Array.isArray(raw.actions)
      ? raw.actions.map((a: any) => ({
          ...a,
          id: a.actionId || a.id || a._id,
          actionId: a.actionId || a.id || a._id,
          comments: Array.isArray(a.comments) ? a.comments : [],
          attachments: Array.isArray(a.attachments) ? a.attachments : []
        }))
      : [],
    sessions: Array.isArray(raw.sessions)
      ? raw.sessions.map((s: any) => ({
          ...s,
          id: s.sessionId || s.id || s._id,
          sessionId: s.sessionId || s.id || s._id,
          agenda: Array.isArray(s.agenda) ? s.agenda : [],
          objectives: Array.isArray(s.objectives) ? s.objectives : [],
          attachments: Array.isArray(s.attachments) ? s.attachments : []
        }))
      : [],
    reports: Array.isArray(raw.reports)
      ? raw.reports.map((r: any) => ({
          ...r,
          id: r.reportId || r.id || r._id,
          reportId: r.reportId || r.id || r._id
        }))
      : [],
    updates: Array.isArray(raw.updates)
      ? raw.updates.map((u: any) => ({
          ...u,
          id: u.updateId || u.id || u._id,
          updateId: u.updateId || u.id || u._id
        }))
      : [],
    events: Array.isArray(raw.events)
      ? raw.events.map((e: any) => ({
          ...e,
          id: e.eventId || e.id || e._id,
          eventId: e.eventId || e.id || e._id,
          agenda: Array.isArray(e.agenda) ? e.agenda : [],
          speakers: Array.isArray(e.speakers) ? e.speakers : [],
          registeredClientIds: Array.isArray(e.registeredClientIds) ? e.registeredClientIds : []
        }))
      : [],
    photos: Array.isArray(raw.photos)
      ? raw.photos.map((p: any) => ({
          ...p,
          id: p.photoId || p.id || p._id,
          photoId: p.photoId || p.id || p._id
        }))
      : [],
    documents: Array.isArray(raw.documents)
      ? raw.documents.map((d: any) => ({
          ...d,
          id: d.docId || d.id || d._id,
          docId: d.docId || d.id || d._id
        }))
      : [],
    notifications: Array.isArray(raw.notifications)
      ? raw.notifications.map((n: any) => ({
          ...n,
          id: n.notifId || n.id || n._id,
          notifId: n.notifId || n.id || n._id
        }))
      : [],
    feedback: Array.isArray(raw.feedback) ? raw.feedback : [],
    months: Array.isArray(raw.months) ? raw.months : [],
    areas: Array.isArray(raw.areas) ? raw.areas : [],
    scoreHistory: Array.isArray(raw.scoreHistory) ? raw.scoreHistory : [],
    dept: Array.isArray(raw.dept) ? raw.dept : [],
    people: raw.people || {}
  };
}

export const api = {
  auth: {
    async login(email: string, pass: string): Promise<{ access_token: string; user: User }> {
      const data = await request<{ access_token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, pass })
      });
      if (data.access_token) {
        localStorage.setItem('wg:token', data.access_token);
      }
      return data;
    },

    async getProfile(): Promise<User> {
      return request<User>('/auth/profile');
    },

    logout() {
      localStorage.removeItem('wg:token');
    }
  },

  clients: {
    async getAll(): Promise<ClientData[]> {
      const list = await request<any[]>('/clients');
      return Array.isArray(list) ? list.map(normalizeClient) : [];
    },

    async getById(id: string): Promise<ClientData> {
      const data = await request<any>(\`/clients/\${id}\`);
      return normalizeClient(data);
    },

    async create(payload: Partial<ClientData>): Promise<ClientData> {
      try {
        const data = await request<any>('/admin/clients', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        return normalizeClient(data);
      } catch (e) {
        console.warn('Backend admin create client fallback to local', e);
        return normalizeClient(payload);
      }
    },

    async updateProfile(id: string, patch: Partial<ClientData>): Promise<ClientData> {
      const data = await request<any>(\`/clients/\${id}\`, {
        method: 'PATCH',
        body: JSON.stringify(patch)
      });
      return normalizeClient(data);
    },

    async delete(id: string): Promise<any> {
      return request(\`/admin/clients/\${id}\`, {
        method: 'DELETE'
      });
    }
  },

  admin: {
    async getDashboard(): Promise<any> {
      return request<any>('/admin/dashboard');
    },

    async createTask(clientId: string, task: any): Promise<any> {
      return request(\`/admin/clients/\${clientId}/tasks\`, {
        method: 'POST',
        body: JSON.stringify(task)
      });
    },

    async updateTask(clientId: string, actionId: string, patch: any): Promise<any> {
      return request(\`/admin/clients/\${clientId}/tasks/\${actionId}\`, {
        method: 'PATCH',
        body: JSON.stringify(patch)
      });
    },

    async deleteTask(clientId: string, actionId: string): Promise<any> {
      return request(\`/admin/clients/\${clientId}/tasks/\${actionId}\`, {
        method: 'DELETE'
      });
    },

    async createSession(clientId: string, session: any): Promise<any> {
      return request(\`/admin/clients/\${clientId}/sessions\`, {
        method: 'POST',
        body: JSON.stringify(session)
      });
    },

    async updateSession(clientId: string, sessionId: string, patch: any): Promise<any> {
      return request(\`/admin/clients/\${clientId}/sessions/\${sessionId}\`, {
        method: 'PATCH',
        body: JSON.stringify(patch)
      });
    },

    async deleteSession(clientId: string, sessionId: string): Promise<any> {
      return request(\`/admin/clients/\${clientId}/sessions/\${sessionId}\`, {
        method: 'DELETE'
      });
    },

    async addDocument(clientId: string, doc: any): Promise<any> {
      return request(\`/admin/clients/\${clientId}/documents\`, {
        method: 'POST',
        body: JSON.stringify(doc)
      });
    },

    async addReport(clientId: string, report: any): Promise<any> {
      return request(\`/admin/clients/\${clientId}/reports\`, {
        method: 'POST',
        body: JSON.stringify(report)
      });
    },

    async addUpdate(clientId: string, update: any): Promise<any> {
      return request(\`/admin/clients/\${clientId}/updates\`, {
        method: 'POST',
        body: JSON.stringify(update)
      });
    },

    async sendNotification(clientId: string, notif: any): Promise<any> {
      return request(\`/admin/clients/\${clientId}/notifications\`, {
        method: 'POST',
        body: JSON.stringify(notif)
      });
    }
  },

  portal: {
    async createAction(clientId: string, action: any) {
      try {
        return await request(\`/admin/clients/\${clientId}/tasks\`, {
          method: 'POST',
          body: JSON.stringify(action)
        });
      } catch (e) {
        return action;
      }
    },

    async updateAction(clientId: string, actionId: string, patch: any) {
      try {
        return await request(\`/admin/clients/\${clientId}/tasks/\${actionId}\`, {
          method: 'PATCH',
          body: JSON.stringify(patch)
        });
      } catch (e) {
        return patch;
      }
    },

    async addComment(clientId: string, actionId: string, text: string) {
      return request(\`/portal/\${clientId}/actions/\${actionId}/comments\`, {
        method: 'POST',
        body: JSON.stringify({ text })
      });
    },

    async submitFeedback(clientId: string, feedback: SessionFeedback) {
      return request(\`/portal/\${clientId}/feedback\`, {
        method: 'POST',
        body: JSON.stringify(feedback)
      });
    },

    async publishUpdate(payload: {
      clientId: string;
      title: string;
      type: string;
      cat: string;
      body: string;
    }) {
      return request(\`/portal/admin/publish\`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },

    async markNotificationRead(clientId: string, notifId: string) {
      return request(\`/portal/\${clientId}/notifications/\${notifId}/read\`, {
        method: 'PATCH'
      });
    },

    async markAllNotificationsRead(clientId: string) {
      return request(\`/portal/\${clientId}/notifications/read-all\`, {
        method: 'PATCH'
      });
    },

    async toggleEventRegistration(clientId: string, eventId: string): Promise<{ registered: boolean }> {
      return request<{ registered: boolean }>(\`/portal/\${clientId}/events/\${eventId}/toggle-registration\`, {
        method: 'POST'
      });
    }
  }
};
`;

fs.writeFileSync(apiPath, newApiContent, 'utf8');
console.log('3. Updated api.ts successfully');
