import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  rate: {
    type: Number,
    required: true,
  },
  terms: {
    type: Object, // Change String to Object
    required: true,
},
  expiry: {
    type: Date,
    required: true,
  },
  usageLimit: {
    type: Number,
    required: true,
    min: 1,
  },
  cartPrice: {
    type: Number,
    required: true,
  },
  maxDiscount: {  // New field for Maximum Discount Price
    type: Number,
    required: true,
    default: 0,  // Set a default value if needed
  },
  status: {
    type: String,
    enum: ['active', 'inActive'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Method to check if the coupon is valid for a given cart price
CouponSchema.methods.isValid = function (cartTotal) {
  const currentDate = new Date();
  return (
    this.status === 'active' &&
    this.expiry > currentDate &&
    cartTotal >= this.cartPrice
  );
};

// Method to calculate the discount
CouponSchema.methods.applyDiscount = function (total) {
  if (this.isValid(total)) {
    const discountAmount = total * (this.rate / 100);
    // Ensure that the discount does not exceed the maximum discount limit
    const finalDiscount = this.maxDiscount > 0 ? Math.min(discountAmount, this.maxDiscount) : discountAmount;
    return total - finalDiscount;
  }
  return total; // No discount applied if invalid
};

export default mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
