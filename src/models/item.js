import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  imageUrl: { type: String }, // Removed required: true as image might not always be uploaded
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, required: true },
  gstRate: { type: Number, required: true }, // GST rate field
  vegOrNonVeg: { type: String, enum: ['Veg', 'Non-Veg'], required: true }, // Veg or Non-Veg
});

export default mongoose.models.Item || mongoose.model('Item', ItemSchema);
