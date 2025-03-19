import connectDB from "../../../app/lib/dbconnect";
import Captain from "../../../models/Captain";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const captains = await Captain.find();
      res.status(200).json(captains);
    } catch (error) {
      res.status(500).json({ message: "Error fetching captains" });
    }
  } else if (req.method === "POST") {
    try {
      const { name } = req.body;
      const newCaptain = new Captain({ name });
      await newCaptain.save();
      res.status(201).json(newCaptain);
    } catch (error) {
      res.status(500).json({ message: "Error adding captain" });
    }
  }
}
