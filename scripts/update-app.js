const fs = require('fs');
const path = require('path');

const appPath = path.resolve(__dirname, '../../wegrow-clientportal-frontend/src/App.tsx');

const content = `import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { usePortal } from './context/PortalContext';
import { Shell } from './components/layout/Shell';

// Client Portal Pages
import { DashboardPage } from './components/pages/DashboardPage';
import { ActionPlanPage } from './components/pages/ActionPlanPage';
import { SessionsPage } from './components/pages/SessionsPage';
import { ReportsPage } from './components/pages/ReportsPage';
import { UpdatesPage } from './components/pages/UpdatesPage';
import { AnalyticsPage } from './components/pages/AnalyticsPage';
import { CalendarPage } from './components/pages/CalendarPage';
import { EventsPage } from './components/pages/EventsPage';
import { PhotosPage } from './components/pages/PhotosPage';
import { FeedbackPage } from './components/pages/FeedbackPage';
import { DocumentsPage } from './components/pages/DocumentsPage';
import { NotificationsPage } from './components/pages/NotificationsPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { SettingsPage } from './components/pages/SettingsPage';
import { LoginPage } from './components/pages/LoginPage';

// Admin / Consultant Pages
import {
  AdminOverviewPage,
  AdminClientsPage,
  AdminTasksPage,
  AdminSessionsPage,
  AdminFeedbackPage,
  AdminBroadcastPage
} from './components/pages/AdminPages';

// Detail & Feedback Modals
import {
  SessionModal,
  ActionModal,
  ReportModal,
  UpdateModal,
  EventModal,
  PhotoModal,
  DocumentModal,
  FeedbackModal,
  ForgotPasswordModal
} from './components/modals/DetailModals';

// Admin Modals
import {
  AddClientModal,
  AssignTaskModal,
  ScheduleSessionModal,
  UploadModal,
  BroadcastModal
} from './components/modals/AdminModals';

export const App: React.FC = () => {
  const { user, previewAs, loading } = usePortal();
  const navigate = useNavigate();

  // Modal active states
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [activeUpdateId, setActiveUpdateId] = useState<string | null>(null);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const [activeDocName, setActiveDocName] = useState<string | null>(null);
  const [feedbackSessionId, setFeedbackSessionId] = useState<string | null>(null);
  const [showForgotPw, setShowForgotPw] = useState<boolean>(false);

  // Admin Modals
  const [showAddClient, setShowAddClient] = useState<boolean>(false);
  const [assignTaskState, setAssignTaskState] = useState<{
    open: boolean;
    clientId?: string | null;
    month?: number;
    action?: any;
  }>({ open: false });

  const [scheduleSessionState, setScheduleSessionState] = useState<{
    open: boolean;
    clientId?: string | null;
    session?: any;
  }>({ open: false });

  const [uploadState, setUploadState] = useState<{
    open: boolean;
    clientId?: string | null;
  }>({ open: false });

  const [showBroadcast, setShowBroadcast] = useState<boolean>(false);

  // Smooth backward compatibility: automatically redirect legacy hash URLs (/#/feedback -> /feedback)
  useEffect(() => {
    if (window.location.hash.startsWith('#/')) {
      const path = window.location.hash.replace(/^#\\/?/, '/');
      window.location.hash = '';
      navigate(path, { replace: true });
    }
  }, [navigate]);

  if (loading && !user) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="serif" style={{ fontSize: 26, marginBottom: 8 }}>WeGrow Client Portal</div>
          <div className="small muted">Connecting to database...</div>
        </div>
      </div>
    );
  }

  // Not logged in: route to login
  if (!user) {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <>
              <LoginPage onForgotPw={() => setShowForgotPw(true)} />
              {showForgotPw && (
                <ForgotPasswordModal onClose={() => setShowForgotPw(false)} />
              )}
            </>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const navigateTo = (path: string) => {
    navigate(path.startsWith('/') ? path : \`/\${path}\`);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <Shell
        onOpenAddClient={() => setShowAddClient(true)}
        onOpenAssignTask={(cid) => setAssignTaskState({ open: true, clientId: cid })}
        onOpenScheduleSession={(cid, session) =>
          setScheduleSessionState({ open: true, clientId: cid, session })
        }
        onOpenUpload={(cid) => setUploadState({ open: true, clientId: cid })}
        onOpenBroadcast={() => setShowBroadcast(true)}
      >
        <Routes>
          {/* Default redirect */}
          <Route
            path="/"
            element={<Navigate to={user.role === 'admin' && !previewAs ? '/admin' : '/dashboard'} replace />}
          />
          <Route
            path="/login"
            element={<Navigate to={user.role === 'admin' && !previewAs ? '/admin' : '/dashboard'} replace />}
          />

          {/* Client Portal routes */}
          <Route
            path="/dashboard"
            element={
              <DashboardPage
                onNavigate={navigateTo}
                onOpenAction={(id) => setActiveActionId(id)}
                onOpenSession={(id) => setActiveSessionId(id)}
                onOpenUpdate={(id) => setActiveUpdateId(id)}
                onOpenEvent={(id) => setActiveEventId(id)}
                onOpenPhoto={(id) => setActivePhotoId(id)}
                onGiveFeedback={(id) => setFeedbackSessionId(id)}
              />
            }
          />
          <Route
            path="/action-plan"
            element={
              <ActionPlanPage
                onOpenAction={(id) => setActiveActionId(id)}
                onNavigate={navigateTo}
              />
            }
          />
          <Route
            path="/sessions"
            element={
              <SessionsPage
                onOpenSession={(id) => setActiveSessionId(id)}
                onGiveFeedback={(id) => setFeedbackSessionId(id)}
              />
            }
          />
          <Route
            path="/reports"
            element={<ReportsPage onOpenReport={(id) => setActiveReportId(id)} />}
          />
          <Route
            path="/updates"
            element={<UpdatesPage onOpenUpdate={(id) => setActiveUpdateId(id)} />}
          />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route
            path="/calendar"
            element={
              <CalendarPage
                onOpenSession={(id) => setActiveSessionId(id)}
                onOpenAction={(id) => setActiveActionId(id)}
                onOpenEvent={(id) => setActiveEventId(id)}
              />
            }
          />
          <Route
            path="/events"
            element={<EventsPage onOpenEvent={(id) => setActiveEventId(id)} />}
          />
          <Route
            path="/photos"
            element={<PhotosPage onOpenPhoto={(id) => setActivePhotoId(id)} />}
          />
          <Route
            path="/feedback"
            element={<FeedbackPage onGiveFeedback={(id) => setFeedbackSessionId(id)} />}
          />
          <Route
            path="/documents"
            element={<DocumentsPage onViewDoc={(name) => setActiveDocName(name)} />}
          />
          <Route
            path="/notifications"
            element={<NotificationsPage onNavigate={navigateTo} />}
          />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Admin routes (Screenshots 1, 2, 4, 5) */}
          <Route
            path="/admin"
            element={
              <AdminOverviewPage
                onNavigate={(page) => navigateTo(\`admin/\${page}\`)}
                onOpenAddClient={() => setShowAddClient(true)}
                onOpenAssignTask={(clientId, month, action) =>
                  setAssignTaskState({ open: true, clientId, month, action })
                }
                onOpenScheduleSession={(clientId, session) =>
                  setScheduleSessionState({ open: true, clientId, session })
                }
                onOpenUpload={(clientId) => setUploadState({ open: true, clientId })}
                onOpenBroadcast={() => setShowBroadcast(true)}
              />
            }
          />
          <Route
            path="/admin/clients"
            element={
              <AdminClientsPage
                onNavigate={navigateTo}
                onOpenAddClient={() => setShowAddClient(true)}
              />
            }
          />
          <Route
            path="/admin/tasks"
            element={
              <AdminTasksPage
                onOpenAssignTask={(clientId, month, action) =>
                  setAssignTaskState({ open: true, clientId, month, action })
                }
              />
            }
          />
          <Route
            path="/admin/sessions"
            element={
              <AdminSessionsPage
                onOpenScheduleSession={(clientId, session) =>
                  setScheduleSessionState({ open: true, clientId, session })
                }
              />
            }
          />
          <Route path="/admin/feedback" element={<AdminFeedbackPage />} />
          <Route
            path="/admin/broadcast"
            element={<AdminBroadcastPage onOpenBroadcast={() => setShowBroadcast(true)} />}
          />

          {/* Fallback */}
          <Route
            path="*"
            element={<Navigate to={user.role === 'admin' && !previewAs ? '/admin' : '/dashboard'} replace />}
          />
        </Routes>
      </Shell>

      {/* Detail / Feedback Modals */}
      {activeSessionId && (
        <SessionModal
          sessionId={activeSessionId}
          onClose={() => setActiveSessionId(null)}
          onGiveFeedback={(id) => setFeedbackSessionId(id)}
        />
      )}

      {activeActionId && (
        <ActionModal
          actionId={activeActionId}
          onClose={() => setActiveActionId(null)}
        />
      )}

      {activeReportId && (
        <ReportModal
          reportId={activeReportId}
          onClose={() => setActiveReportId(null)}
        />
      )}

      {activeUpdateId && (
        <UpdateModal
          updateId={activeUpdateId}
          onClose={() => setActiveUpdateId(null)}
          onNavigate={navigateTo}
        />
      )}

      {activeEventId && (
        <EventModal
          eventId={activeEventId}
          onClose={() => setActiveEventId(null)}
        />
      )}

      {activePhotoId && (
        <PhotoModal
          photoId={activePhotoId}
          onClose={() => setActivePhotoId(null)}
        />
      )}

      {activeDocName && (
        <DocumentModal
          docName={activeDocName}
          onClose={() => setActiveDocName(null)}
        />
      )}

      {feedbackSessionId && (
        <FeedbackModal
          sessionId={feedbackSessionId}
          onClose={() => setFeedbackSessionId(null)}
        />
      )}

      {/* Admin Modals */}
      {showAddClient && (
        <AddClientModal
          onClose={() => setShowAddClient(false)}
          onSuccess={() => {
            setShowAddClient(false);
            navigateTo('/admin/clients');
          }}
        />
      )}

      {assignTaskState.open && (
        <AssignTaskModal
          initialClientId={assignTaskState.clientId}
          initialMonth={assignTaskState.month}
          initialAction={assignTaskState.action}
          onClose={() => setAssignTaskState({ open: false })}
          onSuccess={() => setAssignTaskState({ open: false })}
        />
      )}

      {scheduleSessionState.open && (
        <ScheduleSessionModal
          initialClientId={scheduleSessionState.clientId}
          initialSession={scheduleSessionState.session}
          onClose={() => setScheduleSessionState({ open: false })}
          onSuccess={() => setScheduleSessionState({ open: false })}
        />
      )}

      {uploadState.open && (
        <UploadModal
          initialClientId={uploadState.clientId}
          onClose={() => setUploadState({ open: false })}
          onSuccess={() => setUploadState({ open: false })}
        />
      )}

      {showBroadcast && (
        <BroadcastModal
          onClose={() => setShowBroadcast(false)}
          onSuccess={() => setShowBroadcast(false)}
        />
      )}
    </>
  );
};
`;

fs.writeFileSync(appPath, content, 'utf8');
console.log('8. Updated App.tsx successfully');
