const express = require('express');
const router = express.Router();
const { getInvoices, getInvoiceById, updateInvoiceStatus } = require('../controllers/invoiceController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.patch('/:id/status', updateInvoiceStatus);

module.exports = router;