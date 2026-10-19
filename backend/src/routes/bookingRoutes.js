const express = require('express');
const router = express.Router();
const { createBooking, getBookings, updateBookingStatus } = require('../controllers/bookingController');
const auth = require('../middleware/auth');

// Public route for customers to book (no auth needed)
router.post('/public', createBooking);

// Protected routes for business owner
router.use(auth);
router.get('/', getBookings);
router.patch('/:id/status', updateBookingStatus);

module.exports = router;