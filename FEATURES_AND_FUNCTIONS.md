# Janiuay BPLO Online Business Permit System
## Complete Features, Functions & Program Documentation

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Frontend Features](#frontend-features)
4. [Backend Features](#backend-features)
5. [User Functions](#user-functions)
6. [Admin Functions](#admin-functions)
7. [Security Features](#security-features)
8. [Database Models](#database-models)
9. [API Endpoints](#api-endpoints)

---

## System Overview

The **Janiuay BPLO Online Business Permit System** is a full-stack web application designed to digitize and streamline the business permit application process for the Municipality of Janiuay, Iloilo, Philippines. The system allows business owners to apply for permits online, track their application status, and receive notifications, while providing administrators with tools to review, approve, and manage permit applications.

**Key Goals:**
- Reduce physical visits to municipal hall
- Streamline document submission
- Provide real-time application tracking
- Automate notification system
- Ensure secure data handling

---

## Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **express-validator** for input validation
- **Multer** for file uploads
- **Helmet** for security headers
- **express-rate-limit** for rate limiting
- **Cloudinary** for file storage
- **Nodemailer** for email notifications

### Frontend
- Vanilla JavaScript (ES6+)
- Custom CSS with modern design system
- Chart.js for analytics
- SVG icons and responsive design
- Local Storage for session management

### Security
- Content Security Policy (CSP)
- MongoDB sanitization (NoSQL injection prevention)
- Rate limiting on sensitive endpoints
- HTTPS enforcement in production
- JWT token-based authentication
- Password hashing with bcrypt

---

## Frontend Features

### 1. Public Pages

#### Home Page (`index.html`)
- Hero section with call-to-action
- Business registration process overview
- Key features highlight
- Statistics display
- Frequently Asked Questions (FAQ) with accordion
- Contact information

#### About Page (`about.html`)
- Municipality information
- BPLO mission and vision
- Office location and contact details
- Team/officials information

#### Contact Page (`contact.html`)
- Contact form with validation
- Office hours and location
- Map integration
- Emergency contact information

### 2. Authentication Pages

#### Login Page (`login.html`)
- Email and password authentication
- "Remember me" functionality
- Password visibility toggle
- Form validation with error messages
- Link to registration and forgot password
- **Security:** Rate limited, input sanitized

#### Registration Page (`register.html`)
- Multi-field registration form:
  - First name, Last name
  - Email address (with validation)
  - Password (with strength requirements)
  - Phone number (Philippine format: 09XXXXXXXXX)
  - Barangay selection (60 Janiuay barangays)
- Password strength indicator
- Terms and conditions acceptance
- Email verification welcome email
- **Validation:** Password must contain uppercase, lowercase, number, and special character

### 3. User Dashboard Pages

#### User Dashboard (`dashboard.html`)
**Features:**
- Welcome section with user name
- Quick stats cards:
  - Total Applications
  - Pending Review
  - Approved
  - Rejected
- Recent applications list
- Document checklist with interactive checkboxes
- Recent activity timeline
- **New:** Business Permit Guide section with requirements and processing steps
- **New:** Contact information section
- Apply for New Business Permit CTA button
- Notification system integration

#### Permit Application Page (`permit-application.html`)
**Multi-step Wizard Form:**

**Step 1: Business Information**
- Business name
- Business type (Sole Proprietorship, Partnership, Corporation, Cooperative)
- Nature of business
- Capitalization amount
- Number of employees

**Step 2: Owner Information**
- Owner name (auto-filled from profile)
- Email address
- Phone number
- Government ID type and number

**Step 3: Location**
- Complete business address
- Barangay selection (60 Janiuay barangays)
- Contact number
- Business email
- Operating hours

**Step 4: Documents**
- DTI/SEC/CDA Registration upload
- Valid Government ID upload
- E-Signature capture/upload
- Lease Contract or Land Title upload
- Barangay Clearance upload
- Cedula (CTC) upload
- Additional documents

**Step 5: Review & Submit**
- Complete application summary
- Document preview
- Terms acceptance
- Final submission

**Features:**
- Form auto-save (localStorage)
- Progress indicator
- Step validation
- Document preview
- File type validation
- File size limits

#### Profile Page (`profile.html`)
- View personal information
- Edit profile details
- Change password
- View application history
- Notification preferences

### 4. Admin Pages

#### Admin Dashboard (`admin-demo.html`, `admin-dashboard.html`)
**Overview Tab:**
- Key statistics cards:
  - Total Registered Users
  - Approved Permits
  - Pending Review
  - Rejected Applications
- Charts and analytics:
  - Applications by Status (pie chart)
  - Monthly application trends (line chart)
  - Revenue statistics
- Recent activity feed
- Quick action buttons

**Permits Tab:**
- Permit management table
- Status filtering (Draft, Submitted, Under Review, Approved, Rejected, Paid, Issued)
- Search functionality
- Bulk actions
- Pagination

**Users Tab:**
- User management interface
- View registered users
- User role management

**Analytics Tab:**
- Detailed statistics
- Export reports
- Custom date range filtering

#### Permit Management Page (`admin-permits.html`)
**Features:**
- Permit applications table with:
  - Application ID
  - Business Name
  - Owner name
  - Current Status
  - Documents status
  - Submission date
  - Action buttons

**Permit Detail Modal:**
- Complete business information
- Owner details
- Location information
- Application status timeline
- Document list with status
- Document preview (images and PDFs)
- Document approval/rejection with remarks
- Permit approval/rejection actions
- Assessment setting
- Remarks input

**Document Review Features:**
- Document preview modal
- Approve/Reject individual documents
- Add rejection remarks
- View document metadata (file size, upload date)
- Status badges for each document

---

## Backend Features

### 1. Authentication System (`/api/auth`)

**Endpoints:**
- `POST /api/auth/register` - User registration with validation
- `POST /api/auth/login` - User login with JWT token generation
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password

**Features:**
- Password hashing with bcrypt (10 salt rounds)
- JWT token generation (24-hour expiry)
- Input validation with express-validator
- Duplicate email detection
- Welcome email on registration

### 2. Permit Management System (`/api/permits`)

**Endpoints:**
- `GET /api/permits` - Get user's permits (paginated)
- `GET /api/permits/:id` - Get single permit details
- `POST /api/permits` - Create new permit application
- `PUT /api/permits/:id` - Update permit details
- `POST /api/permits/:id/documents` - Upload documents
- `POST /api/permits/:id/submit` - Submit application for review
- `PUT /api/permits/:id/documents/:docId/review` - Review document (admin)
- `PUT /api/permits/:id/status` - Update permit status (admin)
- `POST /api/permits/:id/assess` - Set permit assessment (admin)

**Features:**
- Multi-step permit creation
- Document upload with Multer
- Cloudinary integration for file storage
- Email notifications on status changes
- Document review workflow
- Status tracking (Draft → Submitted → Under Review → Approved/Rejected → Paid → Issued)

### 3. Admin System (`/api/admin`)

**Endpoints:**
- `GET /api/admin/dashboard` - Get admin statistics
- `GET /api/admin/permits` - Get all permits (admin view)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role

**Features:**
- Role-based access control
- Admin-only endpoints
- Statistics aggregation
- User management

### 4. Chatbot System (`/api/chatbot`)

**Endpoints:**
- `POST /api/chatbot/message` - Process chatbot messages
- `GET /api/chatbot/suggestions` - Get suggested questions

**Features:**
- AI-powered responses using OpenAI API
- Context-aware conversations
- Quick reply suggestions
- Voice input support
- File upload handling

---

## User Functions

### Registration & Authentication
1. **Account Creation**
   - Fill registration form with personal details
   - Select barangay from 60 Janiuay options
   - Create secure password meeting requirements
   - Receive welcome email
   - Auto-login after registration

2. **Login**
   - Email and password login
   - JWT token storage in localStorage
   - Session persistence (24 hours)
   - Automatic redirect to dashboard

3. **Profile Management**
   - View personal information
   - Update profile details
   - Change password with current password verification
   - View account creation date

### Permit Application Process
1. **Start Application**
   - Click "Apply for New Business Permit" from dashboard
   - Begin 5-step wizard

2. **Fill Business Information**
   - Enter business name
   - Select business type
   - Describe nature of business
   - Enter capitalization amount
   - Specify number of employees

3. **Provide Owner Details**
   - Confirm auto-filled information
   - Select ID type and enter ID number
   - Provide e-signature

4. **Specify Location**
   - Enter complete address
   - Select barangay from dropdown
   - Provide contact details
   - Set operating hours

5. **Upload Documents**
   - Upload DTI/SEC/CDA registration
   - Upload valid government ID
   - Upload e-signature
   - Upload lease contract or land title
   - Upload barangay clearance
   - Upload cedula (CTC)
   - Upload additional documents if needed

6. **Review & Submit**
   - Review all entered information
   - Preview uploaded documents
   - Accept terms and conditions
   - Submit application

7. **Track Application**
   - View application status on dashboard
   - Check document approval status
   - Receive notifications on updates
   - View detailed permit information

### Dashboard Features
- View permit statistics
- Track application progress
- Access Business Permit Guide
- View required documents checklist
- Access contact information for assistance
- View recent activity

---

## Admin Functions

### Dashboard Overview
1. **View Statistics**
   - Total registered users
   - Total permits by status
   - Monthly trends
   - Revenue statistics

2. **Access Analytics**
   - View charts and graphs
   - Export reports
   - Filter by date range

### Permit Management
1. **View All Applications**
   - List view with sorting and filtering
   - Pagination for large datasets
   - Search by business name, owner, or ID

2. **Review Applications**
   - Open permit details modal
   - View complete business information
   - Review uploaded documents
   - Preview documents (images/PDFs)

3. **Document Review**
   - View document list with status
   - Preview individual documents
   - Approve documents
   - Reject documents with remarks
   - Track document review history

4. **Permit Actions**
   - Set assessment fees
   - Approve permits
   - Reject permits with reasons
   - Update permit status
   - Add internal remarks

### User Management
1. **View Users**
   - List all registered users
   - View user details
   - See user's permit history

2. **Manage Roles**
   - Assign admin roles
   - Revoke admin access
   - View role assignment history

---

## Security Features

### Application Security
1. **Content Security Policy (CSP)**
   - Restricts resource loading
   - Prevents XSS attacks
   - Configured for external resources (fonts, images, scripts)

2. **Rate Limiting**
   - Strict limiter: 10 requests per 15 minutes (auth endpoints)
   - Standard limiter: 100 requests per 15 minutes (general API)
   - Upload limiter: 20 requests per hour (file uploads)

3. **Input Sanitization**
   - MongoDB sanitization prevents NoSQL injection
   - Automatic removal of prohibited characters
   - Validation on all user inputs

4. **Helmet Security Headers**
   - X-Frame-Options
   - X-XSS-Protection
   - Strict-Transport-Security (HSTS)
   - Content-Type nosniff

### Authentication Security
1. **Password Requirements**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character (!@#$%^&*)

2. **JWT Implementation**
   - 24-hour token expiry
   - Secure token storage
   - Token validation on every request

3. **Session Management**
   - Automatic logout on token expiry
   - Secure local storage usage
   - Role verification on admin routes

### Data Protection
1. **Password Hashing**
   - bcrypt with 10 salt rounds
   - One-way encryption
   - Brute force protection

2. **File Upload Security**
   - File type validation
   - File size limits
   - Cloudinary secure storage
   - Unique filename generation

3. **Email Security**
   - Secure SMTP configuration
   - Template-based emails
   - Error handling without exposing details

---

## Database Models

### User Model
```javascript
{
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  phone: String (required, Philippine format),
  address: {
    barangay: String (required),
    street: String,
    city: String (default: "Janiuay"),
    province: String (default: "Iloilo")
  },
  role: String (enum: ["user", "admin"], default: "user"),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Permit Model
```javascript
{
  applicant: ObjectId (ref: "User", required),
  permitNumber: String (unique),
  status: String (enum: [
    "draft", "submitted", "under-review", 
    "approved", "rejected", "paid", "issued"
  ], default: "draft"),
  businessInfo: {
    businessName: String (required),
    businessType: String (enum: [
      "sole_proprietorship", "partnership", 
      "corporation", "cooperative"
    ]),
    businessNature: String,
    capitalization: Number,
    employees: Number,
    businessAddress: {
      barangay: String (required),
      street: String,
      city: String (default: "Janiuay"),
      province: String (default: "Iloilo")
    },
    contactNumber: String,
    email: String,
    operatingHours: String
  },
  ownerInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    idType: String,
    idNumber: String,
    signatureUrl: String
  },
  documents: [{
    docType: String (enum: [
      "dti", "id", "signature", "lease", 
      "barangay", "cedula", "other"
    ]),
    name: String,
    originalName: String,
    fileUrl: String,
    fileSize: Number,
    mimeType: String,
    status: String (enum: ["pending", "approved", "rejected"]),
    remarks: String,
    reviewedBy: ObjectId (ref: "User"),
    reviewedAt: Date,
    uploadedAt: Date
  }],
  assessment: {
    amount: Number,
    assessedBy: ObjectId (ref: "User"),
    assessedAt: Date
  },
  remarks: String,
  submittedAt: Date,
  approvedAt: Date,
  issuedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints Summary

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | User login | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/profile` | Update profile | Private |
| PUT | `/api/auth/password` | Change password | Private |

### Permits
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/permits` | Get user's permits | Private |
| GET | `/api/permits/:id` | Get permit details | Private |
| POST | `/api/permits` | Create permit | Private |
| PUT | `/api/permits/:id` | Update permit | Private |
| POST | `/api/permits/:id/documents` | Upload documents | Private |
| POST | `/api/permits/:id/submit` | Submit application | Private |
| PUT | `/api/permits/:id/status` | Update status | Admin |
| PUT | `/api/permits/:id/documents/:docId/review` | Review document | Admin |
| POST | `/api/permits/:id/assess` | Set assessment | Admin |

### Admin
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/admin/dashboard` | Get statistics | Admin |
| GET | `/api/admin/permits` | Get all permits | Admin |
| GET | `/api/admin/users` | Get all users | Admin |
| PUT | `/api/admin/users/:id/role` | Update user role | Admin |

### Chatbot
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/chatbot/message` | Send message | Public |
| GET | `/api/chatbot/suggestions` | Get suggestions | Public |

### System
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/health` | Health check | Public |

---

## Barangay List (60 Barangays of Janiuay, Iloilo)

1. Abangay
2. Agcarope
3. Aglobong
4. Aguingay
5. Anhawan
6. Aquino Nobleza East
7. Aquino Nobleza West
8. Atimonan
9. Balanac
10. Barasalon
11. Bongol
12. Cabantog
13. Calmay
14. Canawili
15. Canawillian
16. Capt. A. Tirador
17. Caranas
18. Caraudan
19. Carigangan
20. Concepcion Poblacion
21. Crispin Salazar North
22. Crispin Salazar South
23. Cunsad
24. Dabong
25. Damires
26. Damo-ong
27. Danao
28. Don T. Lutero Center
29. Don T. Lutero East
30. Don T. Lutero West Poblacion
31. Gines
32. Golgota
33. Guadalupe
34. Jibolo
35. Kuyot
36. Locsin
37. Madong
38. Manacabac
39. Mangil
40. Matag-ub
41. Monte-Magapa
42. Pangilihan
43. Panuran
44. Pararinga
45. Patong-patong
46. Quipot
47. R. Armada
48. S. M. Villa
49. San Julian
50. San Pedro
51. Santa Rita
52. Santo Tomas
53. Sarawag
54. Tambal
55. Tamu-an
56. Tiringanan
57. Tolarucan
58. Tuburan
59. Ubian
60. Yabon

---

## Business Permit Requirements (Philippines)

### Required Documents:
1. **DTI/SEC/CDA Registration** - Business name registration
2. **Barangay Business Clearance** - Local barangay clearance
3. **Community Tax Certificate (Cedula)** - Personal tax certificate
4. **Contract of Lease** or **Transfer Certificate of Title** - Property proof
5. **Sketch/Pictures** of business location (3 copies)
6. **Locational/Zoning Clearance** - Zoning compliance
7. **Certificate of Occupancy** - Building safety
8. **Building Permit** and **Electrical Inspection Certificate**
9. **Sanitary Permit** - Health department clearance
10. **Fire Safety Inspection Permit** - BFP clearance
11. **Public Liability Insurance** (for restaurants, cinemas, malls)

### Processing Steps:
1. Secure initial requirements (Application form, SEC/DTI/CDA, Lease/Title, Sketch)
2. Secure permits and clearances:
   - Barangay Business Clearance
   - Certificate of Occupancy
   - Building Permit and Electrical Inspection
   - Locational/Zoning Clearance
3. File application to BPLO
4. Procure Community Tax Certificate/Cedula
5. Assessment of fees
6. Payment at Cashier's Office
7. Fire Safety Inspection Permit
8. Temporary/Permanent Sanitary Permit
9. Release of Mayor's Permit

---

## File Structure

```
backend/
├── public/                    # Frontend files
│   ├── index.html            # Home page
│   ├── about.html            # About page
│   ├── contact.html          # Contact page
│   ├── login.html            # Login page
│   ├── register.html         # Registration page
│   ├── dashboard.html        # User dashboard
│   ├── permit-application.html # Permit wizard
│   ├── profile.html          # User profile
│   ├── admin-dashboard.html  # Admin dashboard (legacy)
│   ├── admin-demo.html       # Admin dashboard (current)
│   ├── admin-permits.html    # Permit management
│   ├── css/                  # Stylesheets
│   ├── js/                   # JavaScript files
│   └── images/               # Static images
├── routes/                   # API routes
│   ├── auth.js              # Authentication routes
│   ├── permits.js           # Permit routes
│   ├── admin.js             # Admin routes
│   └── chatbot.js           # Chatbot routes
├── models/                   # Database models
│   ├── User.js              # User model
│   ├── Permit.js            # Permit model
│   └── ...
├── middleware/               # Express middleware
│   ├── auth.js              # JWT auth middleware
│   └── upload.js            # File upload middleware
├── utils/                    # Utility functions
│   ├── emailService.js      # Email handling
│   └── liveChat.js          # Live chat utilities
├── server.js                 # Main server file
└── package.json              # Dependencies
```

---

## Contact Information

**Municipality of Janiuay, Iloilo**
- **Email:** bplo@janiuay.gov.ph
- **Phone:** (033) 123-4567
- **Office Hours:** Monday-Friday, 8:00 AM - 5:00 PM
- **Address:** Municipal Hall, Janiuay, Iloilo, Philippines

---

*Documentation Version: 1.0*
*Last Updated: April 2026*
*System: Janiuay BPLO Online Business Permit System*
