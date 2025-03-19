// models/CartTotal.js

import mongoose from 'mongoose';

const CartTotalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model
  subtotal: { type: Number, required: true },
  itemDiscount: { type: Number, required: true },
  couponDiscount: { type: Number, default: 0 },
  deliveryFee: { type: Number, required: true },
  totalGst: { type: Number, default: 0 },
  total: { type: Number, required: true },
  couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', default: null }, 
  couponStatus: { 
    type: String, 
    default: 'inactive',  // Set default coupon status to 'inactive'
    enum: ['inactive','active'] // Coupon status options
  },
}, { timestamps: true });

export default mongoose.models.CartTotal || mongoose.model('CartTotal', CartTotalSchema);
