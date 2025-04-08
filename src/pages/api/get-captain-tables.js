import dbConnect from "../../app/lib/dbconnect";
import Vectory from "../../models/vectory";



export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    try {
      const { captain, tables } = req.body;

      // Ensure captain ID is provided
      if (!captain) {
        return res.status(400).json({ message: "Captain ID is required" });
      }

      // Create new vectory record
      const vectory = new Vectory({
        captain,
        tables: tables || [],
      });

      await vectory.save();

      return res.status(201).json({ success: true, data: vectory });

    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  res.status(405).json({ message: "Method not allowed" });
}
