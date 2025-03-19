import mongoose from 'mongoose';

const loginadminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

export default mongoose.models.loginadmin || mongoose.model('loginadmin', loginadminSchema);
