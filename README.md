# 🎓 Proxi - School Proxy Management System

A modern, full-stack web application for managing teacher proxies, timetables, and class schedules in educational institutions. Built with React, TypeScript, Node.js, and PostgreSQL.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)

## ✨ Features

### 📊 Dashboard
- Real-time overview of school operations
- Quick access to all modules
- Dark mode support
- Responsive mobile-first design

### 👥 Teacher Management
- Complete CRUD operations for teacher records
- Employee ID tracking
- Subject assignment
- Contact information management
- Advanced search and filtering

### 📚 Class Management
- Organize classes by standard and division
- Track class strength and capacity
- Assign class teachers
- Mobile-optimized card layout

### 📖 Subject Management
- Subject catalog with short codes
- Subject-teacher associations
- Easy bulk operations

### ⏰ Period Management
- Flexible period scheduling
- Break time configuration
- Custom time slots
- Visual period timeline

### 📅 Timetable Management
- Interactive timetable grid
- Teacher and class-based views
- Bulk cell selection and assignment
- **PDF Export** with custom fonts (Plus Jakarta Sans)
- **Mobile 3-day range view** with navigation
- Dark mode support
- Real-time conflict detection

### 🔄 Proxy Management
- Quick proxy assignment for absent teachers
- Smart teacher availability checking
- Conflict prevention
- Status tracking (ABSENT, BUSY, FREE)
- Bulk proxy operations
- Mobile-friendly interface

### 📈 Reports & Analytics
- **Statistics Dashboard** with key metrics
- Proxy assignment history
- Most absent teachers tracking
- Most active proxy teachers
- **PDF Report Generation**
- Date range filtering
- Mobile-responsive tables and cards

## 🚀 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS
- **Lucide React** - Icon library
- **Context API** - State management (Auth, Theme)

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Database
- **PDFMake** - PDF generation
- **bcryptjs** - Password hashing
- **JWT** - Authentication

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Clone Repository
```bash
git clone https://github.com/metaltroop/Proxi.git
cd Proxi/AGbackend
```

### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Start development server
npm run dev
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your API URL

# Start development server
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## 🗄️ Database Schema

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      String   @default("ADMIN")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Teacher {
  id               String   @id @default(uuid())
  name             String
  employeeId       String?  @unique
  phone            String?
  teachingSubjects String[]
  // Relations
  timetables       Timetable[]
  proxiesAssigned  Proxy[]   @relation("AssignedProxies")
  proxiesAbsent    Proxy[]   @relation("AbsentTeacher")
}

model Class {
  id         String      @id @default(uuid())
  className  String      @unique
  standard   Int
  division   String
  strength   Int?
  // Relations
  timetables Timetable[]
  proxies    Proxy[]
}

model Subject {
  id          String      @id @default(uuid())
  subjectName String      @unique
  shortCode   String      @unique
  // Relations
  timetables  Timetable[]
  proxies     Proxy[]
}

model Period {
  id         String      @id @default(uuid())
  periodNo   Int         @unique
  startTime  String
  endTime    String
  periodType String      @default("REGULAR")
  // Relations
  timetables Timetable[]
  proxies    Proxy[]
}

model Timetable {
  id        String  @id @default(uuid())
  classId   String
  teacherId String
  subjectId String
  periodId  String
  dayOfWeek Int
  // Relations
  class     Class   @relation(fields: [classId], references: [id])
  teacher   Teacher @relation(fields: [teacherId], references: [id])
  subject   Subject @relation(fields: [subjectId], references: [id])
  period    Period  @relation(fields: [periodId], references: [id])
}

model Proxy {
  id                String   @id @default(uuid())
  date              DateTime
  absentTeacherId   String
  assignedTeacherId String
  classId           String
  subjectId         String
  periodId          String
  status            String   @default("ABSENT")
  // Relations
  absentTeacher     Teacher  @relation("AbsentTeacher", fields: [absentTeacherId], references: [id])
  assignedTeacher   Teacher  @relation("AssignedProxies", fields: [assignedTeacherId], references: [id])
  class             Class    @relation(fields: [classId], references: [id])
  subject           Subject  @relation(fields: [subjectId], references: [id])
  period            Period   @relation(fields: [periodId], references: [id])
}
```

## 🎨 Key Features in Detail

### Dark Mode
- System-wide dark mode toggle
- Persistent theme preference
- Smooth transitions
- Optimized color schemes for readability

### Mobile Responsiveness
- **Bottom Navigation** - Quick access to main features
- **Mobile Menu** - Collapsible "More" section
- **Card Layouts** - Mobile-optimized views for all modules
- **3-Day Range View** - Timetables optimized for mobile
- **Touch-friendly** - Large tap targets and gestures

### PDF Generation
- **Timetables**: A4 landscape, custom fonts, single-page layout
- **Reports**: A4 portrait, professional formatting, date ranges
- Custom filenames with meaningful names
- Server-side generation for consistency

### Authentication & Security
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes
- Role-based access control

## 📱 Mobile Features

### Bottom Navigation
- Home
- Teachers
- Timetables
- Proxies
- Reports (in More menu)

### Mobile Menu
- Classes
- Subjects
- Periods
- Reports
- Theme toggle
- Profile
- Logout

### Responsive Breakpoints
- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

## 🛠️ Development

### Project Structure
```
AGbackend/
├── backend/
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic & PDF generation
│   │   ├── middleware/      # Auth, error handling
│   │   └── index.ts         # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # Database migrations
│   └── fonts/               # Custom fonts for PDFs
│
├── frontend/
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React contexts (Auth, Theme)
│   │   ├── services/        # API client
│   │   └── App.tsx          # Root component
│   └── public/              # Static assets
│
└── README.md                # This file
```

### Available Scripts

#### Backend
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma migrate   # Run database migrations
```

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🎯 Roadmap

- [ ] **Animations** - Smooth iOS-style transitions
- [ ] **Notifications** - Real-time alerts for proxy assignments
- [ ] **Email Integration** - Automated notifications
- [ ] **Attendance Tracking** - Student attendance module
- [ ] **Exam Management** - Exam scheduling and results
- [ ] **Parent Portal** - Parent access to student information
- [ ] **Mobile Apps** - Native iOS and Android apps

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Metal Troop**
- GitHub: [@metaltroop](https://github.com/metaltroop)

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Lucide](https://lucide.dev/) - Icon library
- [PDFMake](http://pdfmake.org/) - PDF generation

## 📞 Support

For support, email support@example.com or open an issue in the repository.

---

Made with ❤️ for educational institutions
