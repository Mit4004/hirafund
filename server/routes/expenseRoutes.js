const express = require('express');
const router = express.Router();
const { createExpense } = require('../controllers/expenseController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, admin, createExpense);

module.exports = router;
