# Interview Scheduler

A full-stack interview scheduling application built with React.js frontend and Node.js backend with JWT authentication and MongoDB storage.

## Features

- **User Authentication**: JWT-based authentication with login/register
- **Interview Management**: Create, edit, delete, and manage interviews
- **Dashboard**: Overview of interview statistics and recent interviews
- **Search & Filter**: Advanced filtering and search capabilities
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Instant feedback with toast notifications

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React.js** - UI library
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Headless UI** - Accessible components
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## Installation

### Backend Setup

1. Navigate to backend directory:
   \`\`\`bash
   cd backend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create `.env` file with:
   \`\`\`env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/interview-scheduler
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:3000
   \`\`\`

4. Start the server:
   \`\`\`bash
   npm run dev
   \`\`\`

### Frontend Setup

1. Navigate to frontend directory:
   \`\`\`bash
   cd frontend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create `.env` file with:
   \`\`\`env
   VITE_API_URL=http://localhost:5000/api
   \`\`\`

4. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Usage

1. Start MongoDB service
2. Run the backend server on port 5000
3. Run the frontend development server on port 3000
4. Open http://localhost:3000 in your browser
5. Register a new account or login with existing credentials
6. Start scheduling interviews!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Interviews
- `GET /api/interviews` - Get all interviews
- `POST /api/interviews` - Create new interview
- `PATCH /api/interviews/:id/status` - Update interview status
- `DELETE /api/interviews/:id` - Delete interview
- `GET /api/interviews/stats` - Get interview statistics

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
