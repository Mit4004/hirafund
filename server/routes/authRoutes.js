const express = require('express');
const router = express.Router();
const { loginUser, getUserProfile, updatePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/password', protect, updatePassword);

module.exports = router;
