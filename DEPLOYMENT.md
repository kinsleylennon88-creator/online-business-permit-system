# Online Business Permit System - Deployment Guide

## Project Structure
```
online-business-permit-system/
├── backend/                  # Node.js/Express API
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API endpoints
│   ├── middleware/          # Auth, upload, validation
│   ├── utils/               # Email service
│   ├── server.js            # Entry point
│   ├── package.json
│   └── .env.example
├── frontend/                # React + Vite app
│   ├── src/
│   │   ├── components/      # Shared components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # Auth context
│   │   ├── services/        # API services
│   │   └── App.jsx
│   ├── package.json
│   └── .env.example
└── README.md
```

## Quick Start (Local Development)

### 1. Clone and Setup Backend
```bash
cd backend
npm install
```

Create `.env` file:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/janiuay
JWT_SECRET=your-super-secret-jwt-key-here
OPENAI_API_KEY=sk-your-openai-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
PORT=5000
NODE_ENV=development
```

Start backend:
```bash
npm run dev
```

### 2. Setup Frontend
```bash
cd frontend
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

Start frontend:
```bash
npm run dev
```

## Deployment

### Backend (Render.com)
1. Create account at render.com
2. Connect GitHub repository
3. Select "Web Service"
4. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables: Add all from .env
5. Deploy

### Frontend (Vercel)
1. Create account at vercel.com
2. Connect GitHub repository
3. Select `frontend` folder as root
4. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables: Add VITE_API_URL pointing to your Render backend URL
5. Deploy

### Database (MongoDB Atlas)
1. Create cluster at mongodb.com/atlas
2. Get connection string
3. Add to environment variables
4. Whitelist all IPs (0.0.0.0/0) for Render deployment

## Default Admin Account
- Email: admin@janiuay.gov.ph
- Password: admin123

Create this user manually in MongoDB or through registration then upgrade role to admin.

## Features
- User registration/login with JWT
- Google OAuth authentication
- Multi-step permit application wizard
- Document upload (Cloudinary)
- AI chatbot assistant
- Admin dashboard with metrics
- Email notifications
- Role-based access control

## Support
- Email: bplo.janiuay@gmail.com
- Phone: 09811568676
