import mongoose from "mongoose";

const VectorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  pin: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 4,
  },
  tables: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

export default mongoose.models.Vectory || mongoose.model("Vectory", VectorySchema);
