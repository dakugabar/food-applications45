import mongoose from 'mongoose';

const DeliveryRangeSchema = new mongoose.Schema({
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  fee: { type: Number, required: true },
});

export default mongoose.models.DeliveryRange || mongoose.model('DeliveryRange', DeliveryRangeSchema);
