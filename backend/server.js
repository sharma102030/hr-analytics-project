require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const { ensureSeeded } = require('./seed/seedDatabase');
const analyticsRoutes = require('./routes/analyticsRoutes');
const employeeRoutes = require('./routes/employeeRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Allow the frontend's origin(s) to call this API.
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',');
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/analytics', analyticsRoutes);
app.use('/api/employees', employeeRoutes);

// Basic error handler — every controller calls next(err) on failure, it lands here.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

connectDB()
  .then(async () => {
    await ensureSeeded();
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
