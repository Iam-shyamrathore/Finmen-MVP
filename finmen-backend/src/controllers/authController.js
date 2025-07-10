const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.register = async (req, res) => {
  try {
    console.log('Register Request:', req.body);

    const {
      email,
      password,
      name,
      role = 'student',
      dataConsent
    } = req.body;

    if (typeof dataConsent !== 'boolean') {
      return res.status(400).json({ msg: 'dataConsent must be true or false (boolean)' });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      role,
      dataConsent,
      authProvider: 'local'
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        dataConsent: newUser.dataConsent
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email, password });
  try {
    const user = await User.findOne({ email });
    console.log('User found:', user);
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    // Check if user registered with Google
    if (user.authProvider === 'google') {
      return res.status(400).json({ msg: 'Please use Google Sign In' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.googleAuth = async (req, res) => {
  const { idToken } = req.body;
  
  try {
    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ 
      $or: [{ email }, { googleId }] 
    });

    if (user) {
      // Update existing user with Google info if needed
      if (!user.googleId) {
        user.googleId = googleId;
        user.name = name;
        user.profilePicture = picture;
        user.authProvider = 'google';
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        email,
        googleId,
        name,
        profilePicture: picture,
        authProvider: 'google'
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name,
        profilePicture: user.profilePicture
      } 
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(400).json({ msg: 'Invalid Google token' });
  }
};