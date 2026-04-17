require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const usersRoutes = require('./routes/users');
const activitiesRoutes = require('./routes/activities');
const proposalsRoutes = require('./routes/proposals');
const meetingsRoutes = require('./routes/meetings');
const projectsRoutes = require('./routes/projects');
const adminRoutes = require('./routes/admin');

app.use('/api/users', usersRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/proposals', proposalsRoutes);
app.use('/api/meetings', meetingsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 3000;

// Database sync and server start
sequelize.sync({ force: false })
  .then(() => {
    console.log('Database synchronized');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
    });
  })
  .catch(err => {
    console.error('Failed to synchronize database:', err);
  });