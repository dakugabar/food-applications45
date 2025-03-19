import mongoose from "mongoose";
import Tablesave from "../../models/tablesave"; // Adjust the path if necessary

// Ensure mongoose connection is established
async function connectToDatabase() {
  if (mongoose.connections[0].readyState) {
    return;
  }
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") { // Change to POST for status updates
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { tableId, status } = req.body;

  if (!tableId || !status) {
    return res.status(400).json({ message: "Missing tableId or status" });
  }

  try {
    // Connect to the database
    await connectToDatabase();

    // Find and update the status of the table using the tableId
    const updatedTable = await Tablesave.findByIdAndUpdate(
      tableId,
      { status }, // Update only the status field
      { new: true, runValidators: true }
    );

    if (!updatedTable) {
      return res.status(404).json({ message: "Table not found" });
    }

    // Return the updated table with success message
    res.status(200).json({ 
      message: "Table status updated successfully", 
      table: updatedTable 
    });
  } catch (error) {
    console.error("Error updating table status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
