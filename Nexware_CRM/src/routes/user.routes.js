const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user.controller');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

// Create a new user (admin only)
router.post('/', auth, role(['admin']), userCtrl.createUser);

// Get all users (admin, subadmin, teamhead)
router.get('/', auth, role(['admin', 'subadmin', 'teamhead']), userCtrl.getUsers);
router.get('/getalluser', auth, userCtrl.getAllUsers);

// Update status of a user (admin only)
router.put('/status', auth, role(['admin']), userCtrl.updateStatus);
router.put('/password', auth, role(['admin']), userCtrl.changePasswordAlluser);

// Get logged-in user details
router.get('/me', auth, userCtrl.getMyDetails);

// Only Admin update any user
router.put('/adminUpdate', auth, userCtrl.anyUserUpdate);

// Logged-in user updates own profile
router.put('/update', auth, userCtrl.updateUser);

// Delete a user (admin only)
router.delete('/delete', auth, role(['admin']), userCtrl.deleteUser);

module.exports = router;
