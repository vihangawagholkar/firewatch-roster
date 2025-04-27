const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employee');
const cors = require('cors');
const dotenv = require('dotenv');
const rosterRoutes = require('./routes/roster')

const path = require('path');

console.log("Current directory:", __dirname);
dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));  // CORS
const mongoURI = process.env.MONGODB_URI;
console.log("Mongo URI:", mongoURI); // Log to check the value of the URI
// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Serve static files from the React app (adjust path to frontend/build)
app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));

// Serve index.html when accessing the root route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
});


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);

app.use('/api/roster', rosterRoutes);


// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Catch-all route to handle React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Server setup
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});