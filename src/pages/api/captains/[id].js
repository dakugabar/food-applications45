import connectDB from "../../../app/lib/dbconnect";
import Captain from "../../../models/Captain";

export default async function handler(req, res) {
  await connectDB();

  const { id } = req.query;

  if (req.method === "PUT") {
    try {
      const { name } = req.body;
      const updatedCaptain = await Captain.findByIdAndUpdate(id, { name }, { new: true });
      if (!updatedCaptain) return res.status(404).json({ message: "Captain not found" });
      res.status(200).json(updatedCaptain);
    } catch (error) {
      res.status(500).json({ message: "Error updating captain" });
    }
  } else if (req.method === "DELETE") {
    try {
      await Captain.findByIdAndDelete(id);
      res.status(200).json({ message: "Captain deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting captain" });
    }
  }
}
