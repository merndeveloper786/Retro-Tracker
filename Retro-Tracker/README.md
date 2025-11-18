# Team Retrospective & Action Tracker

A full-stack MERN application for managing team retrospectives and tracking action items across sprints.

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: MongoDB with Mongoose
- **Frontend**: React + Vite + Tailwind CSS
- **Authentication**: JWT (JSON Web Tokens)
- **State Management**: React Context API

## Features

### Core Features (MVP)

1. **Authentication & Users**
   - User registration and login with email/password
   - Secure password hashing with bcrypt
   - JWT-based authentication with token persistence
   - User profile with avatar initials

2. **Teams**
   - Create teams
   - Invite members by email (simplified - no actual email sending)
   - Role-based access (Owner, Member)
   - Team switching in UI
   - Only owners can rename teams and remove members

3. **Retrospective Sessions**
   - Create retros with name, sprint number, and date range
   - List and search retros by name
   - Filter retros by date range

4. **Retro Board**
   - Three columns: "Went Well", "Needs Improvement", "Kudos"
   - Add cards to any column
   - Edit and soft-delete own cards
   - View deleted cards with toggle

5. **Action Items**
   - Create action items from "Needs Improvement" cards
   - Track status: Open, In Progress, Done
   - Assign to team members
   - Filter by status, retro, and search by title

6. **Authorization**
   - Users can only access teams they belong to
   - Users can only edit/delete their own cards
   - All team members can create/edit action items

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth & authorization middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── tests/           # Test files
│   │   ├── utils/           # Utility functions
│   │   └── server.js        # Entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React contexts
│   │   ├── pages/           # Page components
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/retro-tracker
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

5. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Update the `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` 

## API Documentation

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile (protected)

### Teams

- `GET /api/teams` - Get all teams for authenticated user (protected)
- `POST /api/teams` - Create a new team (protected)
- `GET /api/teams/:teamId` - Get team details (protected, must be member)
- `PUT /api/teams/:teamId` - Update team (protected, must be owner)
- `POST /api/teams/:teamId/members` - Invite member (protected, must be owner)
- `DELETE /api/teams/:teamId/members/:memberId` - Remove member (protected, must be owner)

### Retros

- `POST /api/retros/teams/:teamId` - Create retro (protected, must be team member)
- `GET /api/retros/teams/:teamId` - Get all retros for team (protected, must be team member)
- `GET /api/retros/:retroId` - Get retro details (protected, must be team member)
- `GET /api/retros/:retroId/board` - Get retro board with cards (protected, must be team member)

### Cards

- `POST /api/retros/:retroId/cards` - Create card (protected, must be team member)
- `PUT /api/retros/:retroId/cards/:cardId` - Update card (protected, must be author)
- `DELETE /api/retros/:retroId/cards/:cardId` - Soft delete card (protected, must be author)

### Action Items

- `POST /api/action-items/retros/:retroId` - Create action item (protected, must be team member)
- `GET /api/action-items/teams/:teamId` - Get action items for team (protected, must be team member)
- `GET /api/action-items/:actionItemId` - Get action item details (protected, must be team member)
- `PUT /api/action-items/:actionItemId` - Update action item (protected, must be team member)

## Testing

### Backend Tests

1. Install test dependencies:
```bash
cd backend
npm install --save-dev jest @jest/globals supertest
```

2. Run backend tests:
```bash
npm test
```

Tests cover:
- Authentication flow (register/login, password hashing)
- Retro creation and authorization
- Database operations

### Frontend Tests

1. Install test dependencies (already included in package.json):
```bash
cd frontend
npm install
```

2. Run frontend tests:
```bash
npm run test
```

Tests use Vitest and React Testing Library. Example test for RetroBoard component is included.

## Design Decisions

### Data Modeling

1. **Team Membership**: Embedded in Team model as an array of members with roles. This simplifies queries and ensures data consistency.

2. **Soft Delete for Cards**: Cards are marked as deleted but not removed from the database, allowing for audit trails and recovery.

3. **Action Items**: Separate collection with references to cards, retros, and teams. This allows action items to persist across retros while maintaining relationships.

### Security

1. **Password Hashing**: bcrypt with salt rounds for secure password storage
2. **JWT Authentication**: Stateless authentication with configurable expiration
3. **Authorization Middleware**: Separate middleware for team membership, ownership, and resource ownership checks
4. **Input Validation**: Both frontend and backend validation for required fields and types

### State Management

React Context API is used for:
- Authentication state (AuthContext)
- Team selection (TeamContext)

This provides a simple, lightweight solution without the complexity of Redux for this application size.


