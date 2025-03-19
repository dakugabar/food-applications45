import { sign } from 'jsonwebtoken';
import { serialize } from 'cookie';
import loginadmin from '../../models/loginadmin';
import dbConnect from '../../app/lib/dbconnect'; // Ensure your DB connection file exists

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  try {
    await dbConnect();
    const admin = await loginadmin.findOne({ username, password });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token and set as cookie
    const token = sign({ adminId: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.setHeader(
      'Set-Cookie',
      serialize('adminId', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600,
        path: '/',
      })
    );

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}
