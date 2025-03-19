import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  // Define your order schema here
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  selectedAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
  },
  carttotal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CartTotal',
  },
  
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
