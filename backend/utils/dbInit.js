const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Permit = require('../models/Permit');
const DocumentRequirement = require('../models/DocumentRequirement');
const AuditLog = require('../models/AuditLog');

let memoryServer = null;

/**
 * Connect to MongoDB with automatic fallback to embedded MongoMemoryServer (version 6.0.14)
 */
const connectDB = async () => {
  const defaultUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/janiuay';

  // 1. First attempt to connect to external MongoDB
  try {
    await mongoose.connect(defaultUri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000
    });
    console.log(`✅ Connected to external MongoDB (${defaultUri})`);
    await seedInitialData();
    return;
  } catch (err) {
    console.warn(`⚠️ External MongoDB (${defaultUri}) unavailable (${err.message}). Initializing embedded database engine...`);
  }

  // 2. Fallback to embedded MongoMemoryServer
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'janiuay'
      },
      binary: {
        version: '6.0.14'
      }
    });

    const memoryUri = memoryServer.getUri();
    await mongoose.connect(memoryUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`🚀 Embedded MongoDB engine active and connected (${memoryUri})`);
    await seedInitialData();
  } catch (embeddedErr) {
    console.error('❌ Failed to initialize database engine:', embeddedErr);
  }
};

/**
 * Helper to ensure accounts exist with guaranteed password match
 */
const ensureUser = async (userData) => {
  const existing = await User.findOne({ email: userData.email.toLowerCase() });
  if (existing) {
    await User.deleteOne({ _id: existing._id });
  }

  const user = new User({
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email.toLowerCase(),
    password: userData.password,
    phone: userData.phone,
    gender: userData.gender || 'prefer_not_to_say',
    address: userData.address,
    role: userData.role,
    isEmailVerified: true
  });
  await user.save();
  return user;
};

/**
 * Seed document requirements
 */
