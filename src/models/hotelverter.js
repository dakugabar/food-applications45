//model- captain.js
import mongoose from "mongoose";

const CaptainSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

// Use existing model if already defined
const Captain = mongoose.models.Captain || mongoose.model("Captain", CaptainSchema);

export default Captain;
