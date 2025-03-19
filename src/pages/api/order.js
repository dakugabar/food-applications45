import dbConnect from '../../app/lib/dbconnect';
import OrderPayment from '../../models/OrderPayment';
import Cart from '../../models/Cart';
import Address from '../../models/Address';
import Order from '../../models/Order';
import CartTotal from '../../models/CartTotal';
import Item from '../../models/item'
import jwt from 'jsonwebtoken';


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { paymentMethod, UTR } = req.body;
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    // Verify token
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

    // Fetch user's cart items
    const cartItems = await Cart.find({ userId }).populate('foodId');
    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No items found in cart.' });
    }

    // Get the user's latest order
    const existingOrder = await Order.findOne({ user: userId }).sort({ date: -1 });

    if (!existingOrder || !existingOrder.selectedAddress) {
      return res.status(400).json({ success: false, message: 'No address found for the user.' });
    }

    const { selectedAddress: selectedAddressId, carttotal: cartTotalId } = existingOrder;

    // Verify that the selected address exists
    const address = await Address.findById(selectedAddressId);
    if (!address) {
      return res.status(400).json({ success: false, message: 'Selected address not found.' });
    }

    // Verify that the cart total exists
    const cartTotal = await CartTotal.findById(cartTotalId);
    if (!cartTotal) {
     
      return res.status(400).json({ success: false, message: `CartTotal with ID ${cartTotalId} not found.` });
    }

    const totalAmount = cartTotal. total; // Correctly access the total amount
    const itemDiscount = cartTotal. itemDiscount;
    const couponDiscount = cartTotal. couponDiscount;
    const totalGst = cartTotal. totalGst;
    const deliveryFee = cartTotal. deliveryFee;
    const subtotal = cartTotal.subtotal;
    // Validate UPI payment
    if (paymentMethod === 'UPI') {
      if (!UTR || UTR.length !== 12) {
        return res.status(400).json({
          success: false,
          message: 'A valid 12-digit UTR number is required for UPI payments.',
        });
      }

      // Check if UTR already exists
      const existingUTR = await OrderPayment.findOne({ UTR });
      if (existingUTR) {
        return res.status(400).json({
          success: false,
          message: 'UTR already exists. Please provide a valid UTR.',
        });
      }
    }

    // Create new order payment
    const newOrderPayment = new OrderPayment({
      user: userId,
      selectedAddress: selectedAddressId,
      items: cartItems.map((cartItem) => ({
        foodId: cartItem.foodId._id,
        quantity: cartItem.quantity,
        price: cartItem.foodId.price,
      })),
      totalAmount,
      totalGst,
      couponDiscount,
      itemDiscount,
      paymentMethod,
      deliveryFee,
      subtotal,
      UTR: paymentMethod === 'CashOnDelivery' ? null : UTR,
      paymentStatus: paymentMethod === 'CashOnDelivery' ? 'Cash on Delivery' : 'Paid',
    });

    await newOrderPayment.save();

    // Clear the user's cart
    await Cart.deleteMany({ userId });

    return res.status(201).json({
      success: true,
      message: 'Order payment created successfully.',
      orderPayment: newOrderPayment,
    });

  } catch (error) {
   
    return res.status(500).json({
      success: false,
      message: 'Failed to create order payment. Please try again later.',
    });
  }
}
