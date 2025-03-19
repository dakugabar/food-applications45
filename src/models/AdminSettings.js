import mongoose from 'mongoose';

const AdminSettingsSchema = new mongoose.Schema({
  adminLocation: {
    type: String,
    required: true,
    default: '26.9124,75.7873' // Default location (latitude,longitude)
  },
  distanceThreshold: {
    type: Number,
    required: true,
    default: 12 // Default distance in km
  }
});

const AdminSettings = mongoose.models.AdminSettings || mongoose.model('AdminSettings', AdminSettingsSchema);

export default AdminSettings;
