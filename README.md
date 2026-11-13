# 💍 WedConnect

### Discover. Connect. Plan. Celebrate.

WedConnect is a full-stack wedding inspiration, social community, vendor marketplace, and wedding planning platform built using the MERN stack.

It connects couples, wedding creators, and wedding service providers in one platform, making wedding discovery, collaboration, and planning easier.

## ✨ Features

### 1. Wedding Inspiration & Social Community
- Discover wedding inspiration and trending posts.
- Create posts with images and videos.
- Like and comment on posts.
- Follow creators and other users.
- Save posts to personalized collections.
- Search wedding-related content.
- Explore wedding categories.

### 2. Creator Platform
- Create and manage creator profiles.
- Upload portfolios and showcase creative work.
- Publish wedding-related content.
- Manage followers and engagement.
- Receive collaboration requests.
- View creator growth analytics.

### 3. Vendor Marketplace
- Discover wedding service providers.
- Create and manage business profiles.
- Manage services and packages.
- Upload business portfolios.
- Manage availability.
- Receive and respond to customer enquiries.
- Manage customer reviews.
- Vendor verification system.
- Business analytics.

### 4. Wedding Planning Workspace
- Create and manage wedding plans.
- Wedding overview and countdown.
- Wedding task management.
- Budget and expense tracking.
- Guest list management.
- RSVP tracking.
- Wedding inspiration boards.
- Save and shortlist vendors.
- Wedding timeline.
- Collaborate with other members.
- Owner, Collaborator and Viewer permissions.

### 5. Real-Time Messaging & Notifications
- Real-time messaging using Socket.IO.
- Online/offline status.
- Typing indicators.
- Message read receipts.
- Unread message indicators.
- Real-time notifications.
- Email notifications.
- Collaboration invitations.

### 6. Admin Dashboard
- Platform statistics and analytics.
- User management.
- Creator management.
- Vendor management.
- Business verification.
- Content moderation.
- Report management.
- Category management.
- Review moderation.
- Platform settings.
- Audit logs.

## 🛠️ Technology Stack

### Frontend
- React.js
- Vite
- JavaScript (ES6+)
- Tailwind CSS
- Shadcn UI
- React Router DOM
- Redux Toolkit
- Axios
- React Hook Form
- Zod
- Lucide React
- Framer Motion

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt
- Socket.IO
- Multer
- Cloudinary
- Nodemailer

### Deployment & Infrastructure
- AWS EC2
- MongoDB Atlas
- Cloudinary
- Nginx
- PM2

## 📁 Project Structure

```text
wedconnect/
│
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── pages/
│       │   ├── public/
│       │   ├── auth/
│       │   ├── user/
│       │   ├── creator/
│       │   ├── vendor/
│       │   ├── wedding-planner/
│       │   └── admin/
│       ├── layouts/
│       ├── routes/
│       ├── hooks/
│       ├── services/
│       ├── store/
│       │   └── slices/
│       ├── context/
│       ├── utils/
│       ├── constants/
│       ├── validations/
│       ├── styles/
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── constants/
│   │   ├── helpers/
│   │   ├── sockets/
│   │   ├── templates/
│   │   ├── jobs/
│   │   └── app.js
│   │
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## ⚙️ Installation & Setup

### Prerequisites

- Node.js
- npm
- MongoDB Atlas account
- Cloudinary account
- SMTP email credentials

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd wedconnect
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Install Backend Dependencies

```bash
cd server
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the `server` directory.

**Backend — server/.env**

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Cookie Configuration
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Nodemailer
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
EMAIL_FROM=WedConnect <noreply@example.com>

# Frontend URLs
PASSWORD_RESET_URL=http://localhost:5173/reset-password
EMAIL_VERIFICATION_URL=http://localhost:5173/verify-email
```

Create another `.env` file inside the `client` directory.

**Frontend — client/.env**

```env
VITE_API_URL=http://localhost:5000/api/v1
```

Never commit actual credentials or secret environment variables to GitHub.

### 5. Run the Application

**Start Backend**

```bash
cd server
npm run dev
```

**Start Frontend**

```bash
cd client
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`

Use the actual scripts defined in the respective package.json files.

## 🏗️ Backend Architecture

The backend follows a modular architecture:

```text
Routes
   ↓
Middlewares
   ↓
Controllers
   ↓
Services
   ↓
Models
   ↓
MongoDB
```

- **Routes:** Define API endpoints.
- **Controllers:** Handle HTTP requests and responses.
- **Services:** Contain business logic and database operations.
- **Models:** Define Mongoose schemas and relationships.
- **Middlewares:** Authentication, authorization and validation.
- **Utils:** Reusable helper functions.
- **Config:** Database, Cloudinary and Socket.IO configuration.
- **Sockets:** Real-time communication.
- **Templates:** Email templates.

## 🔐 Security

- JWT-based authentication using HTTP-only cookies.
- Password hashing with bcrypt.
- Email verification.
- Secure password reset workflow.
- Role and capability-based authorization.
- Business ownership validation.
- Wedding plan membership permissions.
- Protected API routes.
- Input validation and error handling.

## 🚀 Deployment

The application is designed for deployment using:

- **Frontend:** AWS EC2
- **Backend:** AWS EC2
- **Database:** MongoDB Atlas
- **Media Storage:** Cloudinary
- **Web Server:** Nginx
- **Process Management:** PM2

Build the frontend:

```bash
cd client
npm run build
```

Start the backend using PM2:

```bash
cd server
pm2 start server.js --name wedconnect-api
pm2 save
```

Configure Nginx, HTTPS, production environment variables and secure cookie settings before going live.

## 🎯 Project Vision

WedConnect aims to simplify the wedding planning experience by bringing inspiration, creators, service providers, communication and planning tools together in one connected ecosystem.

Instead of using multiple platforms for discovering ideas, finding vendors and organizing wedding activities, couples can manage everything through WedConnect.

---

**WedConnect — Discover. Connect. Plan. Celebrate.** 💍