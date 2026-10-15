import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { SEED_CLIENTS, TODAY } from './seed-data';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wegrow_portal';

async function seed() {
  console.log(`Connecting to MongoDB at: ${mongoUri}...`);
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB successfully.');

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection failed');
  }

  // Clear existing collections
  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    console.log(`Dropping collection: ${col.name}`);
    await db.dropCollection(col.name);
  }

  // 1. Seed Users
  const usersCollection = db.collection('users');
  await usersCollection.insertMany([
    {
      email: 'arjun@meridianfoods.in',
      passwordHash: 'demo123',
      clientId: 'C001',
      role: 'client',
      name: 'Arjun Mehta',
      title: 'Managing Director',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      email: 'lakshmi@kaveritextiles.in',
      passwordHash: 'demo123',
      clientId: 'C002',
      role: 'client',
      name: 'Lakshmi Sundar',
      title: 'Chief Executive',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      email: 'admin@wegrow.in',
      passwordHash: 'admin123',
      clientId: null,
      role: 'admin',
      name: 'Dr. Thavabalan',
      title: 'Lead Consultant, WeGrow',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  console.log('Seeded users.');

  // 2. Seed Clients
  const clientsCollection = db.collection('clients');
  await clientsCollection.insertMany(
    SEED_CLIENTS.map((c) => ({
      ...c,
      createdAt: new Date(),
      updatedAt: new Date()
    }))
  );
  console.log('Seeded clients.');

  // 3. Seed Actions, Sessions, Reports, Updates, Events, Photos, Documents, Notifications
  const actionsCollection = db.collection('actionitems');
  const sessionsCollection = db.collection('sessions');
  const reportsCollection = db.collection('reports');
  const updatesCollection = db.collection('businessupdates');
  const eventsCollection = db.collection('clientevents');
  const photosCollection = db.collection('clientphotos');
  const documentsCollection = db.collection('documentitems');
  const notificationsCollection = db.collection('notificationitems');
  const feedbackCollection = db.collection('sessionfeedbacks');

  // Common Events (Cross-client)
  await eventsCollection.insertMany([
    {
      eventId: 'E1',
      title: 'Business Growth Workshop',
      type: 'Workshops',
      date: '2026-12-19',
      time: '10:00 AM – 1:00 PM',
      loc: 'WeGrow Business Centre, Chennai',
      desc: 'A half-day, hands-on workshop on building a repeatable growth engine for mid-sized businesses.',
      agenda: ['Growth diagnostics', 'Pricing for margin', 'Building a pipeline rhythm', 'Peer roundtable'],
      speakers: ['Dr. Thavabalan — Lead Consultant', 'Priya Raman — Growth Practice'],
      participants: 'Leadership teams from WeGrow client companies',
      seats: 40,
      hue: 265,
      registeredClientIds: ['C001']
    },
    {
      eventId: 'E2',
      title: 'CXO Networking Evening',
      type: 'Networking Events',
      date: '2027-01-09',
      time: '6:30 PM – 9:00 PM',
      loc: 'The Park, Chennai',
      desc: 'An informal evening for founders and CXOs across the WeGrow network.',
      agenda: ['Welcome', 'Fireside chat: scaling past ₹100 Cr', 'Networking dinner'],
      speakers: ['Guest founder panel'],
      participants: 'Founders and CXOs',
      seats: 80,
      hue: 185,
      registeredClientIds: []
    },
    {
      eventId: 'E3',
      title: 'Supervisor Leadership Training',
      type: 'Training Programs',
      date: '2027-01-23',
      time: '9:30 AM – 5:00 PM',
      loc: 'WeGrow Campus, Coimbatore',
      desc: 'A one-day programme for supervisors on coaching, feedback and running daily huddles.',
      agenda: ['Coaching basics', 'Running a 10-minute huddle', 'Giving feedback', 'Practice labs'],
      speakers: ['Meena Krishnan — People Practice'],
      participants: 'Supervisors and team leads',
      seats: 30,
      hue: 30,
      registeredClientIds: []
    }
  ]);

  for (const client of SEED_CLIENTS) {
    const cid = client.clientId;

    // Action items
    await actionsCollection.insertMany([
      {
        clientId: cid,
        actionId: 'A1',
        month: 1,
        title: 'Complete business assessment',
        desc: 'Structured interviews with leadership and a review of the last 24 months of financials and operations.',
        priority: 'High',
        owner: client.people.ceo,
        due: '2026-10-10',
        status: 'Completed',
        progress: 100,
        comments: [{ by: client.consultant, date: '2026-10-06', text: 'Assessment signed off. Excellent participation from all heads.' }],
        attachments: ['Business_Assessment_Report.pdf']
      },
      {
        clientId: cid,
        actionId: 'A2',
        month: 1,
        title: 'Document current processes',
        desc: 'Map the as-is flow for order-to-cash, procurement and production planning.',
        priority: 'High',
        owner: client.people.ops,
        due: '2026-10-18',
        status: 'Completed',
        progress: 100,
        comments: [],
        attachments: ['As-Is_Process_Maps.pdf']
      },
      {
        clientId: cid,
        actionId: 'A3',
        month: 2,
        title: 'Build SOP framework',
        desc: 'Agree the SOP template, numbering and approval workflow.',
        priority: 'High',
        owner: client.people.ops,
        due: '2026-11-08',
        status: 'Completed',
        progress: 100,
        comments: [],
        attachments: []
      },
      {
        clientId: cid,
        actionId: 'A4',
        month: 3,
        title: 'Role charters for department heads',
        desc: 'One-page charter per role: purpose, decisions owned, KPIs.',
        priority: 'High',
        owner: client.people.hr,
        due: '2026-12-12',
        status: 'In Progress',
        progress: 70,
        comments: [{ by: client.consultant, date: '2026-12-08', text: '5 of 7 charters signed. Sales and Stores pending.' }],
        attachments: ['Role_Charter_Template.docx']
      },
      {
        clientId: cid,
        actionId: 'A5',
        month: 3,
        title: 'Revise reporting lines',
        desc: 'Flatten the stores and logistics reporting to one manager.',
        priority: 'Medium',
        owner: client.people.ceo,
        due: '2026-12-10',
        status: 'Delayed',
        progress: 40,
        comments: [{ by: client.consultant, date: '2026-12-06', text: 'Waiting on board approval — moved to steering meeting.' }],
        attachments: []
      }
    ]);

    // Sessions
    await sessionsCollection.insertMany([
      {
        clientId: cid,
        sessionId: 'S1',
        date: '2026-10-06',
        title: 'Kick-off & Business Assessment',
        mode: 'In person',
        duration: 120,
        time: '10:00 AM – 12:00 PM',
        location: `${client.company}, ${client.city}`,
        consultant: client.consultant,
        agenda: ['Align on goals, map stakeholders and launch the assessment.'],
        objectives: ['Complete baseline review'],
        status: 'Completed',
        summary: {
          participants: [`${client.company} management team`, 'WeGrow consulting team'],
          discussions: ['Business goals for next 18 months', 'Current org structure and decision rights'],
          findings: ['Decision-making is concentrated with the MD, slowing approvals.', 'No single view of operational performance exists.'],
          decisions: ['Assessment to cover all departments', 'Weekly 15-minute check-in with the MD'],
          next: ['Complete leadership interviews by 9 Oct', 'Share 24 months of financials']
        },
        attachments: ['Session_1_Deck.pdf']
      },
      {
        clientId: cid,
        sessionId: 'S2',
        date: '2026-12-16',
        title: 'Steering Committee — Month 3',
        mode: 'Online',
        duration: 90,
        time: '10:00 AM – 11:30 AM',
        location: 'Google Meet',
        link: 'https://meet.google.com/wegrow-demo',
        consultant: client.consultant,
        agenda: ['Board-level review of progress and reporting-line decision.', 'Review of open action items', 'Decisions and next steps'],
        objectives: ['Approve reporting line revisions'],
        status: 'Upcoming',
        summary: null,
        attachments: ['Pre-read.pdf']
      }
    ]);

    // Reports
    await reportsCollection.insertMany([
      {
        clientId: cid,
        reportId: 'R1',
        name: 'Business Assessment Report',
        cat: 'Business Assessment',
        date: '2026-10-14',
        desc: 'Baseline findings across six departments, with 18 prioritised gaps.',
        pages: 42
      },
      {
        clientId: cid,
        reportId: 'R2',
        name: 'November Monthly Report',
        cat: 'Monthly Reports',
        date: '2026-12-02',
        desc: 'SOP rollout, process ownership and KPI movement.',
        pages: 14
      }
    ]);

    // Updates
    await updatesCollection.insertMany([
      {
        clientId: cid,
        updateId: 'U1',
        title: 'SOP implementation phase has started',
        body: 'Batch 1 SOPs are now live on the production floor. Supervisors have received one-page quick guides.',
        date: '2026-12-12',
        cat: 'Operations',
        type: 'Milestone'
      },
      {
        clientId: cid,
        updateId: 'U2',
        title: 'Reporting-line decision needed before 16 Dec',
        body: 'The proposed change to stores and logistics reporting needs board approval. Please bring a decision to the steering committee.',
        date: '2026-12-10',
        cat: 'People',
        type: 'Action Required'
      }
    ]);

    // Photos
    await photosCollection.insertMany([
      {
        clientId: cid,
        photoId: 'P1',
        cat: 'Workshops',
        title: 'Process Mapping Workshop',
        date: '2026-10-20',
        desc: 'Department heads mapping order-to-cash on the wall.',
        hue: 265,
        seed: 3
      },
      {
        clientId: cid,
        photoId: 'P2',
        cat: 'Consulting Sessions',
        title: 'Kick-off Session',
        date: '2026-10-06',
        desc: 'Leadership team and WeGrow consultants at kick-off.',
        hue: 210,
        seed: 7
      }
    ]);

    // Documents
    await documentsCollection.insertMany([
      {
        clientId: cid,
        docId: 'D1',
        name: 'Consulting_Agreement_2026.pdf',
        cat: 'Agreements',
        date: '2026-09-24',
        by: 'WeGrow Admin',
        type: 'pdf',
        size: '380 KB'
      },
      {
        clientId: cid,
        docId: 'D2',
        name: '6-Month_Action_Plan.pdf',
        cat: 'Action Plans',
        date: '2026-10-02',
        by: client.consultant,
        type: 'pdf',
        size: '1.2 MB'
      }
    ]);

    // Notifications
    await notificationsCollection.insertMany([
      {
        clientId: cid,
        notifId: 'N1',
        cat: 'Sessions',
        text: 'Your steering committee session is in 2 days (16 Dec).',
        date: '2026-12-14',
        read: false,
        link: '#/sessions'
      },
      {
        clientId: cid,
        notifId: 'N2',
        cat: 'Action Plan',
        text: '"Role charters for department heads" was due on 12 Dec.',
        date: '2026-12-13',
        read: false,
        link: '#/action-plan'
      }
    ]);

    // Feedback
    await feedbackCollection.insertMany([
      {
        clientId: cid,
        session: 'S1',
        rating: 5,
        useful: 'Clear framing of the engagement and honest assessment scope.',
        relevance: 'Very Relevant',
        improve: '',
        comments: 'Great start.',
        date: '2026-10-06'
      }
    ]);
  }

  console.log('Database seeding successfully finished!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
