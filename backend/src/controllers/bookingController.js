const pool = require('../config/database');

const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}${day}-${random}`;
};

exports.createBooking = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { service_id, customer_name, customer_phone, booking_date, booking_time } = req.body;
    const userId = req.userId || req.body.user_id;
    
    if (!service_id || !customer_name || !booking_date || !booking_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    await client.query('BEGIN');
    
    const serviceResult = await client.query(
      'SELECT price, user_id FROM services WHERE id = $1', 
      [service_id]
    );
    
    if (serviceResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Service not found' });
    }
    
    const service = serviceResult.rows[0];
    const businessUserId = service.user_id;
    
    const bookingResult = await client.query(
      `INSERT INTO bookings (user_id, service_id, customer_name, customer_phone, booking_date, booking_time) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [businessUserId, service_id, customer_name, customer_phone, booking_date, booking_time]
    );
    
    const booking = bookingResult.rows[0];
    const invoiceNumber = generateInvoiceNumber();
    
    const invoiceResult = await client.query(
      `INSERT INTO invoices (booking_id, invoice_number, total) 
       VALUES ($1, $2, $3) RETURNING *`,
      [booking.id, invoiceNumber, service.price]
    );
    
    await client.query('COMMIT');
    
    res.status(201).json({
      booking: booking,
      invoice: invoiceResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  } finally {
    client.release();
  }
};

exports.getBookings = async (req, res) => {
  try {
    const userId = req.userId;
    const result = await pool.query(
      `SELECT b.*, s.name as service_name, s.price, 
              i.invoice_number, i.total, i.status as invoice_status
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       LEFT JOIN invoices i ON b.id = i.booking_id
       WHERE b.user_id = $1
       ORDER BY b.booking_date DESC, b.booking_time DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.userId;
    
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const result = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [status, id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
};