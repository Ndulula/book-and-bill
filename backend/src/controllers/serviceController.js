const pool = require('../config/database');

exports.createService = async (req, res) => {
  try {
    const { name, price, duration } = req.body;
    const userId = req.userId;
    
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required' });
    }
    
    const result = await pool.query(
      'INSERT INTO services (user_id, name, price, duration) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, name, price, duration || 60]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
};

exports.getServices = async (req, res) => {
  try {
    const userId = req.userId;
    const result = await pool.query(
      'SELECT * FROM services WHERE user_id = $1 ORDER BY created_at DESC', 
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const result = await pool.query(
      'DELETE FROM services WHERE id = $1 AND user_id = $2 RETURNING *', 
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
};

// Add this to your existing serviceController.js
exports.getPublicServices = async (req, res) => {
  try {
    const { businessId } = req.params;
    const result = await pool.query(
      'SELECT * FROM services WHERE user_id = $1 ORDER BY created_at DESC',
      [businessId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get public services error:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
};