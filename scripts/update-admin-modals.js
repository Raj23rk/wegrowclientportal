const fs = require('fs');
const path = require('path');

const modalsPath = path.resolve(__dirname, '../../wegrow-clientportal-frontend/src/components/modals/AdminModals.tsx');

const content = `import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { Icon } from '../common/Icons';
import { TODAY, addDays, fmtS } from '../../utils/date';
import { ActionPriority, ActionStatus, Session, ClientData } from '../../types';
import { api } from '../../services/api';

const ModalContainer: React.FC<{
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}> = ({ children, onClose, wide }) => (
  <div
    className="overlay"
    onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
  >
    <div className={\`modal \${wide ? 'wide' : ''}\`} role="dialog">
      {children}
    </div>
  </div>
);

// -------------------------------------------------------------
// 1. ADD CLIENT MODAL (Screenshot 3)
// -------------------------------------------------------------
export const AddClientModal: React.FC<{
  onClose: () => void;
  onSuccess?: (clientId: string) => void;
}> = ({ onClose, onSuccess }) => {
  const { addClient } = usePortal();

  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState('');
  const [location, setLocation] = useState('');
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [logoFileName, setLogoFileName] = useState('');
  const [color, setColor] = useState('#C2410C');

  const [contact, setContact] = useState('');
  const [contactTitle, setContactTitle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('client123');
  const [phone, setPhone] = useState('');

  const [start, setStart] = useState(TODAY);
  const [end, setEnd] = useState(addDays(TODAY, 181));
  const [consultant, setConsultant] = useState('Dr. Thavabalan');
  const [areasText, setAreasText] = useState(
    'People\\nProcess\\nTechnology\\nOperations\\nManagement'
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setLogoFile(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) {
      setError('Company name is required.');
      return;
    }
    if (!contact.trim()) {
      setError('Primary contact name is required.');
      return;
    }
    if (!email.trim()) {
      setError('Login email is required.');
      return;
    }
    if (!password.trim()) {
      setError('Portal password is required.');
      return;
    }
    if (end <= start) {
      setError('Consulting end date must be after the start date.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const areas = areasText
        .split('\\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const created = await addClient({
        company: company.trim(),
        industry: industry.trim() || 'Management Consulting',
        size: size.trim() || '100+ employees',
        location: location.trim() || 'Chennai, Tamil Nadu',
        logo: logoFile ? { url: logoFile, name: logoFileName } : undefined,
        color,
        contact: contact.trim(),
        contactTitle: contactTitle.trim() || 'Managing Director',
        email: email.trim().toLowerCase(),
        password: password.trim(),
        phone: phone.trim() || '+91 98765 43210',
        start,
        end,
        consultant: consultant.trim(),
        areas: areas.length ? areas : ['People', 'Process', 'Technology', 'Operations', 'Management']
      });

      setLoading(false);
      onClose();
      if (onSuccess) {
        onSuccess(created.id);
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to create client portal.');
    }
  };

  return (
    <ModalContainer onClose={onClose} wide>
      <div className="mh">
        <div>
          <div className="small muted">Creates a private portal and a 6-month plan template</div>
          <h2>Add a client</h2>
        </div>
        <button className="iconbtn" onClick={onClose} aria-label="Close">
          <Icon name="close" />
        </button>
      </div>

      <form className="mb" id="addClientForm" onSubmit={handleSubmit}>
        {error && (
          <div className="err" role="alert" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div className="fgrid">
          <div className="full fhead">Company</div>

          <div className="field">
            <label htmlFor="ac_company">
              Company name <span style={{ color: 'var(--bad)' }}>*</span>
            </label>
            <input
              className="input"
              id="ac_company"
              required
              placeholder="e.g. Apex Engineering Ltd"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="ac_industry">Industry</label>
            <input
              className="input"
              id="ac_industry"
              placeholder="e.g. Precision Manufacturing"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="ac_size">Company size</label>
            <input
              className="input"
              id="ac_size"
              placeholder="e.g. 240 employees"
              value={size}
              onChange={(e) => setSize(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="ac_location">Location</label>
            <input
              className="input"
              id="ac_location"
              placeholder="e.g. Chennai, Tamil Nadu"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Company logo</label>
            <label className="filedrop" htmlFor="ac_logo_file">
              <Icon name="paperclip" />
              <span>{logoFileName ? logoFileName : 'Choose a file'}</span>
              <input
                type="file"
                id="ac_logo_file"
                accept="image/*"
                onChange={handleLogoUpload}
              />
            </label>
            <span className="tiny muted">PNG, JPG or SVG. Square logos look best.</span>
            {logoFile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                <img
                  src={logoFile}
                  alt="Logo preview"
                  style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8, border: '1px solid var(--line)' }}
                />
                <button
                  type="button"
                  className="btn sm ghost"
                  onClick={() => {
                    setLogoFile(null);
                    setLogoFileName('');
                  }}
                >
                  Remove logo
                </button>
              </div>
            )}
          </div>

          <div className="field">
            <label htmlFor="ac_color">Brand accent colour</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input
                type="color"
                className="input"
                id="ac_color"
                style={{ width: '100%', height: 46, padding: 4 }}
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </div>

          <div className="full fhead">Primary contact &amp; portal login</div>

          <div className="field">
            <label htmlFor="ac_contact">
              Contact name <span style={{ color: 'var(--bad)' }}>*</span>
            </label>
            <input
              className="input"
              id="ac_contact"
              required
              placeholder="e.g. Rajesh Kumar"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="ac_title">Title</label>
            <input
              className="input"
              id="ac_title"
              placeholder="e.g. Managing Director"
              value={contactTitle}
              onChange={(e) => setContactTitle(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="ac_email">
              Login email <span style={{ color: 'var(--bad)' }}>*</span>
            </label>
            <input
              type="email"
              className="input"
              id="ac_email"
              required
              placeholder="e.g. rajesh@apexeng.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="ac_password">
              Portal password <span style={{ color: 'var(--bad)' }}>*</span>
            </label>
            <input
              className="input"
              id="ac_password"
              required
              placeholder="client123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="tiny muted">The client logs in with the email above and this password.</span>
          </div>

          <div className="field full">
            <label htmlFor="ac_phone">Phone</label>
            <input
              className="input"
              id="ac_phone"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="full fhead">Engagement</div>

          <div className="field">
            <label htmlFor="ac_start">
              Consulting start <span style={{ color: 'var(--bad)' }}>*</span>
            </label>
            <input
              type="date"
              className="input"
              id="ac_start"
              required
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="ac_end">
              Consulting end <span style={{ color: 'var(--bad)' }}>*</span>
            </label>
            <input
              type="date"
              className="input"
              id="ac_end"
              required
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>

          <div className="field full">
            <label htmlFor="ac_consultant">Assigned consultant</label>
            <input
              className="input"
              id="ac_consultant"
              value={consultant}
              onChange={(e) => setConsultant(e.target.value)}
            />
          </div>

          <div className="field full">
            <label htmlFor="ac_areas">Business areas in scope (one per line)</label>
            <textarea
              className="input"
              id="ac_areas"
              rows={4}
              value={areasText}
              onChange={(e) => setAreasText(e.target.value)}
            />
          </div>
        </div>
      </form>

      <div className="mf">
        <button className="btn" type="button" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button className="btn primary" type="submit" form="addClientForm" disabled={loading}>
          {loading ? 'Creating...' : 'Create client portal'}
        </button>
      </div>
    </ModalContainer>
  );
};

// -------------------------------------------------------------
// 2. ASSIGN / EDIT TASK MODAL (Screenshot 4)
// -------------------------------------------------------------
export const AssignTaskModal: React.FC<{
  initialClientId?: string | null;
  initialMonth?: number;
  initialAction?: any;
  onClose: () => void;
  onSuccess?: () => void;
}> = ({ initialClientId, initialMonth, initialAction, onClose, onSuccess }) => {
  const { clients, assignTask } = usePortal();
  const clientList = Object.values(clients);

  const [cid, setCid] = useState<string>(
    initialClientId || (clientList.length > 0 ? clientList[0].id : '')
  );
  const [month, setMonth] = useState<number>(
    initialMonth || (initialAction ? initialAction.month : 1)
  );
  const [title, setTitle] = useState(initialAction ? initialAction.title : '');
  const [desc, setDesc] = useState(initialAction ? initialAction.desc : '');
  const [owner, setOwner] = useState(initialAction ? initialAction.owner : '');
  const [due, setDue] = useState(initialAction ? initialAction.due : addDays(TODAY, 14));
  const [priority, setPriority] = useState<ActionPriority>(
    initialAction ? initialAction.priority : 'Medium'
  );
  const [status, setStatus] = useState<ActionStatus>(
    initialAction ? initialAction.status : 'Not Started'
  );
  const [progress, setProgress] = useState<number>(
    initialAction ? initialAction.progress : 0
  );
  const [note, setNote] = useState('');
  const [notify, setNotify] = useState(true);
  const [attachmentLink, setAttachmentLink] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeClient = clients[cid] || clientList[0];
  const months = activeClient?.months || [1, 2, 3, 4, 5, 6].map((n) => ({
    n,
    theme: \`Month \${n}\`,
    name: \`Month \${n}\`
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cid) {
      setError('Please select a client.');
      return;
    }
    if (!title.trim()) {
      setError('Task name is required.');
      return;
    }
    if (!owner.trim()) {
      setError('Owner / Assigned person is required.');
      return;
    }
    if (!due) {
      setError('Due date is required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const attachments = initialAction?.attachments ? [...initialAction.attachments] : [];
      if (attachmentLink.trim()) {
        attachments.push({
          name: attachmentLink.trim().split('/').pop() || 'Attached Link',
          url: attachmentLink.trim(),
          type: 'link'
        });
      }

      await assignTask(
        cid,
        {
          ...(initialAction || {}),
          month: Number(month),
          title: title.trim(),
          desc: desc.trim(),
          owner: owner.trim(),
          due,
          priority,
          status,
          progress: status === 'Completed' ? 100 : status === 'Not Started' ? 0 : progress,
          attachments
        },
        notify,
        note.trim()
      );

      setLoading(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to assign action item.');
    }
  };

  return (
    <ModalContainer onClose={onClose} wide>
      <div className="mh">
        <div>
          <div className="small muted">
            {initialAction ? 'Update existing action item' : 'Assign an action item to client leadership'}
          </div>
          <h2>{initialAction ? 'Edit action item' : 'Assign an action item'}</h2>
        </div>
        <button className="iconbtn" onClick={onClose} aria-label="Close">
          <Icon name="close" />
        </button>
      </div>

      <form className="mb" id="assignTaskForm" onSubmit={handleSubmit}>
        {error && (
          <div className="err" role="alert" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div className="fgrid">
          <div className="field">
            <label htmlFor="at_client">
              Client <span style={{ color: 'var(--bad)' }}>*</span>
            </label>
            <select
              className="input"
              id="at_client"
              value={cid}
              onChange={(e) => setCid(e.target.value)}
              disabled={!!initialClientId && !!initialAction}
            >
              {clientList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company} ({c.id})
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="at_month">Plan month</label>
            <select
              className="input"
              id="at_month"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {months.map((m) => (
                <option key={m.n} value={m.n}>
                  Month {m.n} · {m.name} — {m.theme}
                </option>
              ))}
            </select>
          </div>

          <div className="field full">
            <label htmlFor="at_title">
              Task name <span style={{ color: 'var(--bad)' }}>*</span>
            </label>
            <input
              className="input"
              id="at_title"
              required
              placeholder="e.g. Build standard operating procedure (SOP) framework"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="field full">
            <label htmlFor="at_desc">Description</label>
            <textarea
              className="input"
              id="at_desc"
              rows={3}
              placeholder="Provide context, required inputs, and expected deliverables"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="at_owner">
              Assigned to (client side) <span style={{ color: 'var(--bad)' }}>*</span>
            </label>
            <input
              className="input"
              id="at_owner"
              required
              placeholder="e.g. Operations Head / Finance Manager"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="at_due">
              Due date <span style={{ color: 'var(--bad)' }}>*</span>
            </label>
            <input
              type="date"
              className="input"
              id="at_due"
              required
              value={due}
              onChange={(e) => setDue(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="at_priority">Priority</label>
            <select
              className="input"
              id="at_priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as ActionPriority)}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="at_status">Status</label>
            <select
              className="input"
              id="at_status"
              value={status}
              onChange={(e) => {
                const newStatus = e.target.value as ActionStatus;
                setStatus(newStatus);
                if (newStatus === 'Completed') setProgress(100);
                if (newStatus === 'Not Started') setProgress(0);
              }}
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Under Review">Under Review</option>
              <option value="Completed">Completed</option>
              <option value="Delayed">Delayed</option>
            </select>
          </div>

          <div className="field full">
            <label htmlFor="at_progress">
              Progress: <b>{status === 'Completed' ? 100 : progress}%</b>
            </label>
            <input
              type="range"
              id="at_progress"
              min="0"
              max="100"
              step="5"
              value={status === 'Completed' ? 100 : progress}
              disabled={status === 'Completed'}
              onChange={(e) => setProgress(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--brand)' }}
            />
          </div>

          <div className="field full">
            <label htmlFor="at_link">Attachment link or document URL (optional)</label>
            <input
              className="input"
              id="at_link"
              placeholder="e.g. Google Drive, Dropbox, or OneDrive share link"
              value={attachmentLink}
              onChange={(e) => setAttachmentLink(e.target.value)}
            />
          </div>

          <div className="field full">
            <label htmlFor="at_note">
              {initialAction ? 'Add a consultant comment / reply' : 'Note to the client (optional)'}
            </label>
            <textarea
              className="input"
              id="at_note"
              rows={2}
              placeholder="Will be posted as a comment from WeGrow on this action item"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="field full">
            <label className="check">
              <input
                type="checkbox"
                checked={notify}
                onChange={(e) => setNotify(e.target.checked)}
              />
              Notify client via in-portal notification
            </label>
          </div>
        </div>
      </form>

      <div className="mf">
        <button className="btn" type="button" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button className="btn primary" type="submit" form="assignTaskForm" disabled={loading}>
          {loading ? 'Saving...' : initialAction ? 'Save task' : 'Assign task'}
        </button>
      </div>
    </ModalContainer>
  );
};

// -------------------------------------------------------------
// 3. SCHEDULE / EDIT SESSION MODAL (Screenshot 5)
// -------------------------------------------------------------
export const ScheduleSessionModal: React.FC<{
  initialClientId?: string | null;
  initialSession?: any;
  onClose: () => void;
  onSuccess?: () => void;
}> = ({ initialClientId, initialSession, onClose, onSuccess }) => {
  const { clients, scheduleSession, updateSession } = usePortal();
  const clientList = Object.values(clients);

  const [cid, setCid] = useState<string>(
    initialClientId || (clientList.length > 0 ? clientList[0].id : '')
  );
  const [title, setTitle] = useState(initialSession ? initialSession.title : '');
  const [date, setDate] = useState(initialSession ? initialSession.date : addDays(TODAY, 7));
  const [mode, setMode] = useState<'Online' | 'In person'>(
    initialSession ? initialSession.mode : 'Online'
  );
  const [start, setStart] = useState(initialSession?.start || '10:00');
  const [end, setEnd] = useState(initialSession?.end || '11:30');
  const [link, setLink] = useState(initialSession?.link || '');
  const [location, setLocation] = useState(initialSession?.location || '');
  const [consultant, setConsultant] = useState(
    initialSession?.consultant || (clients[cid]?.consultant || 'Dr. Thavabalan')
  );
  const [status, setStatus] = useState(initialSession?.status || 'Upcoming');
  const [agendaText, setAgendaText] = useState((initialSession?.agenda || []).join('\\n'));
  const [objectivesText, setObjectivesText] = useState(
    (initialSession?.objectives || []).join('\\n')
  );
  const [notes, setNotes] = useState(initialSession?.notes || '');
  const [notify, setNotify] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cid) {
      setError('Please select a client.');
      return;
    }
    if (!title.trim()) {
      setError('Session title is required.');
      return;
    }
    if (!date) {
      setError('Session date is required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const agenda = agendaText.split('\\n').map((s) => s.trim()).filter(Boolean);
      const objectives = objectivesText.split('\\n').map((s) => s.trim()).filter(Boolean);

      const payload = {
        ...(initialSession || {}),
        title: title.trim(),
        date,
        mode,
        start,
        end,
        link: link.trim(),
        location: location.trim() || (mode === 'Online' ? 'Online' : 'WeGrow Office'),
        consultant: consultant.trim(),
        status,
        agenda,
        objectives,
        notes: notes.trim()
      };

      if (initialSession) {
        await updateSession(cid, initialSession.id || initialSession.sessionId, payload);
      } else {
        await scheduleSession(cid, payload, notify);
      }

      setLoading(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to save session.');
    }
  };

  return (
    <ModalContainer onClose={onClose} wide>
      <div className="mh">
        <div>
          <div className="small muted">
            {initialSession ? 'Modify consulting session details' : 'Book a new milestone or review session'}
          </div>
          <h2>{initialSession ? 'Edit session' : 'Schedule a session'}</h2>
        </div>
        <button className="iconbtn" onClick={onClose} aria-label="Close">
          <Icon name="close" />
        </button>
      </div>

      <form className="mb" id="scheduleSessionForm" onSubmit={handleSubmit}>
        {error && (
          <div className="err" role="alert" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div className="fgrid">
          <div className="field full">
            <label htmlFor="ss_client">
              Client <span style={{ color: 'var(--bad)' }}>*</span>
            </label>
            <select
              className="input"
              id="ss_client"
              value={cid}
              onChange={(e) => setCid(e.target.value)}
              disabled={!!initialClientId && !!initialSession}
            >
              {clientList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company} ({c.id})
                </option>
              ))}
            </select>
          </div>

          <div className="field full">
            <label htmlFor="ss_title">
              Session title <span style={{ color: 'var(--bad)' }}>*</span>
            </label>
            <input
              className="input"
              id="ss_title"
              required
              placeholder="e.g. Monthly Business Review & Performance Check"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="ss_date">
              Date <span style={{ color: 'var(--bad)' }}>*</span>
            </label>
            <input
              type="date"
              className="input"
              id="ss_date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="ss_mode">Mode</label>
            <select
              className="input"
              id="ss_mode"
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
            >
              <option value="Online">Online</option>
              <option value="In person">In person</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="ss_start">Starts</label>
            <input
              type="time"
              className="input"
              id="ss_start"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="ss_end">Ends</label>
            <input
              type="time"
              className="input"
              id="ss_end"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="ss_link">Meeting link</label>
            <input
              className="input"
              id="ss_link"
              placeholder="https://meet.google.com/..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="ss_location">Location / Venue</label>
            <input
              className="input"
              id="ss_location"
              placeholder="Online or client office address"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="ss_consultant">Consultant</label>
            <input
              className="input"
              id="ss_consultant"
              value={consultant}
              onChange={(e) => setConsultant(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="ss_status">Status</label>
            <select
              className="input"
              id="ss_status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="ss_agenda">Agenda (one per line)</label>
            <textarea
              className="input"
              id="ss_agenda"
              rows={3}
              placeholder="Review KPI metrics\\nDiscuss operational bottlenecks"
              value={agendaText}
              onChange={(e) => setAgendaText(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="ss_objectives">Objectives (one per line)</label>
            <textarea
              className="input"
              id="ss_objectives"
              rows={3}
              placeholder="Lock next month action items"
              value={objectivesText}
              onChange={(e) => setObjectivesText(e.target.value)}
            />
          </div>

          <div className="field full">
            <label htmlFor="ss_notes">Notes for the client</label>
            <textarea
              className="input"
              id="ss_notes"
              rows={2}
              placeholder="e.g. Please review the pre-read and bring decisions on open items."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="field full">
            <label className="check">
              <input
                type="checkbox"
                checked={notify}
                onChange={(e) => setNotify(e.target.checked)}
              />
              Notify client in portal
            </label>
          </div>
        </div>
      </form>

      <div className="mf">
        <button className="btn" type="button" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button className="btn primary" type="submit" form="scheduleSessionForm" disabled={loading}>
          {loading ? 'Saving...' : initialSession ? 'Save session' : 'Schedule session'}
        </button>
      </div>
    </ModalContainer>
  );
};

// -------------------------------------------------------------
// 4. UPLOAD MODAL (Reports, Documents, Photos)
// -------------------------------------------------------------
export const UploadModal: React.FC<{
  initialClientId?: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}> = ({ initialClientId, onClose, onSuccess }) => {
  const { clients, showToast, refreshData } = usePortal();
  const clientList = Object.values(clients);

  const [cid, setCid] = useState<string>(
    initialClientId || (clientList.length > 0 ? clientList[0].id : '')
  );
  const [uploadType, setUploadType] = useState<'report' | 'document' | 'photo'>('report');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Business Assessment');
  const [desc, setDesc] = useState('');
  const [pages, setPages] = useState<number>(10);
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    if (!name) setName(file.name.replace(/\\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = () => {
      setFileUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cid) {
      setError('Please select a client.');
      return;
    }
    if (!name.trim()) {
      setError('Title / Name is required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (uploadType === 'report') {
        await api.admin.addReport(cid, {
          name: name.trim(),
          cat: category,
          desc: desc.trim() || 'Comprehensive transformation and business report',
          pages: Number(pages) || 12,
          date: TODAY,
          file: fileUrl ? { name: fileName, url: fileUrl } : undefined
        });
        showToast('Report uploaded');
      } else if (uploadType === 'document') {
        await api.admin.addDocument(cid, {
          name: name.trim(),
          cat: category,
          by: 'Dr. Thavabalan',
          type: fileName.split('.').pop() || 'pdf',
          size: '1.4 MB',
          date: TODAY,
          url: fileUrl || undefined
        });
        showToast('Document uploaded');
      } else {
        await api.admin.addDocument(cid, {
          name: name.trim(),
          cat: 'Photos',
          by: 'Dr. Thavabalan',
          type: 'image',
          date: TODAY,
          url: fileUrl || undefined
        });
        showToast('Photo uploaded');
      }

      await refreshData();
      setLoading(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to upload item.');
    }
  };

  return (
    <ModalContainer onClose={onClose} wide>
      <div className="mh">
        <div>
          <div className="small muted">Upload deliverable to client portal</div>
          <h2>Upload</h2>
        </div>
        <button className="iconbtn" onClick={onClose} aria-label="Close">
          <Icon name="close" />
        </button>
      </div>

      <div className="tabs" style={{ padding: '0 24px', margin: 0 }}>
        <button
          type="button"
          className={uploadType === 'report' ? 'on' : ''}
          onClick={() => {
            setUploadType('report');
            setCategory('Business Assessment');
          }}
        >
          Report
        </button>
        <button
          type="button"
          className={uploadType === 'document' ? 'on' : ''}
          onClick={() => {
            setUploadType('document');
            setCategory('SOPs');
          }}
        >
          Document
        </button>
        <button
          type="button"
          className={uploadType === 'photo' ? 'on' : ''}
          onClick={() => {
            setUploadType('photo');
            setCategory('Consulting Sessions');
          }}
        >
          Photo
        </button>
      </div>

      <form className="mb" id="uploadForm" onSubmit={handleSubmit} style={{ marginTop: 16 }}>
        {error && (
          <div className="err" role="alert" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div className="fgrid">
          <div className="field full">
            <label htmlFor="up_client">
              Client <span style={{ color: 'var(--bad)' }}>*</span>
            </label>
            <select
              className="input"
              id="up_client"
              value={cid}
              onChange={(e) => setCid(e.target.value)}
            >
              {clientList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company} ({c.id})
                </option>
              ))}
            </select>
          </div>

          <div className="field full">
            <label htmlFor="up_name">
              {uploadType === 'report' ? 'Report name' : uploadType === 'document' ? 'Document name' : 'Photo title'}{' '}
              <span style={{ color: 'var(--bad)' }}>*</span>
            </label>
            <input
              className="input"
              id="up_name"
              required
              placeholder="e.g. Month 1 Foundation & Gap Analysis Report"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="up_cat">Category</label>
            <select
              className="input"
              id="up_cat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {uploadType === 'report' ? (
                <>
                  <option value="Business Assessment">Business Assessment</option>
                  <option value="Monthly Reports">Monthly Reports</option>
                  <option value="Session Reports">Session Reports</option>
                  <option value="Performance Reports">Performance Reports</option>
                  <option value="Process Reports">Process Reports</option>
                </>
              ) : uploadType === 'document' ? (
                <>
                  <option value="SOPs">SOPs</option>
                  <option value="Action Plans">Action Plans</option>
                  <option value="Presentations">Presentations</option>
                  <option value="Consulting Documents">Consulting Documents</option>
                  <option value="Agreements">Agreements</option>
                </>
              ) : (
                <>
                  <option value="Workshops">Workshops</option>
                  <option value="Consulting Sessions">Consulting Sessions</option>
                  <option value="Business Events">Business Events</option>
                  <option value="Team Meetings">Team Meetings</option>
                </>
              )}
            </select>
          </div>

          {uploadType === 'report' && (
            <div className="field">
              <label htmlFor="up_pages">Page count</label>
              <input
                type="number"
                className="input"
                id="up_pages"
                value={pages}
                onChange={(e) => setPages(Number(e.target.value))}
              />
            </div>
          )}

          <div className="field full">
            <label>Choose file</label>
            <label className="filedrop" htmlFor="up_file">
              <Icon name="paperclip" />
              <span>{fileName || 'Choose PDF, DOCX, or Image file'}</span>
              <input type="file" id="up_file" onChange={handleFileUpload} />
            </label>
          </div>

          <div className="field full">
            <label htmlFor="up_desc">Description / Summary</label>
            <textarea
              className="input"
              id="up_desc"
              rows={2}
              placeholder="Summary of this deliverable"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
        </div>
      </form>

      <div className="mf">
        <button className="btn" type="button" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button className="btn primary" type="submit" form="uploadForm" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </ModalContainer>
  );
};

// -------------------------------------------------------------
// 5. BROADCAST / PUBLISH UPDATE MODAL
// -------------------------------------------------------------
export const BroadcastModal: React.FC<{
  onClose: () => void;
  onSuccess?: () => void;
}> = ({ onClose, onSuccess }) => {
  const { clients, publishUpdate, showToast } = usePortal();
  const clientList = Object.values(clients);

  const [selectedClients, setSelectedClients] = useState<string[]>(
    clientList.map((c) => c.id)
  );
  const [title, setTitle] = useState('');
  const [type, setType] = useState('General Update');
  const [cat, setCat] = useState('Operations');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleClient = (id: string) => {
    setSelectedClients((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedClients(clientList.map((c) => c.id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClients.length) {
      setError('Please select at least one client.');
      return;
    }
    if (!title.trim()) {
      setError('Headline is required.');
      return;
    }
    if (!body.trim()) {
      setError('Message body is required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      for (const cid of selectedClients) {
        await publishUpdate(cid, {
          title: title.trim(),
          type: type as any,
          cat,
          body: body.trim()
        });
      }

      showToast(\`Update published to \${selectedClients.length} client(s)\`);
      setLoading(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to publish update.');
    }
  };

  return (
    <ModalContainer onClose={onClose} wide>
      <div className="mh">
        <div>
          <div className="small muted">Send news, advice, and announcements</div>
          <h2>Publish a business update</h2>
        </div>
        <button className="iconbtn" onClick={onClose} aria-label="Close">
          <Icon name="close" />
        </button>
      </div>

      <form className="mb" id="broadcastForm" onSubmit={handleSubmit}>
        {error && (
          <div className="err" role="alert" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div className="fgrid">
          <div className="field full">
            <label>
              Send to clients <span style={{ color: 'var(--bad)' }}>*</span>
            </label>
            <div className="clientpick" style={{ maxHeight: 160, overflowY: 'auto' }}>
              {clientList.map((c) => (
                <label key={c.id} className="check">
                  <input
                    type="checkbox"
                    checked={selectedClients.includes(c.id)}
                    onChange={() => toggleClient(c.id)}
                  />
                  <span>
                    <b>{c.company}</b> ({c.id})
                  </span>
                </label>
              ))}
            </div>
            <button
              type="button"
              className="btn sm ghost"
              style={{ alignSelf: 'flex-start', marginTop: 6 }}
              onClick={selectAll}
            >
              Select all clients
            </button>
          </div>

          <div className="field full">
            <label htmlFor="bc_title">
              Headline <span style={{ color: 'var(--bad)' }}>*</span>
            </label>
            <input
              className="input"
              id="bc_title"
              required
              placeholder="e.g. Q4 Executive Leadership Alignment Announcement"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="bc_type">Type</label>
            <select
              className="input"
              id="bc_type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="General Update">General Update</option>
              <option value="Important Update">Important Update</option>
              <option value="Action Required">Action Required</option>
              <option value="Milestone">Milestone</option>
              <option value="Recommendation">Recommendation</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="bc_cat">Category</label>
            <select
              className="input"
              id="bc_cat"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
            >
              <option value="Operations">Operations</option>
              <option value="People">People</option>
              <option value="Process">Process</option>
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
              <option value="Performance">Performance</option>
              <option value="Consulting">Consulting</option>
              <option value="Reports">Reports</option>
            </select>
          </div>

          <div className="field full">
            <label htmlFor="bc_body">
              Message <span style={{ color: 'var(--bad)' }}>*</span>
            </label>
            <textarea
              className="input"
              id="bc_body"
              required
              rows={4}
              placeholder="Write the message text that will show up on the client's Business Updates feed..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
        </div>
      </form>

      <div className="mf">
        <button className="btn" type="button" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button className="btn primary" type="submit" form="broadcastForm" disabled={loading}>
          {loading ? 'Publishing...' : 'Publish update'}
        </button>
      </div>
    </ModalContainer>
  );
};
`;

fs.writeFileSync(modalsPath, content, 'utf8');
console.log('5. Updated AdminModals.tsx successfully');
