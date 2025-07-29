-- MongoDB Setup Instructions
-- This is not SQL, but instructions for setting up MongoDB

-- 1. Install MongoDB locally or use MongoDB Atlas (cloud)
-- 2. If using local MongoDB, start the service:
--    - Windows: net start MongoDB
--    - macOS: brew services start mongodb-community
--    - Linux: sudo systemctl start mongod

-- 3. If using MongoDB Atlas:
--    - Create a free cluster at https://cloud.mongodb.com
--    - Get your connection string
--    - Replace MONGODB_URI in .env.local with your Atlas connection string

-- 4. The application will automatically create the required collections:
--    - users (for authentication)
--    - interviews (for interview data)

-- 5. No manual database setup required - Mongoose will handle schema creation
