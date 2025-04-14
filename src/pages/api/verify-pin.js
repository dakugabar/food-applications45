import  dbConnect from "../../app/lib/dbconnect";

import Captain from "../../models/hotelverter.js";



export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { pin } = req.body;

    if (!pin || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({ message: "Valid 4-digit PIN is required" });
    }

    // Check if captain exists
    const captain = await Captain.findOne({ pin });

    if (!captain) {
      return res.status(404).json({ message: "Invalid PIN" });
    }

    // Success
    return res.status(200).json({
      message: "Login successful",
      captain: { _id: captain._id, name: captain.name }
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}
