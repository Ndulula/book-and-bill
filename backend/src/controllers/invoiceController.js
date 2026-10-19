const pool = require('../config/database');

exports.getInvoices = async (req, res) => {
  try {
    const userId = req.userId;
    const result = await pool.query(
      `SELECT i.*, b.customer_name, b.booking_date, s.name as service_name
       FROM invoices i
       JOIN bookings b ON i.booking_id = b.id
       JOIN services s ON b.service_id = s.id
       WHERE b.user_id = $1
       ORDER BY i.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const result = await pool.query(
      `SELECT i.*, b.customer_name, b.customer_phone, b.booking_date, 
              s.name as service_name, s.price
       FROM invoices i
       JOIN bookings b ON i.booking_id = b.id
       JOIN services s ON b.service_id = s.id
       WHERE i.id = $1 AND b.user_id = $2`,
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
};

exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.userId;
    
    if (!['paid', 'unpaid'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const result = await pool.query(
      `UPDATE invoices 
       SET status = $1 
       WHERE id = $2 AND booking_id IN (
         SELECT id FROM bookings WHERE user_id = $3
       ) RETURNING *`,
      [status, id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
};