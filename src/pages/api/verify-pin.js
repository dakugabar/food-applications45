import  dbConnect from "../../app/lib/dbconnect";

import Captain from "../../models/hotelverter.js";


export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { pin } = req.body;

    if (!pin) {
      return res.status(400).json({ message: "PIN is required" });
    }

    // Find captain by PIN
    const captain = await Captain.findOne({ pin });

    if (!captain) {
      return res.status(404).json({ message: "Invalid PIN" });
    }

    res.json({ captain: { _id: captain._id, name: captain.name } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
