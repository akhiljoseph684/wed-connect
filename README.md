# WedConnect — Discover. Connect. Plan. Celebrate.

**WedConnect** is an all-in-one, full-stack luxury wedding ecosystem connecting couples, wedding creators, and wedding service providers. It unifies wedding inspiration moodboards (Pinterest-style), social discovery and creator follows (Instagram-style), a comprehensive vendor marketplace, and collaborative project management tools (checklists, budgets, guest RSVPs, day-of timelines).

---

## 1. Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS (custom luxury palette: Warm Ivory `#FAF8F4`, Deep Burgundy `#722F45`, Rose `#B76E79`, Muted Gold `#C5A46D`, Soft Blush `#F4E7E8`, Dark Charcoal `#252329`)
- **Typography**: Playfair Display (editorial headings) & Inter (body interface)
- **State Management**: Redux Toolkit (Auth, Wedding Plan, and Notification slices)
- **Routing**: React Router DOM v6 with lazy route splitting and capability-based route guards
- **Forms & Validation**: React Hook Form with Zod resolvers
- **Animations & Icons**: Framer Motion & Lucide React
- **Real-Time Client**: Socket.IO Client
- **Notifications**: React Hot Toast

### Backend
- **Runtime**: Node.js (ES Modules `"type": "module"`)
- **Framework**: Express.js
- **Database**: MongoDB Atlas with Mongoose ODM (27 structured models)
- **Authentication**: JWT access token + secure HTTP-only refresh tokens, bcrypt password hashing
- **File Uploads**: Cloudinary with local disk storage fallback
- **Real-Time Engine**: Socket.IO with authenticated rooms and event handlers
- **Security**: Helmet, CORS, Morgan, Express-Validator

---

## 2. Monorepo Project Structure

```text
wedconnect/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/        # Button, Input, Modal, Badge, Skeleton, EmptyState
│   │   │   ├── cards/         # PostCard, VendorCard, CreatorCard, CollectionCard, TaskCard
│   │   │   ├── layout/        # Navbar, Footer, DashboardHeader, Sidebar
│   │   │   └── modals/        # CreatePostModal, EnquiryModal, ReviewModal, etc.
│   │   ├── context/           # SocketContext with presence and live alerts
│   │   ├── layouts/           # PublicLayout, AuthLayout, UserLayout, WeddingPlannerLayout, VendorLayout, CreatorLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── auth/          # Login, Register, ForgotPassword, ResetPassword, EmailVerification
│   │   │   ├── public/        # Landing, Explore, Categories, Vendors, Creators, Search, PostDetail
│   │   │   ├── user/          # Dashboard, Feed, Profile, Collections, Messages, Notifications, Settings
│   │   │   ├── wedding/       # Overview, Tasks, Budget, Guests, ShortlistedVendors, Timeline, Settings
│   │   │   ├── vendor/        # Overview, Profile, Services, Portfolio, Enquiries, Reviews, Availability, Analytics
│   │   │   ├── creator/       # Overview, Profile, Portfolio, Posts, Collaborations, Analytics, Settings
│   │   │   └── admin/         # Overview, Users, Vendors, Creators, Verifications, Categories, Reports, Audit
│   │   ├── routes/            # AppRouter.jsx, ProtectedRoute.jsx, RoleRoute.jsx
│   │   ├── services/          # Centralized Axios API services
│   │   ├── store/             # Redux store & slices
│   │   ├── styles/            # Tailwind base & custom luxury styling classes
│   │   ├── utils/             # Formatters, cn helper
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/            # db.js, cloudinary.js, socket.js
│   │   ├── controllers/       # Thin Express controllers (15 modules)
│   │   ├── database/          # seed.js (comprehensive sample data)
│   │   ├── middlewares/       # auth, error, validate, upload
│   │   ├── models/            # 27 Mongoose schemas + barrel index.js
│   │   ├── routes/            # 20 modular route definitions
│   │   ├── services/          # Business logic layer
│   │   ├── utils/             # apiResponse, token
│   │   └── app.js             # Express app setup & middleware pipeline
│   ├── test/                  # Node.js built-in test suite (api.test.js)
│   ├── server.js              # Server entry point + Socket.IO initialization
│   └── package.json
│
├── README.md
└── package.json
```

