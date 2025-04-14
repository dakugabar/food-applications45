// model - captain.js
import mongoose from "mongoose";

const CaptainSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true ,
    unique: true,
  },
  pin: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 4,
    validate: {
      validator: function(v) {
        return /^\d{4}$/.test(v); // Ensure it's exactly 4 digits
      },
      message: props => `${props.value} is not a valid 4-digit PIN!`
    },
    unique: true,
  },
  

});

// Use existing model if already defined
const Captain = mongoose.models.Captain || mongoose.model("Captain", CaptainSchema);

export default Captain;