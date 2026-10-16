const express = require('express');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// Helper to build user-specific notification query
const buildNotificationQuery = (user) => {
  const userRole = user.role;
  const userId = user._id;

  if (userRole === 'user') {
    return {
      $or: [
        { recipient: userId },
        { recipient: { $in: [null, undefined] }, role: 'all' },
        { recipient: { $in: [null, undefined] }, role: 'user' }
      ]
    };
  }

  // Admin / Reviewers / Staff: include direct messages, their role broadcasts, and generic broadcasts
  const roles = [userRole, 'all'];
  if (userRole === 'superadmin') roles.push('admin');

  return {
    $or: [
      { recipient: userId },
      { role: { $in: roles } }
    ]
  };
};

// @route   GET /api/notifications
// @desc    Get user and role-specific notifications
// @access  Private
router.get('/', async (req, res) => {
  try {
    const query = buildNotificationQuery(req.user);

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(40);

    const unreadCount = await Notification.countDocuments({
      ...query,
      isRead: false
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notifications'
    });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark single notification as read
// @access  Private
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ success: true, message: 'Notification marked as read', data: { notification } });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', async (req, res) => {
  try {
    const query = buildNotificationQuery(req.user);

    await Notification.updateMany(
      {
        ...query,
        isRead: false
      },
      { isRead: true }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