---

## 3. Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/wedconnect
JWT_ACCESS_SECRET=your_jwt_access_secret_key_12345
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_67890
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=demo
CLOUDINARY_API_SECRET=demo
```

### Frontend (`client/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

---

## 4. Getting Started & Installation

### Step 1: Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 2: Seed Sample Data
Ensure MongoDB is running locally (`mongodb://localhost:27017/wedconnect`), then execute:
```bash
cd server
node src/database/seed.js
```

### Step 3: Run the Development Servers
```bash
# Terminal 1 — Start Backend Server (runs on http://localhost:5000)
cd server
npm run dev

# Terminal 2 — Start Frontend Client (runs on http://localhost:5173)
cd client
npm run dev
```

---

## 5. Pre-Seeded Demo Accounts
Password for all demo accounts is: `Password123!`

| Role | Email Address | Access Area |
| :--- | :--- | :--- |
| **Administrator** | `admin@wedconnect.com` | `/admin/dashboard` |
| **Wedding Couple** | `couple@wedconnect.com` | `/my-wedding` & `/dashboard` |
| **Vendor Business** | `vendor@wedconnect.com` | `/vendor/dashboard` |
| **Wedding Creator** | `creator@wedconnect.com` | `/creator/dashboard` |
| **Standard User** | `user@wedconnect.com` | `/dashboard` |

---

## 6. Testing

### Backend Unit & Integration Tests
WedConnect uses the native Node.js test runner for zero-dependency API tests:
```bash
cd server
npm test
```
**Tests Covered:**
1. Database connectivity & Mongoose schema loading
2. Category taxonomy seeding and retrieval
3. User registration and bcrypt password comparison
4. Inspiration feed pagination and user like states
5. Wedding Plan workspace aggregation and budget calculations

### Frontend Production Build
Verify all JSX components, route bundles, and Tailwind CSS compile cleanly:
```bash
cd client
npm run build
```

---

## 7. AWS Deployment Guide

### Architecture Overview
- **Frontend**: AWS S3 Static Website Hosting + CloudFront CDN
- **Backend API**: AWS Elastic Beanstalk or AWS ECS (Fargate) with Application Load Balancer
- **Database**: MongoDB Atlas (VPC Peering with AWS)
- **Media**: Cloudinary CDN or Amazon S3 bucket with IAM pre-signed upload URLs

### Deploying Frontend (S3 + CloudFront)
1. Build static production bundle:
   ```bash
   cd client
   npm run build
   ```
2. Sync `client/dist` to Amazon S3:
   ```bash
   aws s3 sync dist/ s3://wedconnect-frontend-bucket --delete
   ```
3. Invalidate CloudFront Distribution:
   ```bash
   aws cloudfront create-invalidation --distribution-id <DIST_ID> --paths "/*"
   ```

### Deploying Backend (AWS ECS / Elastic Beanstalk)
1. Create a `Dockerfile` for `server/`:
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 5000
   CMD ["node", "server.js"]
   ```
2. Build and push image to Amazon ECR:
   ```bash
   aws ecr get-login-password | docker login --username AWS --password-stdin <ACCOUNT>.dkr.ecr.<REGION>.amazonaws.com
   docker build -t wedconnect-server .
   docker tag wedconnect-server:latest <ACCOUNT>.dkr.ecr.<REGION>.amazonaws.com/wedconnect-server:latest
   docker push <ACCOUNT>.dkr.ecr.<REGION>.amazonaws.com/wedconnect-server:latest
   ```
3. Launch ECS Task Service attached to an ALB target group with HTTPS (AWS Certificate Manager). Set environment variables in AWS Systems Manager Parameter Store or ECS Task Definition.

---

## 8. License & Attribution
Developed with pride for WedConnect — discovering, connecting, planning, and celebrating extraordinary weddings.
