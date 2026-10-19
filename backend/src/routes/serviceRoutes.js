const express = require('express');
const router = express.Router();
const { 
  createService, 
  getServices, 
  deleteService,
  getPublicServices  // Add this new controller function
} = require('../controllers/serviceController');
const auth = require('../middleware/auth');

// ✅ PUBLIC ROUTE - No authentication required (MUST be before router.use(auth))
router.get('/public/:businessId', getPublicServices);

// ✅ PROTECTED ROUTES - All routes below require authentication
router.use(auth);
router.post('/', createService);
router.get('/', getServices);
router.delete('/:id', deleteService);

module.exports = router;