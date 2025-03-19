import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  title: { // New field for title
    type: String,
    required: true, // Optional: Set to true if you want to make it a required field
  },
  status: {
    type: String,
    enum: ['active', 'inActive', 'blocked'], // Define the allowed status values
    default: 'active', // Set the default status value
  },
});

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
