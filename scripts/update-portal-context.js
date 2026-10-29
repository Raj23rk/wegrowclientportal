const fs = require('fs');
const path = require('path');

const ctxPath = path.resolve(__dirname, '../../wegrow-clientportal-frontend/src/context/PortalContext.tsx');

const content = `import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ClientData, User, SessionFeedback, BusinessUpdate, ActionItem, ActionStatus, ActionComment, Session } from '../types';
import { api } from '../services/api';
import { TODAY, addDays } from '../utils/date';

interface PortalContextType {
  user: User | null;
  client: ClientData | null;
  clients: Record<string, ClientData>;
  previewAs: string | null;
  theme: 'light' | 'dark' | 'system';
  collapsed: boolean;
  sidebarOpen: boolean;
  loading: boolean;
  toastMessage: string | null;
  login: (email: string, pass: string, remember: boolean) => Promise<boolean>;
  logout: () => void;
  setTheme: (t: 'light' | 'dark' | 'system') => void;
  setCollapsed: (c: boolean) => void;
  setSidebarOpen: (o: boolean) => void;
  setPreviewAs: (cid: string | null) => void;
  addClient: (data: Partial<ClientData>) => Promise<ClientData>;
  deleteClient: (cid: string) => Promise<void>;
  assignTask: (targetCid: string, taskInput: Partial<ActionItem>, notifyClient?: boolean, commentNote?: string) => Promise<void>;
  updateTaskStatus: (targetCid: string, actionId: string, status: ActionStatus, newProgress?: number) => Promise<void>;
  deleteActionItem: (targetCid: string, actionId: string) => Promise<void>;
  scheduleSession: (targetCid: string, sessionInput: any, notifyClient?: boolean) => Promise<void>;
  updateSession: (targetCid: string, sessionId: string, patch: any) => Promise<void>;
  deleteSession: (targetCid: string, sessionId: string) => Promise<void>;
  updateClientProfile: (patch: Partial<ClientData>) => Promise<void>;
  submitFeedback: (fb: SessionFeedback) => Promise<void>;
  publishUpdate: (clientId: string, update: Partial<BusinessUpdate>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  addActionComment: (actionId: string, text: string) => Promise<void>;
  toggleEventRegistration: (eventId: string) => Promise<boolean>;
  isRegisteredForEvent: (eventId: string) => boolean;
  markUpdateRead: (updateId: string) => void;
  showToast: (msg: string) => void;
  refreshData: () => Promise<void>;
}

const MONTH_TEMPLATE: [string, string][] = [
  ['Foundation & Business Assessment', 'Understand the current business structure and identify operational gaps.'],
  ['Process Optimisation', 'Document and streamline the core operating processes.'],
  ['People & Organisation', 'Align roles, responsibilities and capability with the redesigned processes.'],
  ['Technology & Systems', 'Select and configure the systems that hold the new processes in place.'],
  ['Performance & Growth', 'Install a KPI rhythm and open growth levers.'],
  ['Review & Sustainability', 'Measure the transformation and hand over a self-running management system.']
];

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [client, setClient] = useState<ClientData | null>(null);
  const [clients, setClients] = useState<Record<string, ClientData>>({});
  const [previewAs, setPreviewAsState] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(() => {
    try {
      return (localStorage.getItem('wg:theme') as any) || 'system';
    } catch (e) {
      return 'system';
    }
  });

  const [collapsed, setCollapsedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('wg:collapsed') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme');
      try { localStorage.removeItem('wg:theme'); } catch (e) {}
    } else {
      document.documentElement.setAttribute('data-theme', theme);
      try { localStorage.setItem('wg:theme', theme); } catch (e) {}
    }
  }, [theme]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const fetchClientData = useCallback(async (clientId: string) => {
    try {
      const data = await api.clients.getById(clientId);
      setClient(data);
      setClients((prev) => ({ ...prev, [clientId]: data }));
    } catch (err: any) {
      console.error('Failed to fetch client data:', err);
      showToast(err.message || 'Error loading client data');
    }
  }, []);

  const fetchAdminClients = useCallback(async () => {
    try {
      const list = await api.clients.getAll();
      const map: Record<string, ClientData> = {};
      list.forEach((c) => {
        map[c.id || (c as any).clientId] = c;
      });
      try {
        const stored: Record<string, ClientData> = JSON.parse(
          localStorage.getItem('wg:custom_clients') || '{}'
        );
        Object.entries(stored).forEach(([k, v]) => {
          map[k] = { ...v, ...(map[k] || {}) };
        });
      } catch (e) {}
      setClients(map);
    } catch (err: any) {
      console.error('Failed to fetch admin clients:', err);
    }
  }, []);

  const refreshData = useCallback(async () => {
    if (user?.role === 'admin') {
      await fetchAdminClients();
      if (previewAs) {
        await fetchClientData(previewAs);
      }
    } else if (user?.clientId) {
      await fetchClientData(user.clientId);
    }
  }, [user, previewAs, fetchAdminClients, fetchClientData]);

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      const token = localStorage.getItem('wg:token');
      if (!token) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const profile = await api.auth.getProfile();
        if (mounted && profile) {
          setUser(profile);
          if (profile.role === 'client' && profile.clientId) {
            await fetchClientData(profile.clientId);
          } else if (profile.role === 'admin') {
            await fetchAdminClients();
          }
        }
      } catch (err) {
        console.warn('Session expired or backend offline:', err);
        api.auth.logout();
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initSession();
    return () => {
      mounted = false;
    };
  }, [fetchClientData, fetchAdminClients]);

  useEffect(() => {
    if (previewAs) {
      fetchClientData(previewAs);
    } else if (user?.role === 'admin') {
      setClient(null);
    }
  }, [previewAs, user, fetchClientData]);

  const login = async (email: string, pass: string, remember: boolean): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await api.auth.login(email, pass);
      setUser(res.user);
      setPreviewAsState(null);

      if (res.user.role === 'client' && res.user.clientId) {
        await fetchClientData(res.user.clientId);
      } else if (res.user.role === 'admin') {
        await fetchAdminClients();
      }

      setLoading(false);
      return true;
    } catch (err: any) {
      setLoading(false);
      showToast(err.message || 'Login failed');
      return false;
    }
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
    setClient(null);
    setClients({});
    setPreviewAsState(null);
  };

  const setTheme = (t: 'light' | 'dark' | 'system') => {
    setThemeState(t);
  };

  const setCollapsed = (c: boolean) => {
    setCollapsedState(c);
    try {
      localStorage.setItem('wg:collapsed', String(c));
    } catch (e) {}
  };

  const setPreviewAs = (cid: string | null) => {
    setPreviewAsState(cid);
  };

  const addClient = async (data: Partial<ClientData>): Promise<ClientData> => {
    const existingIds = Object.keys(clients).map((k) => +k.replace(/\\D/g, '') || 0);
    const nextNum = Math.max(0, ...existingIds) + 1;
    const newId = data.id || \`C\${String(nextNum).padStart(3, '0')}\`;
    const short = data.company
      ? data.company
          .split(/\\s+/)
          .filter(
            (w) =>
              /^[A-Za-z]/.test(w) &&
              !/^(pvt|ltd|private|limited|llp|inc)\\.?$/i.test(w)
          )
          .map((w) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : 'CL';

    const startDate = data.start || TODAY;
    const s = new Date(startDate);
    const mNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const months = MONTH_TEMPLATE.map((t, i) => {
      const d = new Date(s.getFullYear(), s.getMonth() + i, 1);
      return {
        n: i + 1,
        key: \`\${d.getFullYear()}-\${String(d.getMonth() + 1).padStart(2, '0')}\`,
        name: mNames[d.getMonth()],
        year: d.getFullYear(),
        theme: t[0],
        objective: t[1],
        focus: [],
        outcome: '',
        notes: ''
      };
    });

    const newClient: ClientData = {
      id: newId,
      clientId: newId,
      company: data.company || 'Untitled Client',
      short: data.short || short,
      color: data.color || '#C2410C',
      industry: data.industry || 'Management Consulting',
      size: data.size || '100+ employees',
      city: data.location?.split(',')[0] || data.city || 'Chennai',
      location: data.location || 'Chennai, Tamil Nadu',
      contact: data.contact || 'Primary Contact',
      contactTitle: data.contactTitle || 'Managing Director',
      email: data.email || \`\${newId.toLowerCase()}@client.com\`,
      password: data.password || 'client123',
      phone: data.phone || '+91 98765 43210',
      start: startDate,
      end: data.end || addDays(startDate, 181),
      consultant: data.consultant || 'Dr. Thavabalan',
      areas:
        data.areas && data.areas.length
          ? data.areas
          : ['People', 'Process', 'Technology', 'Operations', 'Management'],
      people: { ceo: data.contact || 'Primary Contact' },
      scoreHistory: [{ m: 'Baseline', v: 40 }],
      dept: [
        { k: 'People', prev: 35, v: 45 },
        { k: 'Process', prev: 40, v: 50 },
        { k: 'Technology', prev: 30, v: 42 },
        { k: 'Operations', prev: 45, v: 55 },
        { k: 'Management', prev: 50, v: 60 }
      ],
      months,
      actions: [],
      sessions: [],
      reports: [],
      updates: [],
      events: [],
      photos: [],
      documents: [],
      notifications: [
        {
          id: \`N\${Date.now()}\`,
          cat: 'Important',
          text: \`Welcome to your WeGrow portal, \${(data.contact || '').split(' ')[0] || 'Client'}. Your 6-month plan will appear here.\`,
          date: TODAY,
          read: false,
          link: '/action-plan'
        }
      ],
      feedback: [],
      status: 'Active',
      ...data
    };

    try {
      await api.clients.create(newClient);
    } catch (e) {
      console.warn('Backend client create fallback', e);
    }

    setClients((prev) => {
      const updated = { ...prev, [newId]: newClient };
      try {
        localStorage.setItem('wg:custom_clients', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });

    showToast(\`Client portal created for \${newClient.company}\`);
    await refreshData();
    return newClient;
  };

  const deleteClient = async (cid: string): Promise<void> => {
    try {
      await api.clients.delete(cid);
    } catch (e) {
      console.warn('Backend delete client fallback', e);
    }
    setClients((prev) => {
      const next = { ...prev };
      delete next[cid];
      try {
        localStorage.setItem('wg:custom_clients', JSON.stringify(next));
      } catch (err) {}
      return next;
    });
    if (client?.id === cid) setClient(null);
    showToast('Client removed');
    await refreshData();
  };

  const assignTask = async (
    targetCid: string,
    taskInput: Partial<ActionItem>,
    notifyClient: boolean = true,
    commentNote?: string
  ): Promise<void> => {
    const target = clients[targetCid];
    if (!target) return;

    const newActionId = taskInput.id || taskInput.actionId || \`A\${Date.now()}\`;
    const initialComments: ActionComment[] = [...(taskInput.comments || [])];
    if (commentNote && commentNote.trim()) {
      initialComments.push({
        by: user?.name || 'Dr. Thavabalan',
        date: TODAY,
        text: commentNote.trim()
      });
    }

    const newAction: ActionItem = {
      id: newActionId,
      actionId: newActionId,
      month: taskInput.month || 1,
      title: taskInput.title || 'Untitled Action Item',
      desc: taskInput.desc || '',
      owner: taskInput.owner || 'Client Lead',
      due: taskInput.due || addDays(TODAY, 14),
      priority: taskInput.priority || 'Medium',
      status: taskInput.status || 'Not Started',
      progress:
        taskInput.status === 'Completed'
          ? 100
          : taskInput.status === 'Not Started'
          ? 0
          : taskInput.progress || 0,
      comments: initialComments,
      attachments: taskInput.attachments || []
    };

    const existingIdx = target.actions.findIndex(
      (a) => a.id === newActionId || (a as any).actionId === newActionId
    );

    let updatedActions: ActionItem[];
    if (existingIdx !== -1) {
      updatedActions = target.actions.map((a, i) => (i === existingIdx ? newAction : a));
    } else {
      updatedActions = [...target.actions, newAction];
    }

    const updatedClient: ClientData = { ...target, actions: updatedActions };

    try {
      if (existingIdx !== -1) {
        await api.admin.updateTask(targetCid, newActionId, {
          ...newAction,
          note: commentNote,
          notify: notifyClient
        });
      } else {
        await api.admin.createTask(targetCid, {
          ...newAction,
          note: commentNote,
          notify: notifyClient
        });
      }
    } catch (e) {
      console.warn('Backend task persist fallback', e);
    }

    setClients((prev) => {
      const merged = { ...prev, [targetCid]: updatedClient };
      try {
        localStorage.setItem('wg:custom_clients', JSON.stringify(merged));
      } catch (err) {}
      return merged;
    });

    if (client?.id === targetCid) {
      setClient(updatedClient);
    }

    showToast(
      \`Task \${existingIdx !== -1 ? 'updated' : 'assigned to'} \${target.company}\`
    );
    await refreshData();
  };

  const updateTaskStatus = async (
    targetCid: string,
    actionId: string,
    status: ActionStatus,
    newProgress?: number
  ): Promise<void> => {
    const target = clients[targetCid];
    if (!target) return;

    const prog =
      newProgress !== undefined
        ? newProgress
        : status === 'Completed'
        ? 100
        : status === 'Not Started'
        ? 0
        : undefined;

    const updatedActions = target.actions.map((a) => {
      if (a.id === actionId || (a as any).actionId === actionId) {
        return {
          ...a,
          status,
          ...(prog !== undefined ? { progress: prog } : {})
        };
      }
      return a;
    });

    const updatedClient: ClientData = { ...target, actions: updatedActions };

    try {
      await api.admin.updateTask(targetCid, actionId, {
        status,
        ...(prog !== undefined ? { progress: prog } : {})
      });
    } catch (e) {
      console.warn('Backend update action fallback', e);
    }

    setClients((prev) => {
      const merged = { ...prev, [targetCid]: updatedClient };
      try {
        localStorage.setItem('wg:custom_clients', JSON.stringify(merged));
      } catch (err) {}
      return merged;
    });

    if (client?.id === targetCid) {
      setClient(updatedClient);
    }

    showToast(\`Status updated to \${status}\`);
    await refreshData();
  };

  const deleteActionItem = async (
    targetCid: string,
    actionId: string
  ): Promise<void> => {
    const target = clients[targetCid];
    if (!target) return;

    try {
      await api.admin.deleteTask(targetCid, actionId);
    } catch (e) {
      console.warn('Backend delete task fallback', e);
    }

    const updatedActions = target.actions.filter(
      (a) => a.id !== actionId && (a as any).actionId !== actionId
    );
    const updatedClient = { ...target, actions: updatedActions };

    setClients((prev) => {
      const merged = { ...prev, [targetCid]: updatedClient };
      try {
        localStorage.setItem('wg:custom_clients', JSON.stringify(merged));
      } catch (err) {}
      return merged;
    });

    if (client?.id === targetCid) {
      setClient(updatedClient);
    }

    showToast('Task removed');
    await refreshData();
  };

  const scheduleSession = async (
    targetCid: string,
    sessionInput: any,
    notifyClient: boolean = true
  ): Promise<void> => {
    const target = clients[targetCid];
    if (!target) return;

    const newId = sessionInput.id || sessionInput.sessionId || \`S\${Date.now()}\`;
    const newSession: Session = {
      ...sessionInput,
      id: newId,
      sessionId: newId,
      status: sessionInput.status || 'Upcoming',
      duration: sessionInput.duration || 90,
      agenda: sessionInput.agenda || [],
      objectives: sessionInput.objectives || [],
      attachments: sessionInput.attachments || []
    };

    try {
      await api.admin.createSession(targetCid, { ...newSession, notify: notifyClient });
    } catch (e) {
      console.warn('Backend create session fallback', e);
    }

    const updatedSessions = [...target.sessions, newSession];
    const updatedClient: ClientData = { ...target, sessions: updatedSessions };

    setClients((prev) => {
      const merged = { ...prev, [targetCid]: updatedClient };
      try {
        localStorage.setItem('wg:custom_clients', JSON.stringify(merged));
      } catch (err) {}
      return merged;
    });

    if (client?.id === targetCid) {
      setClient(updatedClient);
    }

    showToast(\`Session scheduled for \${target.company}\`);
    await refreshData();
  };

  const updateSession = async (
    targetCid: string,
    sessionId: string,
    patch: any
  ): Promise<void> => {
    const target = clients[targetCid];
    if (!target) return;

    try {
      await api.admin.updateSession(targetCid, sessionId, patch);
    } catch (e) {
      console.warn('Backend update session fallback', e);
    }

    const updatedSessions = target.sessions.map((s) =>
      s.id === sessionId || (s as any).sessionId === sessionId ? { ...s, ...patch } : s
    );
    const updatedClient: ClientData = { ...target, sessions: updatedSessions };

    setClients((prev) => ({ ...prev, [targetCid]: updatedClient }));
    if (client?.id === targetCid) {
      setClient(updatedClient);
    }
    showToast('Session updated');
    await refreshData();
  };

  const deleteSession = async (targetCid: string, sessionId: string): Promise<void> => {
    try {
      await api.admin.deleteSession(targetCid, sessionId);
    } catch (e) {
      console.warn('Backend delete session fallback', e);
    }
    const target = clients[targetCid];
    if (target) {
      const updated = {
        ...target,
        sessions: target.sessions.filter((s) => s.id !== sessionId && (s as any).sessionId !== sessionId)
      };
      setClients((prev) => ({ ...prev, [targetCid]: updated }));
      if (client?.id === targetCid) setClient(updated);
    }
    showToast('Session removed');
    await refreshData();
  };

  const updateClientProfile = async (patch: Partial<ClientData>) => {
    if (!client) return;
    try {
      const updated = await api.clients.updateProfile(client.id, patch);
      const merged = { ...client, ...updated };
      setClient(merged);
      setClients((prev) => ({ ...prev, [client.id]: merged }));
      showToast('Changes saved');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile');
    }
  };

  const submitFeedback = async (fb: SessionFeedback) => {
    if (!client) return;
    try {
      await api.portal.submitFeedback(client.id, fb);
      await fetchClientData(client.id);
      showToast('Feedback submitted — thank you');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit feedback');
    }
  };

  const publishUpdate = async (clientId: string, update: Partial<BusinessUpdate>) => {
    try {
      await api.portal.publishUpdate({
        clientId,
        title: update.title || 'Untitled Update',
        type: update.type || 'General Update',
        cat: update.cat || 'Operations',
        body: update.body || ''
      });
      await refreshData();
      showToast('Update published successfully');
    } catch (err: any) {
      showToast(err.message || 'Failed to publish update');
    }
  };

  const markNotificationRead = async (id: string) => {
    if (!client) return;
    try {
      await api.portal.markNotificationRead(client.id, id);
      setClient((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          notifications: prev.notifications.map((n) =>
            n.id === id || (n as any).notifId === id ? { ...n, read: true } : n
          )
        };
      });
    } catch (err: any) {
      console.error(err);
    }
  };

  const markAllNotificationsRead = async () => {
    if (!client) return;
    try {
      await api.portal.markAllNotificationsRead(client.id);
      setClient((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          notifications: prev.notifications.map((n) => ({ ...n, read: true }))
        };
      });
      showToast('All notifications marked as read');
    } catch (err: any) {
      showToast(err.message || 'Failed to mark notifications read');
    }
  };

  const addActionComment = async (actionId: string, text: string) => {
    if (!client) return;
    try {
      await api.portal.addComment(client.id, actionId, text);
      await fetchClientData(client.id);
      showToast('Comment added');
    } catch (err: any) {
      showToast(err.message || 'Failed to add comment');
    }
  };

  const isRegisteredForEvent = (eventId: string): boolean => {
    if (!client) return false;
    const event = client.events?.find((e) => e.id === eventId || (e as any).eventId === eventId);
    if (event && Array.isArray((event as any).registeredClientIds)) {
      return (
        (event as any).registeredClientIds.includes(client.id) ||
        (event as any).registeredClientIds.includes((client as any).clientId)
      );
    }
    try {
      const reg: string[] = JSON.parse(localStorage.getItem(\`wg:reg:\${client.id}\`) || '[]');
      return reg.includes(eventId);
    } catch (e) {
      return false;
    }
  };

  const toggleEventRegistration = async (eventId: string): Promise<boolean> => {
    if (!client) return false;
    try {
      const res = await api.portal.toggleEventRegistration(client.id, eventId);
      let reg: string[] = JSON.parse(localStorage.getItem(\`wg:reg:\${client.id}\`) || '[]');
      if (res.registered) {
        if (!reg.includes(eventId)) reg.push(eventId);
        showToast('You are registered');
      } else {
        reg = reg.filter((id) => id !== eventId);
        showToast('Registration cancelled');
      }
      localStorage.setItem(\`wg:reg:\${client.id}\`, JSON.stringify(reg));
      await fetchClientData(client.id);
      return res.registered;
    } catch (err: any) {
      showToast(err.message || 'Failed to update event registration');
      return false;
    }
  };

  const markUpdateRead = (updateId: string) => {
    if (!client) return;
    const read = client.readUpdates || [];
    if (!read.includes(updateId)) {
      setClient((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          readUpdates: [...read, updateId]
        };
      });
    }
  };

  return (
    <PortalContext.Provider
      value={{
        user,
        client,
        clients,
        previewAs,
        theme,
        collapsed,
        sidebarOpen,
        loading,
        toastMessage,
        login,
        logout,
        setTheme,
        setCollapsed,
        setSidebarOpen,
        setPreviewAs,
        addClient,
        deleteClient,
        assignTask,
        updateTaskStatus,
        deleteActionItem,
        scheduleSession,
        updateSession,
        deleteSession,
        updateClientProfile,
        submitFeedback,
        publishUpdate,
        markNotificationRead,
        markAllNotificationsRead,
        addActionComment,
        toggleEventRegistration,
        isRegisteredForEvent,
        markUpdateRead,
        showToast,
        refreshData
      }}
    >
      {children}
      {toastMessage && (
        <div className="toast" role="status">
          {toastMessage}
        </div>
      )}
    </PortalContext.Provider>
  );
};

export const usePortal = () => {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error('usePortal must be used within PortalProvider');
  return ctx;
};
`;

fs.writeFileSync(ctxPath, content, 'utf8');
console.log('4. Updated PortalContext.tsx successfully');
