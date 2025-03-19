// pages/api/cart/get.js
import dbConnect from '../../../app/lib/dbconnect';
import Cart from '../../../models/Cart';
import jwt from 'jsonwebtoken'; // Import jwt to decode the token

const handler = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];  // Get token from Authorization header (Bearer <token>)

  if (!token) {
    return res.status(401).json({ message: 'Token is required' });
  }

  try {
    // Decode the token to get the userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Use your JWT secret key
    const { userId } = decoded;  // Extract userId from decoded token

    await dbConnect();  // Connect to MongoDB

    // Find the cart for the given user and populate food details from the 'Item' collection
    const cart = await Cart.find({ userId })
      .populate('foodId', 'name price imageUrl')  // Populate food details (name, price, imageUrl) from the 'Item' collection
      .exec();

    if (!cart || cart.length === 0) {
      return res.status(200).json({ cartItems: [] });  // Return an empty array if cart is empty
    }

    // Format the response to include cart items with food details and quantity
    const cartItems = cart.map(item => ({
      foodId: item.foodId,
      quantity: item.quantity,
    }));

    return res.status(200).json({ cartItems });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({ message: 'Error fetching cart', error });
  }
};

export default handler;
