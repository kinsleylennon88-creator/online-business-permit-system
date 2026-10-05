/**
 * Sample Test Data Generator
 * This script creates sample permit data with document images for testing the admin dashboard
 * Run this in browser console when logged in as kk@gmail.com
 */

const samplePermitData = {
    businessInfo: {
        businessName: "KK Sari-Sari Store",
        businessType: "sole_proprietorship",
        businessNature: "Retail - Convenience Store",
        capitalization: 50000,
        employees: 2,
        businessAddress: {
            barangay: "Poblacion",
            street: "123 Rizal Street",
            city: "Janiuay",
            province: "Iloilo"
        },
        contactNumber: "09123456789",
        email: "kk@gmail.com",
        operatingHours: "6:00 AM - 9:00 PM"
    },
    ownerInfo: {
        firstName: "Kristian",
        lastName: "Klein",
        email: "kk@gmail.com",
        phone: "09123456789",
        idType: "Philippine Passport",
        idNumber: "P12345678"
    },
    documents: [
        {
            docType: "dti",
            name: "DTI_Business_Name_Registration.pdf",
            originalName: "DTI_Registration.pdf",
            fileUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80",
            fileSize: 2457600,
            mimeType: "application/pdf",
            status: "pending",
            uploadedAt: new Date().toISOString()
        },
        {
            docType: "id",
            name: "Passport_ID.jpg",
            originalName: "philippine_passport.jpg",
            fileUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
            fileSize: 1536000,
            mimeType: "image/jpeg",
            status: "approved",
            uploadedAt: new Date().toISOString(),
            reviewedBy: null,
            reviewedAt: null,
            remarks: "ID is clear and valid"
        },
        {
            docType: "barangay",
            name: "Barangay_Clearance.jpg",
            originalName: "barangay_clearance_2024.jpg",
            fileUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
            fileSize: 1024000,
            mimeType: "image/jpeg",
            status: "pending",
            uploadedAt: new Date().toISOString()
        },
        {
            docType: "cedula",
            name: "Community_Tax_Certificate.jpg",
            originalName: "cedula_2024.jpg",
            fileUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80",
            fileSize: 819200,
            mimeType: "image/jpeg",
            status: "pending",
            uploadedAt: new Date().toISOString()
        },
        {
            docType: "lease",
            name: "Lease_Contract.pdf",
            originalName: "lease_contract_store.pdf",
            fileUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
            fileSize: 3072000,
            mimeType: "application/pdf",
            status: "rejected",
            uploadedAt: new Date().toISOString(),
            remarks: "Lease contract needs landlord's signature"
        }
    ],
    status: "under-review",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
    permitNumber: "BPLO-2026-00123",
    remarks: "Pending barangay verification"
};

// Sample profile picture for kk@gmail.com
const sampleProfilePicture = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop";

// Sample Users Data - 20 Filipino business owners
const sampleUsers = [
    { firstName: "Maria", lastName: "Santos", email: "maria.santos@email.com", phone: "09123456701", barangay: "Poblacion" },
    { firstName: "Juan", lastName: "Dela Cruz", email: "juan.delacruz@email.com", phone: "09123456702", barangay: "Aquino" },
    { firstName: "Ana", lastName: "Reyes", email: "ana.reyes@email.com", phone: "09123456703", barangay: "Bucari" },
    { firstName: "Pedro", lastName: "Garcia", email: "pedro.garcia@email.com", phone: "09123456704", barangay: "San Pedro" },
    { firstName: "Luz", lastName: "Fernandez", email: "luz.fernandez@email.com", phone: "09123456705", barangay: "Poblacion" },
    { firstName: "Miguel", lastName: "Rodriguez", email: "miguel.rodriguez@email.com", phone: "09123456706", barangay: "Calinog" },
    { firstName: "Sofia", lastName: "Martinez", email: "sofia.martinez@email.com", phone: "09123456707", barangay: "Bongol" },
    { firstName: "Carlos", lastName: "Lopez", email: "carlos.lopez@email.com", phone: "09123456708", barangay: "Barasalon" },
    { firstName: "Elena", lastName: "Torres", email: "elena.torres@email.com", phone: "09123456709", barangay: "Moroboro" },
    { firstName: "Ricardo", lastName: "Aquino", email: "ricardo.aquino@email.com", phone: "09123456710", barangay: "Lubot" },
    { firstName: "Carmen", lastName: "Valdez", email: "carmen.valdez@email.com", phone: "09123456711", barangay: "Pitogo" },
    { firstName: "Jose", lastName: "Cruz", email: "jose.cruz@email.com", phone: "09123456712", barangay: "Quipot" },
    { firstName: "Teresa", lastName: "Gonzalez", email: "teresa.gonzalez@email.com", phone: "09123456713", barangay: "San Julian" },
    { firstName: "Antonio", lastName: "Bautista", email: "antonio.bautista@email.com", phone: "09123456714", barangay: "Sara" },
    { firstName: "Rosa", lastName: "Castillo", email: "rosa.castillo@email.com", phone: "09123456715", barangay: "Tambal" },
    { firstName: "Fernando", lastName: "Lim", email: "fernando.lim@email.com", phone: "09123456716", barangay: "Tibiao" },
    { firstName: "Isabel", lastName: "Navarro", email: "isabel.navarro@email.com", phone: "09123456717", barangay: "Yabon" },
    { firstName: "Daniel", lastName: "Ramos", email: "daniel.ramos@email.com", phone: "09123456718", barangay: "Zarragoza" },
    { firstName: "Patricia", lastName: "Mendoza", email: "patricia.mendoza@email.com", phone: "09123456719", barangay: "Latawan" },
    { firstName: "Roberto", lastName: "Silva", email: "roberto.silva@email.com", phone: "09123456720", barangay: "Guinobatan" }
];

