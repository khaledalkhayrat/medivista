import express from 'express';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});

// Disable a user (admin only)
router.put('/:id/disable', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isDisabled: true }, { new: true });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to disable user', error: err.message });
  }
});

// Delete a user (admin only)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
});

export default router;
