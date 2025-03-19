import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
   foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  quantity: { type: Number, default: 1, required: true },
}, { timestamps: true });

const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

export default Cart;