/**
 * Generate sample permits for users
 */
function generateSamplePermit(user, index) {
    const businessTypes = ["Retail", "Food Service", "Agriculture", "Services", "Manufacturing"];
    const businessNames = [
        "Sari-Sari Store", "Carinderia", "Rice Trading", "Internet Cafe", "Tailoring Shop",
        "Bakery", "Hardware Store", "Beauty Salon", "Poultry Supply", "Motorcycle Parts",
        "Photo Studio", "Printing Shop", "Meat Shop", "Fruit Stand", "Loading Station"
    ];
    const barangays = ["Poblacion", "Aquino", "Bucari", "San Pedro", "Bongol", "Calinog", "Barasalon", "Moroboro", "Lubot", "Pitogo", "Quipot", "San Julian", "Sara", "Tambal", "Tibiao", "Yabon", "Zarragoza", "Latawan", "Guinobatan", "Lopez Jaena"];
    const statuses = ["pending", "under-review", "approved", "rejected", "approved"];
    
    const type = businessTypes[index % businessTypes.length];
    const name = `${user.firstName}'s ${businessNames[index % businessNames.length]}`;
    const status = statuses[index % statuses.length];
    
    return {
        _id: `user_${index}_${Date.now()}`,
        permitNumber: `BPLO-2026-${String(1000 + index).slice(1)}`,
        businessInfo: {
            businessName: name,
            businessType: "sole_proprietorship",
            businessNature: type,
            capitalization: 25000 + (index * 5000),
            employees: 1 + (index % 5),
            businessAddress: {
                barangay: barangays[index % barangays.length],
                street: `${index + 1} Main Street`,
                city: "Janiuay",
                province: "Iloilo"
            },
            contactNumber: user.phone,
            email: user.email
        },
        ownerInfo: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone
        },
        applicant: {
            _id: `user_${index}`,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        },
        documents: [
            {
                docType: "dti",
                name: "DTI_Registration.pdf",
                status: Math.random() > 0.3 ? "approved" : "pending",
                fileUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80",
                uploadedAt: new Date(Date.now() - index * 86400000).toISOString()
            },
            {
                docType: "id",
                name: "Valid_ID.jpg",
                status: Math.random() > 0.2 ? "approved" : "pending",
                fileUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
                uploadedAt: new Date(Date.now() - index * 86400000).toISOString()
            },
            {
                docType: "barangay",
                name: "Barangay_Clearance.jpg",
                status: Math.random() > 0.4 ? "approved" : "pending",
                fileUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
                uploadedAt: new Date(Date.now() - index * 86400000).toISOString()
            }
        ],
        status: status,
        createdAt: new Date(Date.now() - index * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        submittedAt: new Date(Date.now() - index * 86400000).toISOString()
    };
}

/**
 * Add sample users and their permits to localStorage
 */
