const mongoose = require('mongoose');

const SavedLocationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, default: '' },
  admin1: { type: String, default: '' },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  customLabel: { type: String, default: '' },
  savedAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6
  },
  savedLocations: [SavedLocationSchema],
  alertSettings: {
    enabled: { type: Boolean, default: true },
    aqiThreshold: { type: Number, default: 100 }, // Alert if AQI > 100 (Unhealthy for Sensitive)
    receiveEmail: { type: Boolean, default: false }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
