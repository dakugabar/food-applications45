import connectDB from "../../app/lib/dbconnect";
import Vectory from "../../models/vectory";
import Captain from "../../models/hotelverter";
import Table from "../../models/Table"; // Import the Table model
import mongoose from "mongoose";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { captain } = req.query;

  if (!captain || !mongoose.Types.ObjectId.isValid(captain)) {
    return res.status(400).json({ message: "Invalid Captain ID" });
  }

  try {
    await connectDB();

    // Find the captain to ensure the ID is valid
    const existingCaptain = await Captain.findById(captain);
    if (!existingCaptain) {
      return res.status(404).json({ message: "Captain not found" });
    }

    // Find the vectory data for the given captain
    const vectoryData = await Vectory.findOne({ captain: new mongoose.Types.ObjectId(captain) }).select("tables");

    if (!vectoryData || !vectoryData.tables.length) {
      return res.status(200).json({ tables: [] });
    }

    // Find table details
    const tableDetails = await Table.find({ _id: { $in: vectoryData.tables } }).select("tableName seatNumber status");

    res.status(200).json({ tables: tableDetails });

  } catch (error) {
    console.error("Error fetching tables:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
