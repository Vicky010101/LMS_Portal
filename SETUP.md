# Login Page Setup Instructions

## Prerequisites
- Node.js installed
- MongoDB installed and running locally OR MongoDB Atlas account

## Setup Steps

### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure MongoDB

**Option A: Local MongoDB**
- Make sure MongoDB is running on your machine
- The default connection string is already set in `backend/.env`

**Option B: MongoDB Atlas (Cloud)**
- Create a free account at https://www.mongodb.com/cloud/atlas
- Create a cluster and get your connection string
- Update `backend/.env` with your connection string:
  ```
  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/auth-app
  ```

### 3. Start the Backend Server

```bash
cd backend
npm start
```

You should see: "Connected to MongoDB" and "Server running on port 5000"

### 4. Start the Frontend (in a new terminal)

```bash
cd frontend
npm start
```

The app will open at http://localhost:3000

## Testing the Login

1. First, create an account using the "Sign up" button
2. Then you can log in with those credentials

## Troubleshooting

- **CORS errors**: Make sure backend is running on port 5000
- **MongoDB connection failed**: Check your MongoDB is running or connection string is correct
- **Port already in use**: Change PORT in backend/.env to a different port (e.g., 5001)
