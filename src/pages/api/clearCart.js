import dbConnect from '../../app/lib/dbconnect';
import Cart from '../../models/Cart';
import verifyToken from '../../app/utils/verifyToken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token found' });
    }

    const decodedToken = verifyToken(token);
    if (!decodedToken || !decodedToken.userId) {
      return res.status(400).json({ success: false, message: 'Invalid token or user ID' });
    }

    const userId = decodedToken.userId;

    // Clear the cart items for the user
    const result = await Cart.deleteMany({ userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'No cart items found for this user' });
    }

    return res.status(200).json({ success: true, message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return res.status(500).json({ success: false, message: 'Error clearing cart', details: error.message });
  }
}
