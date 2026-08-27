const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// @route   GET /api/user/saved-locations
// @desc    Get user's saved favorite locations
router.get('/saved-locations', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      savedLocations: user.savedLocations || []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   POST /api/user/saved-locations
// @desc    Add a location to saved favorites
router.post('/saved-locations', async (req, res) => {
  try {
    const { name, country, admin1, lat, lon, customLabel } = req.body;

    if (!name || lat === undefined || lon === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, latitude, and longitude are required'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check for duplicate location (same coords roughly or name)
    const exists = user.savedLocations.some(
      loc => (Math.abs(loc.lat - lat) < 0.05 && Math.abs(loc.lon - lon) < 0.05) || loc.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'This location is already saved in your favorites'
      });
    }

    user.savedLocations.push({
      name,
      country: country || '',
      admin1: admin1 || '',
      lat: Number(lat),
      lon: Number(lon),
      customLabel: customLabel || ''
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Location saved to favorites',
      savedLocations: user.savedLocations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/user/saved-locations/:locationId
// @desc    Remove a saved favorite location
router.delete('/saved-locations/:locationId', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.savedLocations = user.savedLocations.filter(
      loc => loc._id.toString() !== req.params.locationId
    );

    await user.save();

    res.json({
      success: true,
      message: 'Location removed from favorites',
      savedLocations: user.savedLocations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/user/alert-settings
// @desc    Update user AQI alert settings
router.put('/alert-settings', async (req, res) => {
  try {
    const { enabled, aqiThreshold, receiveEmail } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (enabled !== undefined) user.alertSettings.enabled = enabled;
    if (aqiThreshold !== undefined) user.alertSettings.aqiThreshold = Number(aqiThreshold);
    if (receiveEmail !== undefined) user.alertSettings.receiveEmail = receiveEmail;

    await user.save();

    res.json({
      success: true,
      message: 'Alert settings updated',
      alertSettings: user.alertSettings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
