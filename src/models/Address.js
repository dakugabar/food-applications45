import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Assuming you have a User model
  },
  location: {
    type: String,
    required: true,
  },
  flatNo: {
    type: String,
    required: true,
  },
  landmark: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Address = mongoose.models.Address || mongoose.model('Address', AddressSchema);

export default Address;
