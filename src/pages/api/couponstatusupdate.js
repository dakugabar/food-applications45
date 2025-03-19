// pages/api/cart/updateCartTotal.js

import dbConnect from '../../app/lib/dbconnect';
import CartTotal from '../../models/CartTotal'; // Adjust the import path as necessary
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET; // Ensure you have a JWT secret in your environment variables

export default async function handler(req, res) {
  await dbConnect(); // Connect to the database

  if (req.method === 'POST') {
    const { token } = req.body; // Expecting token in the request body
    
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required.' });
    }

    try {
      // Decode the token to get userId
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId; // Adjust based on your token structure

      // Find the latest CartTotal entry for the user and check for the couponId
      const cartTotal = await CartTotal.findOne({ userId: userId })
        .sort({ createdAt: -1 }); // Find the most recent cart

      if (!cartTotal) {
        return res.status(404).json({ success: false, message: 'Cart total not found for the user.' });
      }

      // Check if couponId is null and set the couponStatus to 'inactive' if it is
      let newCouponStatus = 'active'; // Default to 'active'

      if (!cartTotal.couponId) {
        newCouponStatus = 'inactive'; // Set to 'inactive' if couponId is null
      }

      // Update the coupon status
      const updatedCartTotal = await CartTotal.findOneAndUpdate(
        { _id: cartTotal._id }, // Update the specific CartTotal document
        { couponStatus: newCouponStatus }, // Update coupon status based on the condition
        { new: true } // Return the updated document
      );

      return res.status(200).json({
        success: true,
        message: `Coupon status updated to ${newCouponStatus} successfully.`,
        data: updatedCartTotal,
      });
    } catch (error) {
      console.error('Error updating coupon status:', error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Invalid token.' });
      }
      return res.status(500).json({ success: false, message: 'Server error while updating coupon status.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }
}
