const fs = require('fs');
const path = require('path');

const pagesPath = path.resolve(__dirname, '../../wegrow-clientportal-frontend/src/components/pages/AdminPages.tsx');

const content = `import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { Icon, ClientLogo } from '../common/Icons';
import { fmt, fmtS, fmtL, TODAY, D, MON } from '../../utils/date';
import { ActionStatus, ClientData } from '../../types';

// Helpers
const overallProgress = (c: ClientData): number =>
  c.actions?.length
    ? Math.round(
        c.actions.reduce((s, x) => s + (Number(x.progress) || 0), 0) /
          c.actions.length
      )
    : 0;

const currentMonth = (c: ClientData) => {
  const k = TODAY.slice(0, 7);
  return (
    c.months.find((m) => m.key === k) ||
    (c.months.length > 0 && k < c.months[0].key ? c.months[0] : c.months[c.months.length - 1]) || {
      n: 1,
      theme: 'Business Transformation',
      name: 'Month 1'
    }
  );
};

const getScore = (c: ClientData) =>
  c.scoreHistory && c.scoreHistory.length
    ? c.scoreHistory[c.scoreHistory.length - 1].v
    : '—';

const isOverdue = (a: any) =>
  a.status !== 'Completed' && a.due && a.due < TODAY;

const nextSession = (c: ClientData) =>
  c.sessions.find((s) => s.date >= TODAY && s.status === 'Upcoming');

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    'Not Started': 'b-mute',
    'In Progress': 'b-info',
    'Under Review': 'b-brand',
    Completed: 'b-ok',
    Delayed: 'b-bad'
  };
  return (
    <span className={\`badge \${map[s] || 'b-mute'}\`}>
      <span className="dot" />
      {s}
    </span>
  );
};

const prioBadge = (p: string) => {
  const map: Record<string, string> = {
    High: 'b-bad',
    Medium: 'b-warn',
    Low: 'b-mute'
  };
  return <span className={\`badge \${map[p] || 'b-mute'}\`}>{p}</span>;
};

const renderStars = (rating: number) => (
  <span style={{ color: '#E0A526', whiteSpace: 'nowrap' }}>
    {'★'.repeat(rating)}
    <span style={{ color: 'var(--line-2)' }}>{'★'.repeat(Math.max(0, 5 - rating))}</span>
  </span>
);

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

// =============================================================
// 1. ADMIN OVERVIEW PAGE (Screenshot 1)
// =============================================================
export const AdminOverviewPage: React.FC<{
  onNavigate: (page: string) => void;
  onOpenAddClient: () => void;
  onOpenAssignTask: (clientId?: string, month?: number, action?: any) => void;
  onOpenScheduleSession: (clientId?: string, session?: any) => void;
  onOpenUpload: (clientId?: string) => void;
  onOpenBroadcast: () => void;
}> = ({
  onNavigate,
  onOpenAddClient,
  onOpenAssignTask,
  onOpenScheduleSession,
  onOpenUpload,
  onOpenBroadcast
}) => {
  const { clients, user, setPreviewAs } = usePortal();
  const clientList = Object.values(clients).filter((c) => c.status !== 'Archived');

  const openTasks = clientList.flatMap((c) =>
    (c.actions || []).filter((a) => a.status !== 'Completed').map((a) => ({ client: c, action: a }))
  );
  const overdueCount = openTasks.filter((x) => isOverdue(x.action) || x.action.status === 'Delayed').length;

  const in14Days = TODAY.slice(0, 7) + '-31';
  const upcomingSessions = clientList
    .flatMap((c) =>
      (c.sessions || [])
        .filter((s) => s.status === 'Upcoming' && s.date >= TODAY)
        .map((s) => ({ client: c, session: s }))
    )
    .sort((a, b) => a.session.date.localeCompare(b.session.date));

  const allFeedback = clientList
    .flatMap((c) =>
      (c.feedback || []).map((f) => ({
        client: c,
        feedback: f,
        session: c.sessions.find((s) => s.id === f.session)
      }))
    )
    .sort((a, b) => (b.feedback.date || '').localeCompare(a.feedback.date || ''));

  const avgRating = allFeedback.length
    ? (allFeedback.reduce((s, x) => s + x.feedback.rating, 0) / allFeedback.length).toFixed(1)
    : '—';

  // Attention items: delayed/overdue tasks + past sessions missing summary
  const attentionItems: { client: ClientData; kind: string; title: string; subtitle: string; action: () => void; buttonLabel: string }[] = [];
  clientList.forEach((c) => {
    (c.actions || [])
      .filter((a) => a.status === 'Delayed' || isOverdue(a))
      .forEach((a) => {
        attentionItems.push({
          client: c,
          kind: 'task',
          title: a.title,
          subtitle: \`\${a.status === 'Delayed' ? 'Delayed' : 'Overdue since ' + fmtS(a.due)} · \${a.owner}\`,
          action: () => onOpenAssignTask(c.id, a.month, a),
          buttonLabel: 'Update'
        });
      });

    (c.sessions || [])
      .filter((s) => s.date < TODAY && s.status !== 'Cancelled' && !s.summary)
      .forEach((s) => {
        attentionItems.push({
          client: c,
          kind: 'summary',
          title: s.title,
          subtitle: \`Held \${fmtS(s.date)} · summary not published\`,
          action: () => onOpenScheduleSession(c.id, s),
          buttonLabel: 'Write summary'
        });
      });
  });

  const consultantName = user?.name ? user.name.split(' ').slice(-1)[0] : 'Thavabalan';

  return (
    <>
      <div className="pagehead">
        <div>
          <h1 className="serif" style={{ fontSize: 32, fontWeight: 500 }}>
            {greeting()}, {consultantName}
          </h1>
          <p>
            {fmtL(TODAY)} · {clientList.length} active client portal{clientList.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="qa" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn primary" onClick={() => onOpenAssignTask()}>
            <Icon name="plus" /> Assign task
          </button>
          <button className="btn" onClick={() => onOpenScheduleSession()}>
            <Icon name="calendar" /> Schedule session
          </button>
          <button className="btn" onClick={() => onOpenUpload()}>
            <Icon name="upload" /> Upload
          </button>
          <button className="btn" onClick={() => onOpenBroadcast()}>
            <Icon name="send" /> Publish update
          </button>
        </div>
      </div>

      <section className="grid g4">
        <div className="card kpi">
          <div className="k-lbl">
            Active clients <Icon name="building" />
          </div>
          <div className="k-val">{clientList.length}</div>
          <div className="k-sub">
            avg. progress{' '}
            {clientList.length
              ? Math.round(clientList.reduce((s, c) => s + overallProgress(c), 0) / clientList.length)
              : 0}
            %
          </div>
        </div>

        <div className="card kpi">
          <div className="k-lbl">
            Open action items <Icon name="plan" />
          </div>
          <div className="k-val">{openTasks.length}</div>
          <div className="k-sub">
            {overdueCount > 0 ? (
              <span style={{ color: 'var(--bad)', fontWeight: 700 }}>{overdueCount} overdue</span>
            ) : (
              'none overdue'
            )}
          </div>
        </div>

        <div className="card kpi">
          <div className="k-lbl">
            Sessions, next 14 days <Icon name="sessions" />
          </div>
          <div className="k-val">{upcomingSessions.length}</div>
          <div className="k-sub">
            {upcomingSessions[0] ? \`next: \${fmtS(upcomingSessions[0].session.date)}\` : 'nothing scheduled'}
          </div>
        </div>

        <div className="card kpi">
          <div className="k-lbl">
            Avg. session rating <Icon name="star" />
          </div>
          <div className="k-val">
            {avgRating}
            <small>/5</small>
          </div>
          <div className="k-sub">{allFeedback.length} ratings received</div>
        </div>
      </section>

      <section className="grid g-dash mt">
        <div className="stack">
          <div className="card">
            <div className="card-head">
              <h3>Needs your attention</h3>
              <span className={\`badge \${attentionItems.length ? 'b-bad' : 'b-ok'}\`}>
                {attentionItems.length ? attentionItems.length : 'All clear'}
              </span>
            </div>
            {attentionItems.length > 0 ? (
              attentionItems.slice(0, 6).map((item, i) => (
                <div key={i} className="li">
                  <ClientLogo client={item.client} size={32} />
                  <div className="grow">
                    <b className="ttl">{item.title}</b>
                    <div className="sub">{item.subtitle}</div>
                    <div className="tiny muted">{item.client.company}</div>
                  </div>
                  <button className="btn sm" onClick={item.action}>
                    {item.buttonLabel}
                  </button>
                </div>
              ))
            ) : (
              <div className="small muted">
                Nothing overdue and every past session has a published summary.
              </div>
            )}
            {attentionItems.length > 6 && (
              <button
                className="btn sm ghost"
                style={{ marginTop: 8 }}
                onClick={() => onNavigate('tasks')}
              >
                See all on the task board
              </button>
            )}
          </div>

          <div className="card" style={{ padding: '8px 0' }}>
            <div className="card-head" style={{ padding: '14px 22px 0' }}>
              <h3>Client portfolio</h3>
              <button className="btn sm ghost" onClick={() => onNavigate('clients')}>
                All clients
              </button>
            </div>
            <div className="tablewrap">
              <table className="t">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Month</th>
                    <th style={{ width: 150 }}>Progress</th>
                    <th>Open</th>
                    <th>Score</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clientList.length > 0 ? (
                    clientList.map((c) => {
                      const prog = overallProgress(c);
                      const openCount = (c.actions || []).filter((a) => a.status !== 'Completed').length;
                      const delayed = (c.actions || []).filter((a) => a.status === 'Delayed').length;
                      const cm = currentMonth(c);

                      return (
                        <tr key={c.id}>
                          <td>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                              <ClientLogo client={c} size={32} />
                              <div>
                                <b>{c.company}</b>
                                <div className="tiny muted">{c.consultant}</div>
                              </div>
                            </div>
                          </td>
                          <td>{cm.n} of 6</td>
                          <td>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <div className="progress" style={{ flex: 1 }}>
                                <i style={{ width: \`\${prog}%\` }} />
                              </div>
                              <b className="small">{prog}%</b>
                            </div>
                          </td>
                          <td>
                            {openCount}
                            {delayed > 0 && (
                              <span className="badge b-bad" style={{ marginLeft: 6 }}>
                                {delayed} delayed
                              </span>
                            )}
                          </td>
                          <td>{getScore(c)}</td>
                          <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <button
                              className="btn sm ghost"
                              onClick={() => {
                                setPreviewAs(c.id);
                                onNavigate('dashboard');
                              }}
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 24 }}>
                        <div className="muted">No clients yet. Add your first client.</div>
                        <button
                          className="btn primary sm"
                          style={{ marginTop: 10 }}
                          onClick={onOpenAddClient}
                        >
                          <Icon name="plus" /> Add a client
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="stack">
          <div className="card">
            <div className="card-head">
              <h3>Upcoming sessions</h3>
              <button className="btn sm ghost" onClick={() => onNavigate('sessions')}>
                Schedule
              </button>
            </div>
            {upcomingSessions.length > 0 ? (
              upcomingSessions.slice(0, 5).map(({ client: cl, session: s }) => {
                const dateObj = D(s.date);
                return (
                  <div
                    key={s.id || s.sessionId}
                    className="li clickable"
                    onClick={() => onOpenScheduleSession(cl.id, s)}
                  >
                    <div className="datebox">
                      <b>{dateObj.getDate()}</b>
                      <span>{MON[dateObj.getMonth()]}</span>
                    </div>
                    <div className="grow">
                      <div className="ttl">{s.title}</div>
                      <div className="sub">
                        {cl.company} · {s.time || s.mode}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="small muted">No sessions in the next two weeks.</div>
            )}
          </div>

          <div className="card">
            <div className="card-head">
              <h3>Latest feedback</h3>
              <button className="btn sm ghost" onClick={() => onNavigate('feedback')}>
                All feedback
              </button>
            </div>
            {allFeedback.length > 0 ? (
              allFeedback.slice(0, 4).map((x, i) => (
                <div key={i} className="li">
                  <div className="grow">
                    <div className="row-between">
                      <b className="small">{x.session ? x.session.title : 'Session'}</b>
                      {renderStars(x.feedback.rating)}
                    </div>
                    <div className="tiny muted">
                      {x.client.company} · {fmtS(x.feedback.date || TODAY)}
                    </div>
                    {x.feedback.useful && (
                      <div className="small" style={{ marginTop: 4 }}>
                        "{x.feedback.useful}"
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="small muted">Feedback appears here after clients rate a session.</div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

// =============================================================
// 2. ADMIN CLIENTS PAGE (Screenshot 2)
// =============================================================
export const AdminClientsPage: React.FC<{
  onNavigate: (page: string) => void;
  onOpenAddClient: () => void;
}> = ({ onNavigate, onOpenAddClient }) => {
  const { clients, setPreviewAs } = usePortal();
  const clientList = Object.values(clients).filter((c) => c.status !== 'Archived');

  return (
    <>
      <div className="pagehead">
        <div>
          <h1 className="serif" style={{ fontSize: 32, fontWeight: 500 }}>
            Clients
          </h1>
          <p>Each client gets a private portal. Open a client to manage everything they see.</p>
        </div>
        <button className="btn primary" onClick={onOpenAddClient}>
          <Icon name="plus" /> Add a client
        </button>
      </div>

      {clientList.length > 0 ? (
        <div className="grid g3">
          {clientList.map((c) => {
            const ns = nextSession(c);
            const totalTasks = c.actions ? c.actions.length : 0;
            const completedTasks = c.actions ? c.actions.filter((a) => a.status === 'Completed').length : 0;
            const delayedTasks = c.actions ? c.actions.filter((a) => a.status === 'Delayed').length : 0;
            const prog = overallProgress(c);

            return (
              <div key={c.id} className="card ccard">
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <ClientLogo client={c} size={48} />
                  <div style={{ minWidth: 0 }}>
                    <div className="serif" style={{ fontSize: 20, lineHeight: 1.2, fontWeight: 600 }}>
                      {c.company}
                    </div>
                    <div className="tiny muted">
                      {c.id} · {c.industry || 'Management Consulting'}
                    </div>
                  </div>
                </div>

                <dl className="kv small" style={{ gridTemplateColumns: '110px 1fr', margin: '16px 0' }}>
                  <dt>Contact</dt>
                  <dd>{c.contact || c.phone || '—'}</dd>
                  <dt>Consultant</dt>
                  <dd>{c.consultant || 'Dr. Thavabalan'}</dd>
                  <dt>Period</dt>
                  <dd>
                    {fmtS(c.start)} {D(c.start).getFullYear()} – {fmtS(c.end)} {D(c.end).getFullYear()}
                  </dd>
                  <dt>Next session</dt>
                  <dd>{ns ? \`\${fmtS(ns.date)} · \${ns.title}\` : '—'}</dd>
                </dl>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div className="progress" style={{ flex: 1 }}>
                    <i style={{ width: \`\${prog}%\` }} />
                  </div>
                  <b className="small">{prog}%</b>
                </div>

                <div className="tiny muted" style={{ marginTop: 6 }}>
                  {completedTasks}/{totalTasks} tasks complete
                  {delayedTasks > 0 && (
                    <span style={{ color: 'var(--bad)', marginLeft: 6, fontWeight: 600 }}>
                      · {delayedTasks} delayed
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                  <button
                    className="btn sm primary"
                    onClick={() => {
                      setPreviewAs(c.id);
                      onNavigate('dashboard');
                    }}
                  >
                    Manage portal
                  </button>
                  <button
                    className="btn sm"
                    onClick={() => {
                      setPreviewAs(c.id);
                      onNavigate('dashboard');
                    }}
                  >
                    <Icon name="eye" /> Preview
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card empty" style={{ padding: '56px 24px' }}>
          <b>No client portals yet</b>
          <p style={{ margin: '6px auto 18px', maxWidth: '46ch' }}>
            Add your first client to create their private portal. You can then assign tasks, schedule sessions and upload deliverables for them.
          </p>
          <button className="btn primary" onClick={onOpenAddClient}>
            <Icon name="plus" /> Add a client
          </button>
        </div>
      )}
    </>
  );
};

// =============================================================
// 3. ADMIN TASKS PAGE / TASK BOARD KANBAN (Screenshot 4)
// =============================================================
export const AdminTasksPage: React.FC<{
  onOpenAssignTask: (clientId?: string, month?: number, action?: any) => void;
}> = ({ onOpenAssignTask }) => {
  const { clients, updateTaskStatus } = usePortal();
  const clientList = Object.values(clients).filter((c) => c.status !== 'Archived');

  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('all');
  const [overdueOnly, setOverdueOnly] = useState<boolean>(false);

  let taskRows = clientList
    .filter((c) => selectedClientFilter === 'all' || c.id === selectedClientFilter)
    .flatMap((c) => (c.actions || []).map((a) => ({ client: c, action: a })));

  if (overdueOnly) {
    taskRows = taskRows.filter((x) => isOverdue(x.action) || x.action.status === 'Delayed');
  }

  const KANBAN_COLS: ActionStatus[] = [
    'Not Started',
    'In Progress',
    'Under Review',
    'Completed',
    'Delayed'
  ];

  return (
    <>
      <div className="pagehead">
        <div>
          <h1 className="serif" style={{ fontSize: 32, fontWeight: 500 }}>
            Task board
          </h1>
          <p>
            Every action item across your clients. Change a status here and the client's plan updates instantly.
          </p>
        </div>
        <button
          className="btn primary"
          onClick={() => onOpenAssignTask(selectedClientFilter !== 'all' ? selectedClientFilter : undefined)}
        >
          <Icon name="plus" /> Assign task
        </button>
      </div>

      <div className="row-between" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="input"
            style={{ width: 'auto', minWidth: 200 }}
            value={selectedClientFilter}
            onChange={(e) => setSelectedClientFilter(e.target.value)}
          >
            <option value="all">All clients</option>
            {clientList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company} ({c.id})
              </option>
            ))}
          </select>

          <label className="check">
            <input
              type="checkbox"
              checked={overdueOnly}
              onChange={(e) => setOverdueOnly(e.target.checked)}
            />
            Overdue or delayed only
          </label>
        </div>

        <span className="small muted">{taskRows.length} tasks</span>
      </div>

      <div className="tablewrap">
        <div className="kanban">
          {KANBAN_COLS.map((colStatus) => {
            const colItems = taskRows.filter((x) => x.action.status === colStatus);

            return (
              <div key={colStatus} className="kcol">
                <div className="khead">
                  {statusBadge(colStatus)}
                  <span className="tiny muted">{colItems.length}</span>
                </div>

                {colItems.length > 0 ? (
                  colItems.map(({ client: cl, action: a }) => {
                    const overdue = isOverdue(a);

                    return (
                      <div key={a.id || a.actionId} className="kcard">
                        <div
                          className="clickable"
                          onClick={() => onOpenAssignTask(cl.id, a.month, a)}
                        >
                          <div className="ttl small" style={{ fontWeight: 700 }}>
                            {a.title}
                          </div>

                          {selectedClientFilter === 'all' && (
                            <div style={{ margin: '6px 0' }}>
                              <span className="cchip">
                                <ClientLogo client={cl} size={20} />
                                {cl.company}
                              </span>
                            </div>
                          )}

                          <div className="tiny muted">
                            {a.owner} ·{' '}
                            <span style={overdue ? { color: 'var(--bad)', fontWeight: 700 } : {}}>
                              due {fmtS(a.due)}
                            </span>{' '}
                            · {prioBadge(a.priority)}
                          </div>
                        </div>

                        <div className="progress" style={{ margin: '8px 0' }}>
                          <i style={{ width: \`\${a.progress}%\` }} />
                        </div>

                        <select
                          className="input sm-input"
                          value={a.status}
                          aria-label="Change status"
                          onChange={(e) => {
                            const newStatus = e.target.value as ActionStatus;
                            updateTaskStatus(cl.id, a.id || a.actionId, newStatus);
                          }}
                        >
                          {KANBAN_COLS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })
                ) : (
                  <div className="tiny muted" style={{ padding: 12 }}>
                    None
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

// =============================================================
// 4. ADMIN SESSIONS PAGE (Screenshot 5)
// =============================================================
export const AdminSessionsPage: React.FC<{
  onOpenScheduleSession: (clientId?: string, session?: any) => void;
}> = ({ onOpenScheduleSession }) => {
  const { clients } = usePortal();
  const clientList = Object.values(clients).filter((c) => c.status !== 'Archived');

  const allSessions = clientList.flatMap((c) =>
    (c.sessions || []).map((s) => ({ client: c, session: s }))
  );

  const upcoming = allSessions
    .filter((x) => x.session.status === 'Upcoming' && x.session.date >= TODAY)
    .sort((a, b) => a.session.date.localeCompare(b.session.date));

  const needSummary = allSessions
    .filter((x) => x.session.date < TODAY && x.session.status !== 'Cancelled' && !x.session.summary)
    .sort((a, b) => b.session.date.localeCompare(a.session.date));

  const recentlySummarised = allSessions
    .filter((x) => x.session.summary)
    .sort((a, b) => b.session.date.localeCompare(a.session.date))
    .slice(0, 10);

  return (
    <>
      <div className="pagehead">
        <div>
          <h1 className="serif" style={{ fontSize: 32, fontWeight: 500 }}>
            Session schedule
          </h1>
          <p>All consulting sessions across clients.</p>
        </div>
        <button className="btn primary" onClick={() => onOpenScheduleSession()}>
          <Icon name="plus" /> Schedule session
        </button>
      </div>

      <div className="grid g-dash">
        <div className="stack">
          <div className="card">
            <div className="card-head">
              <h3>Upcoming</h3>
              <span className="badge b-brand">{upcoming.length}</span>
            </div>
            {upcoming.length > 0 ? (
              upcoming.map(({ client: cl, session: s }) => {
                const dateObj = D(s.date);
                return (
                  <div key={s.id || s.sessionId} className="li">
                    <div className="datebox">
                      <b>{dateObj.getDate()}</b>
                      <span>{MON[dateObj.getMonth()]}</span>
                    </div>
                    <div className="grow">
                      <div className="ttl">{s.title}</div>
                      <div className="sub">
                        {cl.company} · {s.time || ''} · {s.mode}
                      </div>
                    </div>
                    <button
                      className="btn sm"
                      onClick={() => onOpenScheduleSession(cl.id, s)}
                    >
                      Edit
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="small muted">Nothing scheduled.</div>
            )}
          </div>

          <div className="card">
            <div className="card-head">
              <h3>Recently summarised</h3>
            </div>
            {recentlySummarised.length > 0 ? (
              recentlySummarised.map(({ client: cl, session: s }) => {
                const dateObj = D(s.date);
                return (
                  <div key={s.id || s.sessionId} className="li">
                    <div className="datebox">
                      <b>{dateObj.getDate()}</b>
                      <span>{MON[dateObj.getMonth()]}</span>
                    </div>
                    <div className="grow">
                      <div className="ttl">{s.title}</div>
                      <div className="sub">
                        {cl.company} · {s.time || ''} · {s.mode}
                      </div>
                    </div>
                    <button
                      className="btn sm ghost"
                      onClick={() => onOpenScheduleSession(cl.id, s)}
                    >
                      View summary
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="small muted">No summaries yet.</div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Awaiting summary</h3>
            <span className={\`badge \${needSummary.length ? 'b-warn' : 'b-ok'}\`}>
              {needSummary.length}
            </span>
          </div>
          {needSummary.length > 0 ? (
            needSummary.map(({ client: cl, session: s }) => {
              const dateObj = D(s.date);
              return (
                <div key={s.id || s.sessionId} className="li">
                  <div className="datebox">
                    <b>{dateObj.getDate()}</b>
                    <span>{MON[dateObj.getMonth()]}</span>
                  </div>
                  <div className="grow">
                    <div className="ttl">{s.title}</div>
                    <div className="sub">
                      {cl.company} · Held {fmtS(s.date)}
                    </div>
                  </div>
                  <button
                    className="btn sm primary"
                    onClick={() => onOpenScheduleSession(cl.id, s)}
                  >
                    Write summary
                  </button>
                </div>
              );
            })
          ) : (
            <div className="small muted">Every held session has a summary.</div>
          )}
        </div>
      </div>
    </>
  );
};

// =============================================================
// 5. ADMIN FEEDBACK PAGE
// =============================================================
export const AdminFeedbackPage: React.FC = () => {
  const { clients } = usePortal();
  const clientList = Object.values(clients).filter((c) => c.status !== 'Archived');

  const allFeedback = clientList
    .flatMap((c) =>
      (c.feedback || []).map((f) => ({
        client: c,
        feedback: f,
        session: c.sessions.find((s) => s.id === f.session)
      }))
    )
    .sort((a, b) => (b.feedback.date || '').localeCompare(a.feedback.date || ''));

  return (
    <>
      <div className="pagehead">
        <div>
          <h1 className="serif" style={{ fontSize: 32, fontWeight: 500 }}>
            Feedback received
          </h1>
          <p>
            Client ratings and reviews submitted directly after transformation sessions.
          </p>
        </div>
      </div>

      <div className="card">
        {allFeedback.length > 0 ? (
          allFeedback.map((x, i) => (
            <div key={i} className="li" style={{ alignItems: 'flex-start', padding: '16px 0' }}>
              <ClientLogo client={x.client} size={36} />
              <div className="grow" style={{ marginLeft: 10 }}>
                <div className="row-between">
                  <div className="ttl" style={{ fontSize: 16 }}>
                    {x.session ? x.session.title : 'Consulting Session'}
                  </div>
                  {renderStars(x.feedback.rating)}
                </div>
                <div className="sub" style={{ marginTop: 2 }}>
                  <b>{x.client.company}</b> · {fmt(x.feedback.date || TODAY)} ·{' '}
                  <span className="badge b-brand">{x.feedback.relevance || 'Relevant'}</span>
                </div>
                {x.feedback.useful && (
                  <div className="small" style={{ marginTop: 8 }}>
                    <b>What was useful:</b> {x.feedback.useful}
                  </div>
                )}
                {x.feedback.improve && (
                  <div className="small" style={{ marginTop: 4 }}>
                    <b>Areas to improve:</b> {x.feedback.improve}
                  </div>
                )}
                {x.feedback.comments && (
                  <div className="small muted" style={{ marginTop: 4 }}>
                    "{x.feedback.comments}"
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty">
            <b>No feedback submitted yet</b>
            When clients rate a completed session, their reviews will appear here.
          </div>
        )}
      </div>
    </>
  );
};

// =============================================================
// 6. ADMIN BROADCAST / UPDATES PAGE
// =============================================================
export const AdminBroadcastPage: React.FC<{
  onOpenBroadcast: () => void;
}> = ({ onOpenBroadcast }) => {
  const { clients } = usePortal();
  const clientList = Object.values(clients).filter((c) => c.status !== 'Archived');

  const allUpdates = clientList
    .flatMap((c) => (c.updates || []).map((u) => ({ client: c, update: u })))
    .sort((a, b) => b.update.date.localeCompare(a.update.date));

  return (
    <>
      <div className="pagehead">
        <div>
          <h1 className="serif" style={{ fontSize: 32, fontWeight: 500 }}>
            Broadcast &amp; Business updates
          </h1>
          <p>Deliver announcements, directives, and recommendations to clients.</p>
        </div>
        <button className="btn primary" onClick={onOpenBroadcast}>
          <Icon name="send" /> Publish update
        </button>
      </div>

      <div className="card">
        {allUpdates.length > 0 ? (
          allUpdates.map((x, i) => (
            <div key={i} className="upd" style={{ padding: '16px 0' }}>
              <ClientLogo client={x.client} size={36} />
              <div style={{ flex: 1, minWidth: 0, marginLeft: 10 }}>
                <div className="row-between" style={{ alignItems: 'flex-start' }}>
                  <b>{x.update.title}</b>
                  <span className="badge b-brand">{x.update.type}</span>
                </div>
                <div className="tiny muted" style={{ margin: '4px 0 6px' }}>
                  {fmt(x.update.date)} · {x.update.cat} · sent to <b>{x.client.company}</b>
                </div>
                <div className="small" style={{ maxWidth: '80ch' }}>
                  {x.update.body}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty">
            <b>No updates sent yet</b>
            Publish an update to broadcast to one or all client portals.
          </div>
        )}
      </div>
    </>
  );
};
`;

fs.writeFileSync(pagesPath, content, 'utf8');
console.log('6. Updated AdminPages.tsx successfully');
