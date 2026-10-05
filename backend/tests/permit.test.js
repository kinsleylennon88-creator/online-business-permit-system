const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../server');
const User = require('../models/User');
const Permit = require('../models/Permit');
const DocumentRequirement = require('../models/DocumentRequirement');
const jwt = require('jsonwebtoken');

let mongoServer;
let citizenToken;
let citizenUser;
let adminToken;
let adminUser;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    binary: { version: '6.0.14' }
  });
  await mongoose.disconnect();
  await mongoose.connect(mongoServer.getUri());

  // Seed Citizen
  citizenUser = await User.create({
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    email: 'test.citizen@janiuay.gov.ph',
    password: 'password123',
    phone: '09123456789',
    gender: 'male',
    address: { barangay: 'Poblacion' },
    role: 'user'
  });
  citizenToken = jwt.sign({ id: citizenUser._id }, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');

  // Seed Admin
  adminUser = await User.create({
    firstName: 'Maria',
    lastName: 'Admin',
    email: 'test.admin@janiuay.gov.ph',
    password: 'password123',
    phone: '09811568677',
    gender: 'female',
    address: { barangay: 'Poblacion' },
    role: 'admin'
  });
  adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

describe('Permit Application Options & Validation (Requirement 1, 2, 3)', () => {
  test('Creates a New Permit application with One Person Corporation and payment frequency', async () => {
    const res = await request(app)
      .post('/api/permits')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        permitType: 'new',
        businessInfo: {
          businessName: 'Janiuay Tech Solutions OPC',
          businessType: 'one_person_corporation',
          businessAddress: { barangay: 'Poblacion' },
          businessNature: 'Information Technology & BPO',
          capitalization: 500000
        },
        ownerInfo: {
          firstName: 'Juan',
          lastName: 'Dela Cruz',
          phone: '09123456789',
          email: 'test.citizen@janiuay.gov.ph',
          gender: 'male'
        },
        paymentInfo: {
          paymentFrequency: 'quarterly',
          amount: 5000
        }
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.permit.permitType).toBe('new');
    expect(res.body.data.permit.businessInfo.businessType).toBe('one_person_corporation');
    expect(res.body.data.permit.paymentInfo.paymentFrequency).toBe('quarterly');
    expect(res.body.data.permit.trackingNumber).toMatch(/^TRK-\d{4}-\d+$/);
    expect(res.body.data.permit.businessIdNumber).toMatch(/^BIN-\d{4}-\d+$/);
  });

  test('Creates a Renewal Permit and validates referenced previous permit', async () => {
    const res = await request(app)
      .post('/api/permits')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        permitType: 'renewal',
        previousPermitNumber: 'BP-2025-0042',
        businessInfo: {
          businessName: 'Janiuay Harvest Cooperative',
          businessType: 'cooperative',
          businessAddress: { barangay: 'Aquino' },
          businessNature: 'Agriculture & Farming',
          capitalization: 300000
        },
        ownerInfo: {
          firstName: 'Juan',
          lastName: 'Dela Cruz',
          phone: '09123456789',
          email: 'test.citizen@janiuay.gov.ph',
          gender: 'prefer_not_to_say'
        },
        paymentInfo: {
          paymentFrequency: 'annually'
        }
      });

    expect(res.status).toBe(201);
    expect(res.body.data.permit.permitType).toBe('renewal');
    expect(res.body.data.permit.previousPermitNumber).toBe('BP-2025-0042');
  });

  test('Fails when Renewal is submitted without previous permit reference', async () => {
    const res = await request(app)
      .post('/api/permits')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        permitType: 'renewal',
        businessInfo: {
          businessName: 'Invalid Renewal Business',
          businessType: 'sole_proprietorship',
          businessAddress: { barangay: 'Poblacion' },
          businessNature: 'Retail Trade',
          capitalization: 50000
        },
        ownerInfo: {
          firstName: 'Juan',
          lastName: 'Dela Cruz',
          phone: '09123456789',
          email: 'test.citizen@janiuay.gov.ph'
        }
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('Fails with invalid business registration type or invalid mobile number', async () => {
    const res = await request(app)
      .post('/api/permits')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        permitType: 'new',
        businessInfo: {
          businessName: 'Test Invalid',
          businessType: 'invalid_type_here',
          businessAddress: { barangay: 'Poblacion' },
          businessNature: 'Retail',
          capitalization: 50000
        },
        ownerInfo: {
          firstName: 'Juan',
          lastName: 'Dela Cruz',
          phone: '12345',
          email: 'test.citizen@janiuay.gov.ph'
        }
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
