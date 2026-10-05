# Municipality of Janiuay - Online Business Permit System

A complete, production-ready online business permit system for the Municipality of Janiuay, Iloilo, Philippines.

## Features

- **User Portal**: Apply for business permits online with multi-step forms
- **Admin Dashboard**: Manage applications, view metrics, and monitor system health
- **AI Chatbot**: 24/7 assistance for permit-related queries
- **Secure Authentication**: JWT-based auth with Google OAuth
- **Document Management**: Cloud-based file storage with Cloudinary
- **Real-time Notifications**: Email updates for application status
- **Analytics Dashboard**: Charts and metrics for business insights
- **Mobile Responsive**: Optimized for Philippine users on mobile devices

## System Requirements & Space

### Minimum System Requirements
| Component | Specification |
|-----------|--------------|
| **Operating System** | Windows 10/11, macOS 10.15+, Ubuntu 20.04+ |
| **Node.js** | v18.0.0 or higher |
| **npm** | v9.0.0 or higher |
| **MongoDB** | v5.0 or higher |
| **RAM** | 4 GB minimum |
| **CPU** | Dual-core 2.0 GHz+ |
| **Storage** | 5 GB free space |
| **Network** | Internet connection (for APIs and cloud storage) |

### Recommended System Requirements
| Component | Specification |
|-----------|--------------|
| **Operating System** | Windows 11, macOS 13+, Ubuntu 22.04+ |
| **Node.js** | v20.x LTS |
| **MongoDB** | v7.0+ or MongoDB Atlas |
| **RAM** | 8 GB |
| **CPU** | Quad-core 2.5 GHz+ |
| **Storage** | 10 GB free space (SSD recommended) |
| **Network** | Broadband 5 Mbps+ |

### Space Requirements Breakdown

#### Application Storage
| Component | Size |
|-----------|------|
| Source Code | ~50 MB |
| Dependencies (node_modules) | ~350-500 MB |
| Static Assets (CSS, JS, images) | ~20 MB |
| Temporary Uploads | ~100 MB |
| Log Files | ~50-100 MB |
| **Total Application** | **~600-800 MB** |

#### Database Storage (MongoDB)
| Data Type | Estimated Size |
|-----------|---------------|
| 1,000 Users | ~5 MB |
| 1,000 Permit Applications | ~20 MB |
| 1,000 Document Records | ~2 MB |
| **Initial (empty)** | **~100 MB** |
| **Growth per 10,000 permits** | **~200 MB/year** |

#### Cloud Storage (Cloudinary - Documents)
| File Type | Average Size |
|-----------|--------------|
| PDF Documents | ~500 KB - 5 MB |
| Image Documents | ~100 KB - 2 MB |
| E-Signatures | ~20-50 KB |
| **Per Application** | **~5-10 MB** |
| **1,000 Applications** | **~5-10 GB** |
| **10,000 Applications** | **~50-100 GB** |

### Deployment Size Summary
| Scenario | Local Disk | Database | Cloud Storage |
|----------|-----------|----------|---------------|
| **Development** | 2 GB | 500 MB | 100 MB |
| **Small** (100 users) | 5 GB | 1 GB | 1 GB |
| **Medium** (1,000 users) | 10 GB | 2 GB | 10 GB |
| **Large** (10,000 users) | 20 GB | 5 GB | 100 GB |

## Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Chart.js for analytics
- React Chatbot Kit for AI assistant

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT authentication
- Multer for file uploads
- Nodemailer for emails
- Helmet for security
- CORS configured

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account (for file uploads)
- Google OAuth credentials

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd online-business-permit-system
```

2. **Backend Setup**
```bash
cd backend
npm install
```

3. **Create `.env` file in backend**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/janiuay
JWT_SECRET=your-super-secret-jwt-key-here
OPENAI_API_KEY=sk-your-openai-key
CLOUDINARY_URL=your-cloudinary-url
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

4. **Start Backend**
```bash
npm run dev
```

5. **Frontend Setup**
```bash
cd frontend
npm install
```

6. **Create `.env` file in frontend**
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

7. **Start Frontend**
```bash
npm run dev
```

## Default Admin Account

- Email: admin@janiuay.gov.ph
- Password: admin123

## Project Structure

```
online-business-permit-system/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── controllers/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── App.jsx
│   └── public/
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth
- `GET /api/auth/me` - Get current user

### Permits
- `POST /api/permits` - Create new permit application
- `GET /api/permits` - Get user permits
- `PUT /api/permits/:id/approve` - Approve permit (admin)
- `PUT /api/permits/:id/reject` - Reject permit (admin)

### Admin
- `GET /api/admin/metrics` - Get dashboard metrics
- `GET /api/admin/chatlogs` - Get chatbot logs
- `GET /api/admin/users` - Get all users

### Chatbot
- `POST /api/chatbot` - Chat with AI assistant

## Deployment

### Backend (Render.com)
1. Connect GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on push to main branch

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Database (MongoDB Atlas)
1. Create free cluster on MongoDB Atlas
2. Configure network access (allow all IPs for development)
3. Get connection string and add to environment variables

## Security Features

- bcrypt password hashing
- JWT token authentication (7-day expiry)
- Rate limiting on API endpoints
- CORS configuration
- Helmet.js security headers
- Input validation and sanitization
- File upload security with Cloudinary

## Support

For technical support:
- Email: bplo.janiuay@gmail.com
- Phone: 09811568676
- Address: Municipal Hall, Janiuay, Iloilo

## License

© 2024 Municipality of Janiuay, Iloilo. All rights reserved.
