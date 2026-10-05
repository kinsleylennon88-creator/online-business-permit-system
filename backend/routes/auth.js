const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendEmail, emailTemplates } = require('../utils/emailService');
const { logAuditEvent } = require('../utils/auditLogger');

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production', {
    expiresIn: '24h'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail({ gmail_remove_dots: false }).withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('phone')
    .customSanitizer(val => {
      if (typeof val !== 'string') return val;
      let clean = val.replace(/[\s-+()]/g, '');
      if (clean.startsWith('63')) clean = '0' + clean.slice(2);
      return clean;
    })
    .matches(/^09\d{9}$/).withMessage('Please provide a valid 11-digit Philippine mobile number (e.g. 09123456789)'),
  body('gender').optional().isIn(['male', 'female', 'prefer_not_to_say']).withMessage('Invalid gender option'),
  body('address.barangay').notEmpty().withMessage('Please select your Barangay')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res.status(400).json({
        success: false,
        message: firstError.msg || 'Validation errors',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, password, phone, gender, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      await logAuditEvent(req, {
        action: 'registration_failed',
        entityType: 'auth',
        result: 'failure',
        details: { email, reason: 'User already exists' }
      });

      return res.status(400).json({
        success: false,
        message: 'A user account with this email address already exists'
      });
    }

    // Create new user (Strictly enforce default role 'user'; never trust client role)
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      phone,
      gender: gender || 'prefer_not_to_say',
      address,
      role: 'user'
    });

    // Generate token
    const token = generateToken(user._id);

    await logAuditEvent(req, {
      action: 'registration_success',
      entityType: 'user',
      entityId: user._id.toString(),
      result: 'success',
      actorOverride: user,
      details: { email: user.email, role: user.role }
    });

    // Send welcome email
    try {
      await sendEmail(emailTemplates.welcome(user));
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          address: user.address,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail({ gmail_remove_dots: false }).withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      await logAuditEvent(req, {
        action: 'login_failed',
        entityType: 'auth',
        result: 'failure',
        details: { email, reason: 'User not found' }
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      await logAuditEvent(req, {
        action: 'login_failed',
        entityType: 'auth',
        result: 'failure',
        actorOverride: user,
        details: { email, reason: 'Incorrect password' }
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    await logAuditEvent(req, {
      action: 'login_success',
      entityType: 'auth',
      entityId: user._id.toString(),
      result: 'success',
      actorOverride: user,
      details: { email: user.email, role: user.role }
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          address: user.address,
          role: user.role,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          address: user.address,
          role: user.role,
          profilePicture: user.profilePicture,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user profile'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().matches(/^09\d{9}$/).withMessage('Please provide a valid Philippine mobile number'),
  body('gender').optional().isIn(['male', 'female', 'prefer_not_to_say']).withMessage('Invalid gender option'),
  body('address.barangay').optional().notEmpty().withMessage('Barangay cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { firstName, lastName, phone, gender, address } = req.body;
    const user = await User.findById(req.user.id);

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;
    if (address) user.address = { ...user.address, ...address };

    await user.save();

    await logAuditEvent(req, {
      action: 'profile_updated',
      entityType: 'user',
      entityId: user._id.toString(),
      result: 'success',
      details: { updatedFields: Object.keys(req.body) }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          address: user.address,
          role: user.role,
          profilePicture: user.profilePicture
        }
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      await logAuditEvent(req, {
        action: 'password_change_failed',
        entityType: 'auth',
        entityId: user._id.toString(),
        result: 'failure',
        details: { reason: 'Incorrect current password' }
      });

      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    await logAuditEvent(req, {
      action: 'password_changed',
      entityType: 'user',
      entityId: user._id.toString(),
      result: 'success'
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
});

module.exports = router;
