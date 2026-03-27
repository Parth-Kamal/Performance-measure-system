const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'PMS API is running' });
});

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const goalRoutes = require('./routes/goals');
const feedbackRoutes = require('./routes/feedback');
const reviewRoutes = require('./routes/reviews');
const notificationRoutes = require('./routes/notifications');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
