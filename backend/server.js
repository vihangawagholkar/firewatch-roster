const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employee');
const cors = require('cors');
const dotenv = require('dotenv');
const rosterRoutes = require('./routes/roster')

const path = require('path');


dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));  // CORS

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/shiftRoster', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
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