const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const { auth, isAdmin } = require('./middleware/auth');
const cors = require('cors');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

// Example of an admin-only route
app.get('/api/admin', auth, isAdmin, (req, res) => {
  res.json({ msg: 'Admin access granted' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));