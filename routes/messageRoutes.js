const express = require('express');
const Message = require('../models/Message');

const router = express.Router();

// POST a new contact message
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are all required' });
    }

    const newMessage = new Message({ name, email, message });
    await newMessage.save();

    res.status(201).json({ message: 'Message received. We will get back to you soon.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error saving message' });
  }
});

module.exports = router;