import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId, // Use ObjectId for referencing
    ref: 'OrderPayment', // Reference to the OrderPayment model
    required: true,
  },
  reviews: [
    {
      item: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        default: null, // Set default to null for optional rating
        min: 1,
        max: 5,
      },
    },
  ],
  comment: {
    type: String,
    default: null, // Set default to null for optional comment
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
