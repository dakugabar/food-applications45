import connectDB from "../../app/lib/dbconnect";
import Vectory from "../../models/vectory";
import Captain from "../../models/hotelverter"; // Captain model
import Table from "../../models/Table"; // Table model
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

    // Find the captain using the provided ID
    const existingCaptain = await Captain.findById(captain);
    if (!existingCaptain) {
      return res.status(404).json({ message: "Captain not found" });
    }

    // Fetch assigned tables from Vectory
    const vectoryData = await Vectory.findOne({ captain: new mongoose.Types.ObjectId(captain) }).select("tables");

    if (!vectoryData || !vectoryData.tables || vectoryData.tables.length === 0) {
      return res.status(200).json({ tables: [], message: "No tables assigned to this captain" });
    }

    // Fetch detailed table information using table names
    const tables = await Table.find(
      { tableName: { $in: vectoryData.tables } }, // Match tableName with tables array
      "tableName seatNumber status" // Select only necessary fields
    );

    if (!tables || tables.length === 0) {
      return res.status(200).json({ tables: [], message: "Assigned tables not found in the database" });
    }

    res.status(200).json({ tables });

  } catch (error) {
    console.error("Error fetching tables:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
