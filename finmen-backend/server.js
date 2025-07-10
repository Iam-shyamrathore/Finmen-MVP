const express = require('express');
     const cors = require('cors');
     const dotenv = require('dotenv');
     const connectDB = require('./src/config/db');
     const helmet = require('helmet');
     const rateLimit = require('express-rate-limit');
     const authRoutes = require('./src/routes/auth');
     const moodRoutes = require('./src/routes/mood');
     const missionRoutes = require('./src/routes/mission');
     const healcoinRoutes = require('./src/routes/healcoin');
     const leaderboardRoutes = require('./src/routes/leaderboard');
     const dashboardRoutes = require('./src/routes/dashboard');
     const chatbotRoutes = require('./src/routes/chatbot');

     dotenv.config();

     const app = express();

     // Connect to MongoDB
     connectDB();

     // Middleware
     app.use(cors());
     app.use(express.json());
     app.use(helmet());
     app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

     // Routes
     app.get('/', (req, res) => res.send('FINMEN Backend'));
     app.use('/api/auth', authRoutes);
     app.use('/api/mood', moodRoutes);
     app.use('/api/mission', missionRoutes);
     app.use('/api/healcoin', healcoinRoutes);
     app.use('/api/leaderboard', leaderboardRoutes);
     app.use('/api/dashboard', dashboardRoutes);
     app.use('/api/chatbot', chatbotRoutes);

     const PORT = process.env.PORT || 5000;
     app.listen(PORT, () => console.log(`Server running on port ${PORT}`));