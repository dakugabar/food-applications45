// models/vectory.js
import mongoose from "mongoose";

const VectorySchema = new mongoose.Schema({
  captain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'hotelverter',
    required: true
  },
  tables: {
    type: [String],
    default: []
  }
}, { timestamps: true });

export default mongoose.models.Vectory || mongoose.model("Vectory", VectorySchema);