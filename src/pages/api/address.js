import dbConnect from '../../app/lib/dbconnect';
import Address from '../../models/Address';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { token, location, flatNo, landmark } = req.body;

   

    // Validate request body
    if (!token || !location || !flatNo) {
      return res.status(400).json({ success: false, message: 'Token, location, and flatNo are required.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }

    const userId = decoded?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Invalid token. User ID not found.' });
    }

    // Create and save new address
    const newAddress = new Address({
      userId,
      location,
      flatNo,
      landmark,
    });

    await newAddress.save();

    return res.status(201).json({ success: true, message: 'Delivery information saved successfully!',address: newAddress});
  } catch (error) {
   
    return res.status(500).json({ success: false, message: 'Failed to save delivery information. Please try again later.' });
  }
}
