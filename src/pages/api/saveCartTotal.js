// pages/api/cart/saveCartTotal.js

import dbConnect from '../../app/lib/dbconnect'; // Adjust path as necessary
import CartTotal from '../../models/CartTotal'; // Adjust to your CartTotal model
import jwt from 'jsonwebtoken'; // Import the JWT library

// Replace with your actual secret used to sign the JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;

  switch (method) {
    case 'POST':
      try {
        // Extract the token from the Authorization header
        const token = req.headers.authorization?.split(' ')[1];
        // Adjust based on your token payload
        if (!token) {
            return res.status(400).json({ success: false, message: 'Token is required.' });
          }
    
          // Try-catch block to handle token verification errors
          let decodedToken;
          try {
            decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Replace with your JWT secret
          } catch (err) {
            return res.status(401).json({ success: false, message: 'Invalid or expired token' });
          }
    
          const userId = decodedToken.userId;// Adjust based on your token payload

        // Destructure the other fields from the request body
        const {
          subtotal,
          itemDiscount,
          couponDiscount,
          deliveryFee,
          totalGst,
          total,
          couponId,
          couponStatus, // Include couponStatus here
        } = req.body;

        // Create a new cartTotal entry
        const cartTotal = new CartTotal({
          userId,
          subtotal,
          itemDiscount,
          couponDiscount,
          deliveryFee,
          totalGst,
          total,
          couponId,
          couponStatus: 'inactive', // Default to 'inactive' if not provided
        });

        await cartTotal.save();

        return res.status(201).json({ success: true, cartTotal });
      } catch (error) {
        // Handle token verification errors
        if (error.name === 'JsonWebTokenError') {
          return res.status(401).json({ success: false, message: 'Invalid token' });
        }
        return res.status(500).json({ success: false, message: error.message });
      }
    default:
      return res.status(405).end(); // Method Not Allowed
  }
}
