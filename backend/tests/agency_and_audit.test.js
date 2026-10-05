const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../server');
const User = require('../models/User');
const Permit = require('../models/Permit');
const AuditLog = require('../models/AuditLog');
const jwt = require('jsonwebtoken');

let mongoServer;
let citizenToken;
let citizenUser;
let fireToken;
let fireUser;
let sanitationToken;
let sanitationUser;
let adminToken;
let adminUser;
let testPermit;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    binary: { version: '6.0.14' }
  });
  await mongoose.disconnect();
  await mongoose.connect(mongoServer.getUri());

  // Seed Citizen
  citizenUser = await User.create({
    firstName: 'Juan',
    lastName: 'Citizen',
    email: 'citizen.test@janiuay.gov.ph',
    password: 'password123',
    phone: '09123456789',
    address: { barangay: 'Poblacion' },
    role: 'user'
  });
  citizenToken = jwt.sign({ id: citizenUser._id }, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');

  // Seed Fire Reviewer
  fireUser = await User.create({
    firstName: 'Arthur',
    lastName: 'FireChief',
    email: 'fire.test@janiuay.gov.ph',
    password: 'password123',
    phone: '09811568678',
    address: { barangay: 'Poblacion' },
    role: 'fire_reviewer'
  });
  fireToken = jwt.sign({ id: fireUser._id }, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');

  // Seed Sanitation Reviewer
  sanitationUser = await User.create({
    firstName: 'Evelyn',
    lastName: 'SanitationOfficer',
    email: 'sanitation.test@janiuay.gov.ph',
    password: 'password123',
    phone: '09811568679',
    address: { barangay: 'Poblacion' },
    role: 'sanitation_reviewer'
  });
  sanitationToken = jwt.sign({ id: sanitationUser._id }, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');

  // Seed Admin
  adminUser = await User.create({
    firstName: 'Maria',
    lastName: 'Admin',
    email: 'admin.test@janiuay.gov.ph',
    password: 'password123',
    phone: '09811568677',
    address: { barangay: 'Poblacion' },
    role: 'admin'
  });
  adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');

  // Create Submitted Permit
  testPermit = await Permit.create({
    applicant: citizenUser._id,
    permitType: 'new',
    trackingNumber: `TRK-2026-99999`,
    businessInfo: {
      businessName: 'Janiuay Test Bistro',
      businessType: 'corporation',
      businessAddress: { barangay: 'Poblacion' },
      businessNature: 'Food & Beverage',
      capitalization: 400000
    },
    ownerInfo: {
      firstName: 'Juan',
      lastName: 'Citizen',
      phone: '09123456789',
      email: 'citizen.test@janiuay.gov.ph'
    },
    status: 'submitted',
    agencyReviews: {
      fire: { status: 'pending' },
      sanitation: { status: 'pending' }
    }
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

describe('Agency Isolation & RBAC (Requirement 5 & 6)', () => {
  test('Bureau of Fire reviewer can access Fire review queue', async () => {
    const res = await request(app)
      .get('/api/agency/queue?agency=fire')
      .set('Authorization', `Bearer ${fireToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.agency).toBe('fire');
    expect(res.body.data.permits.length).toBeGreaterThan(0);
  });

  test('Bureau of Fire reviewer CANNOT access Bureau of Sanitation queue (Isolated)', async () => {
    const res = await request(app)
      .get('/api/agency/queue?agency=sanitation')
      .set('Authorization', `Bearer ${fireToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('Bureau of Sanitation reviewer CANNOT access Bureau of Fire queue (Isolated)', async () => {
    const res = await request(app)
      .get('/api/agency/queue?agency=fire')
      .set('Authorization', `Bearer ${sanitationToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('Applicant citizen CANNOT access agency queue or admin audit logs', async () => {
    const res1 = await request(app)
      .get('/api/agency/queue')
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(res1.status).toBe(403);

    const res2 = await request(app)
      .get('/api/admin/audit-logs')
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(res2.status).toBe(403);
  });

  test('Fire reviewer can record Fire review approval with notes', async () => {
    const res = await request(app)
      .put(`/api/agency/permits/${testPermit._id}/review`)
      .set('Authorization', `Bearer ${fireToken}`)
      .send({
        status: 'approved',
        remarks: 'FSIC inspection conducted. All 3 fire extinguishers in order.'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.agencyReview.status).toBe('approved');
  });

  test('Sanitation reviewer can record correction request', async () => {
    const res = await request(app)
      .put(`/api/agency/permits/${testPermit._id}/review`)
      .set('Authorization', `Bearer ${sanitationToken}`)
      .send({
        status: 'correction_requested',
        correctionReason: 'Please attach food handler health certificates for kitchen staff.'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.agencyReview.status).toBe('correction_requested');
  });
});

describe('Audit Logs & Administrative Features (Requirement 8)', () => {
  test('Admin can query audit logs with pagination and filters', async () => {
    const res = await request(app)
      .get('/api/admin/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.auditLogs)).toBe(true);
    expect(res.body.data.pagination).toBeDefined();
  });

  test('Audit log automatically records audit_log_viewed event', async () => {
    const logs = await AuditLog.find({ action: 'audit_log_viewed' });
    expect(logs.length).toBeGreaterThan(0);
  });
});