const seedDocumentRequirements = async () => {
  const count = await DocumentRequirement.countDocuments();
  if (count > 0) return;

  const requirements = [
    {
      name: 'Barangay Business Clearance',
      code: 'REQ-BRGY',
      description: 'Clearance from the Barangay Hall where the business establishment is physically located.',
      issuingAgency: 'Local Barangay Hall',
      notes: 'Must be current year valid copy',
      isRequired: true,
      applicablePermitType: 'all',
      applicableBusinessType: ['all'],
      reviewingAgency: 'applicant',
      order: 1
    },
    {
      name: 'Business Name Registration (DTI / SEC / CDA)',
      code: 'REQ-REG',
      description: 'DTI Certificate of Registration (Sole Proprietorship), SEC Articles of Incorporation (Corporation/Partnership), or CDA Registration (Cooperative).',
      issuingAgency: 'DTI / SEC / CDA',
      notes: 'Certified true copy or digital certificate',
      isRequired: true,
      applicablePermitType: 'all',
      applicableBusinessType: ['all'],
      reviewingAgency: 'applicant',
      order: 2
    },
    {
      name: 'Community Tax Certificate (Cedula)',
      code: 'REQ-CTC',
      description: 'Community Tax Certificate for the current calendar year issued by the Municipal Treasurer.',
      issuingAgency: "Municipal Treasurer's Office",
      notes: '1 clear photocopy',
      isRequired: true,
      applicablePermitType: 'all',
      applicableBusinessType: ['all'],
      reviewingAgency: 'applicant',
      order: 3
    },
    {
      name: 'Contract of Lease / Land Title / Property Consent',
      code: 'REQ-LEASE',
      description: 'Proof of right over the business location (Lease contract if renting, Land Title/Tax Declaration if owned).',
      issuingAgency: 'Property Owner / Registry of Deeds',
      notes: 'Required for physical commercial premises',
      isRequired: true,
      applicablePermitType: 'new',
      applicableBusinessType: ['all'],
      reviewingAgency: 'applicant',
      order: 4
    },
    {
      name: 'Previous Year Mayor\'s Permit & Tax Receipts',
      code: 'REQ-PREV-PERMIT',
      description: 'Official copy of the previous year\'s issued Mayor\'s Permit and official payment receipts.',
      issuingAgency: 'BPLO Janiuay',
      notes: 'Required specifically for Renewal applications',
      isRequired: true,
      applicablePermitType: 'renewal',
      applicableBusinessType: ['all'],
      reviewingAgency: 'applicant',
      order: 5
    },
    {
      name: 'Police Clearance Certificate',
      code: 'REQ-POLICE',
      description: 'Local PNP clearance certificate for business owner / representative.',
      issuingAgency: 'Philippine National Police - Janiuay Station',
      notes: '1 clear copy',
      isRequired: false,
      applicablePermitType: 'new',
      applicableBusinessType: ['all'],
      reviewingAgency: 'applicant',
      order: 6
    },
    {
      name: 'Fire Safety Inspection Certificate (FSIC)',
      code: 'REQ-FSIC',
      description: 'Clearance issued by the Bureau of Fire Protection after building fire inspection.',
      issuingAgency: 'Bureau of Fire Protection (BFP)',
      notes: 'Assigned, evaluated, and attached directly by Bureau of Fire reviewer',
      isRequired: true,
      applicablePermitType: 'all',
      applicableBusinessType: ['all'],
      reviewingAgency: 'bureau_of_fire',
      order: 7
    },
    {
      name: 'Municipal Sanitary & Health Clearance',
      code: 'REQ-SANITARY',
      description: 'Sanitary inspection permit and employee health cards issued by Municipal Health Office.',
      issuingAgency: 'Municipal Health Unit / Bureau of Sanitation',
      notes: 'Assigned, evaluated, and attached directly by Bureau of Sanitation reviewer',
      isRequired: true,
      applicablePermitType: 'all',
      applicableBusinessType: ['all'],
      reviewingAgency: 'bureau_of_sanitation',
      order: 8
    }
  ];

  await DocumentRequirement.insertMany(requirements);
  console.log('📋 Default Document Requirements initialized.');
};

/**
 * Seed initial administrative accounts, reviewers, citizens, permits, and audit logs
 */
