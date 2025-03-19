
import dbConnect from "../../app/lib/dbconnect";
import Vectory from "../../models/vectory";

export default async function handler(req, res) {
  await dbConnect();

  switch (req.method) {
    case "GET":
      try {
        const captains = await Vectory.find();
        res.status(200).json({ success: true, data: captains });
      } catch (error) {
        res.status(400).json({ success: false, message: "Failed to fetch captains" });
      }
      break;

    case "POST":
      try {
        const { name, pin, tables } = req.body;

        if (!name || !pin || pin.length !== 4) {
          return res.status(400).json({ success: false, message: "Captain name and valid 4-digit PIN required." });
        }

        const existingCaptain = await Vectory.findOne({ name });
        if (existingCaptain) {
          return res.status(400).json({ success: false, message: "Captain already assigned." });
        }

        const newCaptain = new Vectory({ name, pin, tables });
        await newCaptain.save();

        res.status(201).json({ success: true, message: "Captain assigned successfully", data: newCaptain });
      } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
      }
      break;

    case "PUT":
      try {
        const { id, name, pin, tables } = req.body;

        const updatedCaptain = await Vectory.findByIdAndUpdate(id, { name, pin, tables }, { new: true });

        if (!updatedCaptain) {
          return res.status(404).json({ success: false, message: "Captain not found" });
        }

        res.status(200).json({ success: true, message: "Captain updated successfully", data: updatedCaptain });
      } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
      }
      break;

    case "DELETE":
      try {
        const { id } = req.body;

        const deletedCaptain = await Vectory.findByIdAndDelete(id);

        if (!deletedCaptain) {
          return res.status(404).json({ success: false, message: "Captain not found" });
        }

        res.status(200).json({ success: true, message: "Captain deleted successfully" });
      } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
      }
      break;

    default:
      res.status(405).json({ success: false, message: "Method not allowed" });
      break;
  }
}
