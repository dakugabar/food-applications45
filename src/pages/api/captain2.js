

import dbConnect from "../../app/lib/dbconnect";
import Captain from "../../models/captain"; // Ensure correct import

export default async function handler(req, res) {
  await dbConnect(); // Connect to MongoDB

  if (req.method === "GET") {
    try {
      const captains = await Captain.find({}, "name"); // Fetch only names
      return res.status(200).json({ success: true, data: captains });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  } else {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
}