const seedInitialData = async () => {
  try {
    // 1. Super Admin: Kerzie Candelon
    const superAdmin = await ensureUser({
      firstName: 'Kerzie',
      lastName: 'Candelon',
      email: 'kerziecandelon@gmail.com',
      password: 'admin123',
      phone: '09811568676',
      gender: 'prefer_not_to_say',
      address: {
        street: 'Municipal Hall Compound',
        barangay: 'Poblacion',
        municipality: 'Janiuay',
        province: 'Iloilo'
      },
      role: 'superadmin'
    });
    console.log(`👑 Super Admin account ready: ${superAdmin.email} / admin123`);

    // 2. Licensing Officer / Staff: Maria Officer
    const officer = await ensureUser({
      firstName: 'Maria',
      lastName: 'Officer',
      email: 'bplo.officer@janiuay.gov.ph',
      password: 'admin123',
      phone: '09811568677',
      gender: 'female',
      address: {
        street: 'BPLO Department, 1st Floor',
        barangay: 'Poblacion',
        municipality: 'Janiuay',
        province: 'Iloilo'
      },
      role: 'admin'
    });
    console.log(`👮 BPLO Staff account ready: ${officer.email} / admin123`);

    // 3. Bureau of Fire Reviewer
    const fireReviewer = await ensureUser({
      firstName: 'Captain Arthur',
      lastName: 'Valenzuela',
      email: 'fire.reviewer@janiuay.gov.ph',
      password: 'fire123',
      phone: '09811568678',
      gender: 'male',
      address: {
        street: 'BFP Janiuay Fire Station',
        barangay: 'Poblacion',
        municipality: 'Janiuay',
        province: 'Iloilo'
      },
      role: 'fire_reviewer'
    });
    console.log(`🚒 Bureau of Fire reviewer account ready: ${fireReviewer.email} / fire123`);

    // 4. Bureau of Sanitation Reviewer
    const sanitationReviewer = await ensureUser({
      firstName: 'Dr. Evelyn',
      lastName: 'Reyes',
      email: 'sanitation.reviewer@janiuay.gov.ph',
      password: 'sanitation123',
      phone: '09811568679',
      gender: 'female',
      address: {
        street: 'Municipal Health Center',
        barangay: 'Poblacion',
        municipality: 'Janiuay',
        province: 'Iloilo'
      },
      role: 'sanitation_reviewer'
    });
    console.log(`🧪 Bureau of Sanitation reviewer account ready: ${sanitationReviewer.email} / sanitation123`);

    // 5. Citizen Demo User: Juan Dela Cruz
    const citizen = await ensureUser({
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      email: 'juan.delacruz@gmail.com',
      password: 'password123',
      phone: '09171234567',
      gender: 'male',
      address: {
        street: '123 Rizal St.',
        barangay: 'Aquino',
        municipality: 'Janiuay',
        province: 'Iloilo'
      },
      role: 'user'
    });
    console.log(`👤 Citizen account ready: ${citizen.email} / password123`);

    // 6. Seed Document Requirements
    await seedDocumentRequirements();

    // 7. Seed Sample Permits
    const permitCount = await Permit.countDocuments();
    if (permitCount === 0 && citizen) {
      const year = new Date().getFullYear();

      await Permit.create([
        {
          applicant: citizen._id,
          permitType: 'new',
          trackingNumber: `TRK-${year}-10201`,
          businessIdNumber: `BIN-${year}-4011`,
          businessInfo: {
            businessName: 'Janiuay Agri-Supply & Feeds',
            businessType: 'sole_proprietorship',
            businessAddress: {
              street: 'Market St.',
              barangay: 'Poblacion',
              municipality: 'Janiuay',
              province: 'Iloilo'
            },
            businessNature: 'Agricultural & Poultry Supplies',
            capitalization: 250000,
            grossSales: 0
          },
          ownerInfo: {
            firstName: citizen.firstName,
            lastName: citizen.lastName,
            gender: 'male',
            phone: citizen.phone,
            email: citizen.email
          },
          paymentInfo: {
            paymentFrequency: 'annually',
            receiptDate: new Date(),
            amount: 3500,
            paymentStatus: 'paid'
          },
          status: 'submitted',
          appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          permitNumber: `BP-${year}-0101`,
          agencyReviews: {
            fire: {
              status: 'pending',
              remarks: 'Queued for BFP physical inspection'
            },
            sanitation: {
              status: 'pending',
              remarks: 'Queued for sanitary clearance'
            }
          },
          documents: [
            {
              docType: 'barangay',
              requirementCode: 'REQ-BRGY',
              name: 'Barangay Business Clearance',
              originalName: 'Barangay_Clearance_2026.pdf',
              fileUrl: '/uploads/documents/sample_barangay.pdf',
              fileSize: 120400,
              mimeType: 'application/pdf',
              uploadedBy: citizen._id,
              status: 'pending',
              version: 1
            },
            {
              docType: 'dti',
              requirementCode: 'REQ-REG',
              name: 'Business Name Registration (DTI / SEC / CDA)',
              originalName: 'DTI_Certificate_JaniuayAgri.pdf',
              fileUrl: '/uploads/documents/sample_dti.pdf',
              fileSize: 245000,
              mimeType: 'application/pdf',
              uploadedBy: citizen._id,
              status: 'pending',
              version: 1
            }
          ]
        },
        {
          applicant: citizen._id,
          permitType: 'renewal',
          previousPermitNumber: `BP-${year - 1}-0042`,
          trackingNumber: `TRK-${year}-10202`,
          businessIdNumber: `BIN-${year}-4012`,
          businessInfo: {
            businessName: 'Candelon General Merchandise',
            businessType: 'one_person_corporation',
            businessAddress: {
              street: 'Highway Central',
              barangay: 'Aquino',
              municipality: 'Janiuay',
              province: 'Iloilo'
            },
            businessNature: 'General Merchandise & Grocery',
            capitalization: 500000,
            grossSales: 1200000
          },
          ownerInfo: {
            firstName: citizen.firstName,
            lastName: citizen.lastName,
            gender: 'male',
            phone: citizen.phone,
            email: citizen.email
          },
          paymentInfo: {
            paymentFrequency: 'quarterly',
            receiptDate: new Date(),
            amount: 8200,
            paymentStatus: 'verified'
          },
          status: 'approved',
          appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          permitNumber: `BP-${year}-0042`,
          issuedAt: new Date(),
          agencyReviews: {
            fire: {
              status: 'approved',
              assignedReviewer: fireReviewer._id,
              reviewedAt: new Date(),
              remarks: 'FSIC compliant. Fire extinguishers verified.'
            },
            sanitation: {
              status: 'approved',
              assignedReviewer: sanitationReviewer._id,
              reviewedAt: new Date(),
              remarks: 'Health cards and sanitation standards verified.'
            }
          }
        },
        {
          applicant: citizen._id,
          permitType: 'new',
          trackingNumber: `TRK-${year}-10203`,
          businessIdNumber: `BIN-${year}-4013`,
          businessInfo: {
            businessName: 'Panaderia de Janiuay',
            businessType: 'partnership',
            businessAddress: {
              street: 'Corner Locsin St.',
              barangay: 'Gines',
              municipality: 'Janiuay',
              province: 'Iloilo'
            },
            businessNature: 'Bakery & Food Production',
            capitalization: 150000,
            grossSales: 0
          },
          ownerInfo: {
            firstName: citizen.firstName,
            lastName: citizen.lastName,
            gender: 'male',
            phone: citizen.phone,
            email: citizen.email
          },
          paymentInfo: {
            paymentFrequency: 'annually',
            receiptDate: new Date(),
            amount: 2500,
            paymentStatus: 'pending'
          },
          status: 'returned_for_correction',
          missingRequirements: ['Barangay Business Clearance'],
          adminComments: 'Please upload the 2026 renewed copy of Barangay Business Clearance.',
          appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          agencyReviews: {
            fire: {
              status: 'pending',
              remarks: 'Awaiting revised applicant documents'
            },
            sanitation: {
              status: 'correction_requested',
              remarks: 'Please provide employee health certificates'
            }
          }
        }
      ]);
      console.log('📑 Sample business permit records populated.');
    }

    // 8. Seed Initial Audit Logs
    const auditCount = await AuditLog.countDocuments();
    if (auditCount === 0) {
      await AuditLog.create([
        {
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          actor: {
            id: superAdmin._id,
            name: 'Kerzie Candelon',
            email: superAdmin.email,
            role: 'superadmin'
          },
          role: 'superadmin',
          action: 'system_initialized',
          entityType: 'system',
          result: 'success',
          details: { message: 'Business permit registry system initialized with RBAC and Agency Review routing' }
        },
        {
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          actor: {
            id: citizen._id,
            name: 'Juan Dela Cruz',
            email: citizen.email,
            role: 'user'
          },
          role: 'user',
          action: 'application_submitted',
          entityType: 'permit',
          trackingNumber: `TRK-${new Date().getFullYear()}-10201`,
          result: 'success',
          details: { permitType: 'new', businessName: 'Janiuay Agri-Supply & Feeds' }
        }
      ]);
      console.log('🛡️ Initial Audit Logs initialized.');
    }
  } catch (seedErr) {
    console.error('Error during data seeding:', seedErr);
  }
};

module.exports = { connectDB, seedInitialData };
