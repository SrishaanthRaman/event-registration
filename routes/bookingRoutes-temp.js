const express = require('express');
const Booking = require('../models/Booking');
const requireLogin = require('../middleware/auth');

const router = express.Router();
const MAX_EVENTS_PER_DAY = 4;

// GET availability for a given month
// Example: GET /api/bookings/availability?month=2026-07
// Returns: { "2026-07-01": { booked: 2, available: 2 }, "2026-07-02": { booked: 4, available: 0 }, ... }
router.get('/availability', async (req, res) => {
  try {
    const { month } = req.query; // format: YYYY-MM
    if (!month) {
      return res.status(400).json({ error: 'Month query param is required (format YYYY-MM)' });
    }

    // Find all active bookings within that month
    const bookings = await Booking.find({
      date: { $regex: `^${month}` },
      status: 'confirmed'
    });

    // Count bookings per date
    const counts = {};
    bookings.forEach(b => {
      counts[b.date] = (counts[b.date] || 0) + 1;
    });

    // Build availability object for every date that has at least one booking
    const availability = {};
    Object.keys(counts).forEach(date => {
      availability[date] = {
        booked: counts[date],
        available: MAX_EVENTS_PER_DAY - counts[date]
      };
    });

    res.status(200).json({ maxPerDay: MAX_EVENTS_PER_DAY, availability });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching availability' });
  }
});

// POST create a new booking (requires login)
router.post('/', requireLogin, async (req, res) => {
  try {
    const { eventName, package: pkg, date } = req.body;

    if (!eventName || !pkg || !date) {
      return res.status(400).json({ error: 'eventName, package, and date are all required' });
    }

    // Check how many confirmed bookings already exist for this date
    const existingCount = await Booking.countDocuments({ date, status: 'confirmed' });

    if (existingCount >= MAX_EVENTS_PER_DAY) {
      return res.status(409).json({ error: `This date is fully booked (max ${MAX_EVENTS_PER_DAY} events/day). Please choose another date.` });
    }

    const newBooking = new Booking({
      userId: req.session.userId,
      eventName,
      package: pkg,
      date
    });

    await newBooking.save();

    res.status(201).json({
      message: 'Booking confirmed',
      booking: newBooking,
      slotsLeftForDate: MAX_EVENTS_PER_DAY - (existingCount + 1)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error creating booking' });
  }
});

// GET logged-in user's own bookings
router.get('/my-bookings', requireLogin, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.session.userId }).sort({ date: 1 });
    res.status(200).json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching bookings' });
  }
});

// DELETE cancel a booking (only the owner can cancel)
router.delete('/:id', requireLogin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (booking.userId.toString() !== req.session.userId.toString()) {
      return res.status(403).json({ error: 'You can only cancel your own bookings' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({ message: 'Booking cancelled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error cancelling booking' });
  }
});

module.exports = router;