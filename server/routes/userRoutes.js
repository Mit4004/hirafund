const express = require('express');
const router = express.Router();
const { getUsers, addUser, updateUser, deleteUser, getDashboardStats } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, admin, getUsers)
  .post(protect, admin, addUser);

router.get('/dashboard', protect, admin, getDashboardStats);

router.route('/:id')
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

module.exports = router;
