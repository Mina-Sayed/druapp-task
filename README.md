# MediConnect - Secure Medical Records Platform

## Overview
MediConnect is a modern, secure healthcare platform designed to streamline medical record management, facilitate patient-doctor communication, and enable virtual consultations. Built with cutting-edge technologies, it provides a robust solution for healthcare providers and patients.

## Tech Stack

### Frontend
- **Framework**: Next.js 15.1.0 with App Router
- **Language**: TypeScript
- **UI Components**: 
  - Shadcn UI (Built on Radix UI)
  - Tailwind CSS for styling
  - Lucide Icons
- **State Management**: 
  - React Hooks
  - Context API for authentication
  - URL state management with `nuqs`
- **Data Fetching**: 
  - Server Components (RSC)
  - Axios for API calls

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: 
  - PostgreSQL
  - TypeORM for ORM
- **Authentication**: 
  - JWT (JSON Web Tokens)
  - bcrypt for password hashing
- **Real-time Communication**: 
  - WebSocket for chat
  - Twilio for video consultations

## Core Features

### 1. Authentication & Authorization
- Secure user registration and login
- Role-based access control (Patient, Doctor, Admin)
- JWT-based session management
- Password reset functionality

### 2. Medical Records Management
- Create and manage patient records
- Document upload and management
- Medical history tracking
- Secure access control

### 3. Messaging System
- Real-time chat between patients and healthcare providers
- Message history and search
- File sharing capabilities
- Read receipts and typing indicators

### 4. Video Consultations
- Twilio-powered video calls
- Appointment scheduling
- Consultation history
- Screen sharing capabilities

### 5. User Dashboard
- Personalized dashboard for different user roles
- Quick access to important features
- Notification system
- Activity tracking

### 6. Profile Management
- User profile customization
- Professional credentials for healthcare providers
- Contact information management
- Privacy settings

## Technical Implementation

### Frontend Architecture
- **Component Structure**:
  - Atomic design pattern
  - Reusable UI components
  - Server and Client Components separation
  - Responsive design with mobile-first approach

- **Performance Optimizations**:
  - React Server Components
  - Dynamic imports
  - Image optimization
  - Route prefetching
  - Efficient state management

### Backend Architecture
- **API Design**:
  - RESTful endpoints
  - WebSocket integration
  - Rate limiting
  - Request validation
  - Error handling

- **Database Design**:
  - Normalized schema
  - Efficient indexing
  - Relationship management
  - Migration system

### Security Measures
- HTTPS enforcement
- CORS configuration
- XSS protection
- CSRF protection
- Input validation
- Rate limiting
- Secure password handling

## UI/UX Features
- **Responsive Design**:
  - Mobile-first approach
  - Breakpoint optimization
  - Touch-friendly interfaces

- **Accessibility**:
  - ARIA labels
  - Keyboard navigation
  - Screen reader support
  - Color contrast compliance

- **Theme System**:
  - Light/Dark mode
  - Custom color schemes
  - Consistent styling
  - Design token system

## Development Practices
- **Code Organization**:
  - Feature-based structure
  - Clear separation of concerns
  - TypeScript for type safety
  - Consistent naming conventions

- **Performance**:
  - Lazy loading
  - Code splitting
  - Caching strategies
  - Bundle size optimization

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- pnpm package manager
- PostgreSQL database
- Twilio account for video features

### Installation
1. Clone the repository
```bash
git clone https://github.com/Mina-Sayed/druapp-task/
cd druapp-task
```

2. Install dependencies
```bash
# Install frontend dependencies
cd frontend
pnpm install

# Install backend dependencies
cd ../backend
pnpm install
```

3. Environment Setup
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3002/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3002
NEXT_PUBLIC_TWILIO_ACCOUNT_SID=your_account_sid

# Backend (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/mediconnect
JWT_SECRET=your_jwt_secret
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
```

4. Start Development Servers
```bash
# Frontend
cd frontend
pnpm dev

# Backend
cd backend
pnpm start:dev
```

## Deployment
- Frontend deployed on Vercel
- Backend deployed on a cloud platform (AWS/GCP/Azure)
- Database hosted on a managed service
- CI/CD pipeline with GitHub Actions

## Contributing
Please read our contributing guidelines before submitting pull requests.

