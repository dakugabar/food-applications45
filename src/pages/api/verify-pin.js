import connectDB  from "../../app/lib/dbconnect";

import Captain from "../../models/hotelverter.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { pin } = req.body;

  if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    return res.status(400).json({ message: "Invalid PIN format" });
  }

  try {
    await connectDB();

    // Find captain by PIN
    const captain = await Captain.findOne({ pin });
    
    if (!captain) {
      return res.status(404).json({ message: "Invalid PIN" });
    }

    // Here you might want to fetch assigned tables or other data
    // For now, we'll just return the captain's name
    res.status(200).json({ 
      message: "Login successful",
      captain: { name: captain.name },
      tables: [] // You can populate this with actual table data
    });

  } catch (error) {
    console.error("PIN verification error:", error);
    res.status(500).json({ message: "Server error" });
  }
}