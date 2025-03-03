const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    let user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    if (user.status !== 'approved') {
      return res.status(403).json({ msg: 'Your account is pending approval' });
    }

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, 'secret', { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      res.json({ token, role: user.role });
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ username, password });
    await user.save();

    res.json({ msg: 'Registration request submitted. Waiting for admin approval.' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Admin approval route
router.post('/admin/approve', async (req, res) => {
  const { userId, status } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.status = status;
    await user.save();

    res.json({ msg: `User ${status}` });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get pending users
router.get('/admin/pending', async (req, res) => {
  try {
    const users = await User.find({ status: 'pending' });
    res.json(users);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;