function addSampleUsers(count = 20) {
    const existingUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    const existingPermits = JSON.parse(localStorage.getItem('userPermits') || '[]');
    
    const newUsers = [];
    const newPermits = [];
    
    for (let i = 0; i < Math.min(count, sampleUsers.length); i++) {
        const userData = sampleUsers[i];
        const user = {
            _id: `sample_user_${i}_${Date.now()}`,
            ...userData,
            role: "user",
            createdAt: new Date(Date.now() - i * 86400000 * 7).toISOString(),
            avatar: `https://i.pravatar.cc/150?img=${i + 1}`
        };
        newUsers.push(user);
        
        // Create a permit for this user
        const permit = generateSamplePermit(userData, i);
        permit.applicant._id = user._id;
        newPermits.push(permit);
    }
    
    // Save to localStorage
    localStorage.setItem('allUsers', JSON.stringify([...existingUsers, ...newUsers]));
    localStorage.setItem('userPermits', JSON.stringify([...existingPermits, ...newPermits]));
    
    console.log(`✅ Added ${newUsers.length} sample users with ${newPermits.length} permits!`);
    console.log("\n👥 Sample Users:");
    newUsers.forEach((u, i) => {
        console.log(`  ${i + 1}. ${u.firstName} ${u.lastName} - ${u.barangay} - ${u.email}`);
    });
    
    return { users: newUsers, permits: newPermits };
}

/**
 * Function to add sample permit to localStorage (for demo/testing)
 * This creates a mock permit that will appear in the user's dashboard
 */
function addSamplePermit() {
    // Get existing permits or create empty array
    const existingPermits = JSON.parse(localStorage.getItem('userPermits') || '[]');
    
    // Add sample permit with unique ID
    const samplePermit = {
        ...samplePermitData,
        _id: 'sample_' + Date.now(),
        applicant: {
            _id: 'user_kk',
            firstName: "Kristian",
            lastName: "Klein",
            email: "kk@gmail.com"
        }
    };
    
    existingPermits.unshift(samplePermit);
    localStorage.setItem('userPermits', JSON.stringify(existingPermits));
    
    console.log('✅ Sample permit added successfully!');
    console.log('Permit Number:', samplePermit.permitNumber);
    console.log('Business:', samplePermit.businessInfo.businessName);
    console.log('Status:', samplePermit.status);
    console.log('Documents:', samplePermit.documents.length);
    
    return samplePermit;
}

/**
 * Function to set sample profile picture for kk@gmail.com
 */
function setSampleProfilePicture() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.email === 'kk@gmail.com') {
        user.avatar = sampleProfilePicture;
        user.profilePicture = sampleProfilePicture;
        localStorage.setItem('user', JSON.stringify(user));
        console.log('✅ Sample profile picture added for kk@gmail.com');
        return true;
    }
    console.log('⚠️ Please log in as kk@gmail.com first');
    return false;
}

/**
 * Function to clear sample data
 */
function clearSampleData() {
    localStorage.removeItem('userPermits');
    localStorage.removeItem('allUsers');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    delete user.avatar;
    delete user.profilePicture;
    localStorage.setItem('user', JSON.stringify(user));
    console.log('🗑️ Sample data cleared');
}

/**
 * Display all test commands
 */
function showTestCommands() {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║           SAMPLE DATA GENERATOR FOR TESTING                  ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Available Commands:                                         ║
║                                                              ║
║  1. addSamplePermit()           - Create sample permit       ║
║  2. setSampleProfilePicture()   - Add profile picture        ║
║  3. addSampleUsers(20)          - Add 20 sample users        ║
║  4. clearSampleData()           - Remove all test data       ║
║                                                              ║
║  Sample Document Images Available:                           ║
║  • DTI Registration (PDF placeholder)                        ║
║  • Philippine Passport ID (JPG)                              ║
║  • Barangay Clearance (JPG)                                  ║
║  • Community Tax Certificate/Cedula (JPG)                    ║
║  • Lease Contract (PDF - rejected status)                    ║
║                                                              ║
║  Permit Details:                                             ║
║  • Business: KK Sari-Sari Store                             ║
║  • Location: Poblacion, Janiuay                             ║
║  • Status: Under Review                                      ║
║  • Permit #: BPLO-2026-00123                               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `);
}

// Auto-show commands when file loads
showTestCommands();

// Export for global access
window.sampleTestData = {
    addSamplePermit,
    setSampleProfilePicture,
    addSampleUsers,
    clearSampleData,
    showTestCommands,
    samplePermitData,
    sampleProfilePicture,
    sampleUsers
};
