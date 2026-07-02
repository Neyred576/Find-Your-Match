import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', async (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  const storedPassword = process.env.ADMIN_PASSWORD_HASH;
  if (!storedPassword) {
    console.error('ADMIN_PASSWORD_HASH not configured in environment.');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    let isMatch = false;
    // If the stored string is a bcrypt hash, compare it securely
    if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, storedPassword);
    } else {
      // Otherwise allow plain text comparison for easier setup
      isMatch = password === storedPassword;
    }
    
    if (isMatch) {
      const token = jwt.sign(
        { role: 'admin', timestamp: Date.now() },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '8h' }
      );
      
      return res.status(200).json({ token });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
