import dbConnect from '../../app/lib/dbconnect';
import CartTotalModel from '../../models/CartTotal';
import OrderModel from '../../models/Order'; // Import the Order model
import jwt from 'jsonwebtoken'; // Import the JWT library

export default async function handler(req, res) {
  await dbConnect(); // Connect to the database

  if (req.method === 'GET') {
    try {
      
      const token = req.headers.authorization?.split(' ')[1]; 

      if (!token) {
        return res.status(401).json({ success: false, message: 'Token is required' });
      }

      try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { userId } = decoded; // Extract userId from the decoded token

        if (!userId) {
          return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        // Fetch the latest cart for the user
        const cartTotal = await CartTotalModel.findOne({ userId }).sort({ createdAt: -1 });

        if (!cartTotal) {
          return res.status(404).json({ success: false, message: 'No cart found' });
        }

        // Fetch the latest order associated with the user
        const order = await OrderModel.findOne({ user: userId }).sort({ createdAt: -1 });
        let selectedAddressId;
        if (order) {
          selectedAddressId = order.selectedAddress;
        }else{
          selectedAddressId = null;
        };

        // Extract the selected address ID from the order
        

        // Respond with the cart total and the selected address ID
        res.status(200).json({
          success: true,
          cartTotal,
          selectedAddressId,
        });

      } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token', error: error.message });
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error fetching cart', error: error.message });
    }
  }

  // Handle POST request to update the selected address
  if (req.method === 'POST') {
    try {
      // Extract token from the Authorization header
      const token = req.headers.authorization?.split(' ')[1]; // Get token after "Bearer"

      if (!token) {
        return res.status(401).json({ success: false, message: 'Token is required' });
      }

      try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { userId } = decoded; // Extract userId from the decoded token

        if (!userId) {
          return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        // Get the new selected address ID from the request body
        const { addressId } = req.body;

        if (!addressId) {
          return res.status(400).json({ success: false, message: 'Address ID is required' });
        }

        // Fetch the order for the user
        const order = await OrderModel.findOne({ user: userId }).sort({ createdAt: -1 });

        if (!order) {
          return res.status(404).json({ success: false, message: 'No order found for the user' });
        }

        // Update the selected address in the order
        order.selectedAddress = addressId;
        await order.save();

        // Respond with success
        res.status(200).json({ success: true, message: 'Selected address updated successfully' });

      } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token', error: error.message });
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error updating selected address', error: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
