import mongoose from 'mongoose';

const gstSchema = new mongoose.Schema({
  gstName: {
    type: String,
    required: true,
  },
  gstRate: {
    type: Number,
    required: true,
  },
});

const Gst = mongoose.models.Gst || mongoose.model('Gst', gstSchema);

export default Gst;
