import express from 'express';
import jwt from 'jsonwebtoken';
import twilio from 'twilio';
import { v4 as uuidv4 } from 'uuid';
import { dbHelpers } from '../database/sqlite.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Initialize Twilio client only if credentials are properly configured
let client = null;
if (process.env.TWILIO_ACCOUNT_SID && 
    process.env.TWILIO_AUTH_TOKEN && 
    process.env.TWILIO_ACCOUNT_SID !== 'demo_account_sid' &&
    process.env.TWILIO_AUTH_TOKEN !== 'demo_auth_token') {
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Normalize phone number
const normalizePhoneNumber = (phone) => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If it's 10 digits, assume US number and add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // If it's 11 digits and starts with 1, add +
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  // If it already has country code, return as is
  if (digits.length > 10) {
    return `+${digits}`;
  }
  
  // Return original if we can't normalize
  return phone;
};

// Validate phone number
const isValidPhoneNumber = (phone) => {
  const normalizedPhone = normalizePhoneNumber(phone);
  // Basic validation: should start with + and have at least 10 digits
  const phoneRegex = /^\+\d{10,15}$/;
  return phoneRegex.test(normalizedPhone);
};

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    console.log('📞 Send OTP request received:', req.body);
    
    let { phone } = req.body;

    if (!phone) {
      console.log('❌ No phone number provided');
      return res.status(400).json({ error: 'Phone number is required' });
    }

    console.log('📱 Original phone:', phone);

    // Normalize and validate phone number
    phone = normalizePhoneNumber(phone);
    console.log('📱 Normalized phone:', phone);
    
    if (!isValidPhoneNumber(phone)) {
      console.log('❌ Invalid phone format:', phone);
      return res.status(400).json({ 
        error: 'Invalid phone number format. Please enter a valid phone number.' 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    console.log('🔢 Generated OTP:', otp);
    console.log('⏰ Expires at:', expiresAt);

    try {
      // Remove any existing OTP for this phone
      console.log('🗑️ Removing existing OTPs for phone:', phone);
      await dbHelpers.deleteOTPsByPhone(phone);

      // Save OTP to database
      const otpData = {
        id: uuidv4(),
        phone,
        code: otp,
        expiresAt: expiresAt.toISOString()
      };
      
      console.log('💾 Saving OTP to database:', otpData);
      await dbHelpers.createOTP(otpData);
      console.log('✅ OTP saved to database successfully');
    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      return res.status(500).json({ 
        error: 'Database error while saving OTP',
        details: process.env.NODE_ENV !== 'production' ? dbError.message : undefined
      });
    }

    // Send OTP via Twilio (in development, we'll just log it)
    let otpSent = false;
    let twilioError = null;

    if (process.env.NODE_ENV === 'production' && client && process.env.TWILIO_PHONE_NUMBER) {
      try {
        console.log('📤 Sending OTP via Twilio...');
        await client.messages.create({
          body: `Your AviConnect verification code is: ${otp}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone
        });
        otpSent = true;
        console.log(`✅ OTP sent via Twilio to ${phone}: ${otp}`);
      } catch (error) {
        console.error('❌ Twilio error:', error.message);
        twilioError = error.message;
        // Continue with development mode
      }
    }

    if (!otpSent) {
      console.log(`📱 Development Mode - OTP for ${phone}: ${otp}`);
      console.log(`⏰ Expires at: ${expiresAt.toLocaleString()}`);
      console.log('🔧 To enable SMS, set NODE_ENV=production and configure Twilio credentials');
    }

    const response = { 
      message: 'OTP sent successfully',
      development: process.env.NODE_ENV !== 'production',
      phone: phone,
      ...(process.env.NODE_ENV !== 'production' && { otp, expiresAt }) // Include OTP in development
    };

    console.log('✅ Sending success response:', response);
    res.json(response);
  } catch (error) {
    console.error('❌ Send OTP error:', error);
    res.status(500).json({ 
      error: 'Failed to send OTP',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Verify OTP and Login/Register
router.post('/verify-otp', async (req, res) => {
  try {
    console.log('🔐 Verify OTP request received:', req.body);
    
    let { phone, otp, name } = req.body;

    if (!phone || !otp) {
      console.log('❌ Missing phone or OTP');
      return res.status(400).json({ error: 'Phone and OTP are required' });
    }

    // Normalize phone number
    phone = normalizePhoneNumber(phone);
    console.log('📱 Normalized phone for verification:', phone);

    if (!isValidPhoneNumber(phone)) {
      console.log('❌ Invalid phone format for verification:', phone);
      return res.status(400).json({ 
        error: 'Invalid phone number format' 
      });
    }

    // Find and verify OTP
    console.log('🔍 Looking for valid OTP:', { phone, otp });
    const otpDoc = await dbHelpers.findValidOTP(phone, otp);

    if (!otpDoc) {
      console.log('❌ No valid OTP found');
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    console.log('✅ Valid OTP found:', otpDoc);

    // Check if user exists
    let user = await dbHelpers.findUserByPhone(phone);

    // 🛡️ Only mark OTP as used after checking name (for new users)
    if (!user) {
      if (!name || name.trim().length === 0) {
        console.log('❌ Name required for new user');
        return res.status(400).json({ error: 'Name is required for new users' });
      }

      console.log('👤 Creating new user');
      const userData = {
        id: uuidv4(),
        phone,
        name: name.trim(),
        isVerified: true
      };
      user = await dbHelpers.createUser(userData);
      console.log('✅ New user created:', user);
    } else {
      console.log('👤 Existing user found, updating status');
      await dbHelpers.updateUser(user.id, {
        isVerified: true,
        isOnline: true
      });
      user = await dbHelpers.findUserById(user.id);
      console.log('✅ User updated:', user);
    }

    // ✅ Now it's safe to mark OTP as used
    await dbHelpers.markOTPAsUsed(otpDoc.id);
    console.log('✅ OTP marked as used');

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '30d' }
    );

    console.log('🎫 JWT token generated');

    const response = {
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        avatar: user.avatar,
        status: user.status,
        isOnline: user.isOnline
      }
    };

    console.log('✅ Sending verification success response');
    res.json(response);
  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    res.status(500).json({ 
      error: 'Failed to verify OTP',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});


// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await dbHelpers.findUserById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Logout
router.post('/logout', auth, async (req, res) => {
  try {
    await dbHelpers.updateUserStatus(req.userId, req.user.status, false, new Date().toISOString());
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

export default router;