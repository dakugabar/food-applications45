import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true, unique: true },
  mobileNumber: { type: String, required: true, unique: true },
  isVerified: { type: Boolean, required: true, default: false},
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
