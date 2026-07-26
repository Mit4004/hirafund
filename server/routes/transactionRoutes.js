const express = require('express');
const router = express.Router();
const { addMoney, bulkAddMoney, getAllTransactions, getMyTransactions } = require('../controllers/transactionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/add-money', protect, admin, addMoney);
router.post('/bulk-add-money', protect, admin, bulkAddMoney);
router.get('/', protect, admin, getAllTransactions);
router.get('/my', protect, getMyTransactions);

module.exports = router;
