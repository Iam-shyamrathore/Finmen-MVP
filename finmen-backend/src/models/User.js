const mongoose = require('mongoose');

     const userSchema = new mongoose.Schema({
       email: { type: String, required: true, unique: true },
       password: { type: String, required: false }, // Make password optional for Google users
       name: { type: String, required: false }, // Add name field for Google users
       googleId: { type: String, required: false }, // Add Google ID field
       profilePicture: { type: String, required: false }, // Add profile picture URL
       authProvider: { type: String, enum: ['local', 'google'], default: 'local' }, // Track auth method
       role: { type: String, enum: ['student', 'educator'], default: 'student' },
       createdAt: { type: Date, default: Date.now },
       dataConsent: { type: Boolean, default: false }, // DPDP Act compliance
     });

     module.exports = mongoose.model('User', userSchema);