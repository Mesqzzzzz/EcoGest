require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const connectDB = require('./config/database');

const app = express();

// ── Middleware ───────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ───────────────────────────────────────────────────────────
app.use('/api/users',      require('./routes/users'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/proposals',  require('./routes/proposals'));
app.use('/api/meetings',   require('./routes/meetings'));
app.use('/api/projects',   require('./routes/projects'));
app.use('/api/admin',      require('./routes/admin'));

// ── Health check ─────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', db: 'mongodb' }));

// ── Error handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// ── Start ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});