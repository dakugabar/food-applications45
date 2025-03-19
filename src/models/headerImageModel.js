// models/headerImageModel.js
import mongoose from 'mongoose';

const headerImageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  url: { type: String },
  imagePath: { type: String, required: true }, // URL to the uploaded image
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.HeaderImage || mongoose.model('HeaderImage', headerImageSchema);
