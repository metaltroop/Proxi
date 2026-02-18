# Proxi - Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or Neon cloud)
- npm or yarn package manager

## Initial Setup

### 1. Database Setup

You have two options:

**Option A: Use Neon (Recommended for quick start)**
1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string

**Option B: Local PostgreSQL**
1. Install PostgreSQL on your machine
2. Create a database named `proxi`
3. Note your connection details

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
# Update DATABASE_URL with your connection string
DATABASE_URL="postgresql://user:password@host:5432/proxi?schema=public"

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database with initial data
npm run seed

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:3000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## Default Login Credentials

After seeding the database, you can login with:

- **Admin**: superuser@ssa.com / ChangeMe@123
- **Coordinator A**: coordinatorA@ssa.com / ChangeMe@123
- **Coordinator B**: coordinatorB@ssa.com / ChangeMe@123
- **Principal**: principal@ssa.com / ChangeMe@123

**⚠️ Important**: Change these passwords after first login!

## Project Structure

```
AGbackend/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── middleware/        # Express middleware
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── index.ts           # Entry point
│   │   └── seed.ts            # Database seeding
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── context/           # React context
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── App.tsx            # Main app component
│   │   └── main.tsx           # Entry point
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md
```

## Database Schema

The system uses 9 main tables:

1. **users** - Authentication and user management
2. **teachers** - Teacher information
3. **classes** - Class structure (standard-division)
4. **subjects** - Subject catalog
5. **periods** - Period timing structure
6. **timetables** - Teacher-class-subject-period mappings
7. **proxies** - Proxy assignments
8. **teacher_absences** - Absence tracking
9. **audit_logs** - System audit trail

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Teachers
- `GET /api/teachers` - Get all teachers
- `POST /api/teachers` - Create teacher
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Delete teacher
- `GET /api/teachers/:id/timetable` - Get teacher timetable

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes/bulk` - Bulk create classes
- `PUT /api/classes/:id` - Update class
- `GET /api/classes/:id/timetable` - Get class timetable

### Subjects
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create subject

### Periods
- `GET /api/periods` - Get all periods
- `POST /api/periods` - Create period

### Timetables
- `GET /api/timetables/teacher/:teacherId` - Get teacher timetable
- `GET /api/timetables/class/:classId` - Get class timetable
- `POST /api/timetables` - Create/update timetable
- `POST /api/timetables/conflicts` - Check conflicts

### Proxies
- `GET /api/proxies` - Get all proxies
- `POST /api/proxies/available-teachers` - Get available teachers
- `POST /api/proxies/auto-assign` - Auto-assign proxies
- `POST /api/proxies/assign` - Assign proxies

### Reports
- `GET /api/reports/proxy-history` - Proxy history
- `GET /api/reports/teacher-absences` - Teacher absence stats
- `GET /api/reports/proxy-load` - Proxy load distribution
- `GET /api/reports/class-coverage` - Class coverage stats
- `GET /api/reports/dashboard-stats` - Dashboard statistics

## Troubleshooting

### Backend won't start
- Check if PostgreSQL is running
- Verify DATABASE_URL in .env file
- Run `npm run prisma:generate` again

### Frontend won't connect to backend
- Ensure backend is running on port 3000
- Check CORS settings in backend/src/index.ts
- Verify FRONTEND_URL in backend/.env

### Database migration errors
- Delete prisma/migrations folder
- Run `npm run prisma:migrate` again
- If still failing, drop the database and recreate it

## Next Steps

1. Login with default credentials
2. Change your password
3. Create classes using bulk creation
4. Add teachers
5. Assign subjects to teachers
6. Create timetables
7. Start assigning proxies!

## Support

For issues or questions, please check the implementation plan or contact the development team.
