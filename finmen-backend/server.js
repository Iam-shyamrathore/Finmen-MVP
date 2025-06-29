const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/auth');
const moodRoutes = require('./src/routes/mood');
const missionRoutes = require('./src/routes/mission');

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => res.send('FINMEN Backend'));
app.use('/api/auth', authRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/mission', missionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));