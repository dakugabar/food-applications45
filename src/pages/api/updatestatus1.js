import dbConnect from "../../app/lib/dbconnect";
import Table from "../../models/Table"; // Ensure the correct path

export default async function handler(req, res) {
  if (req.method === "PATCH") {
    try {
      const { tableName, status } = req.body;

      // Connect to the database
      await dbConnect();

      // Find and update the table status
      const updatedTable = await Table.findOneAndUpdate(
        { tableName },
        { status },
        { new: true }
      );

      if (!updatedTable) {
        return res.status(404).json({ message: "Table not found" });
      }

      return res.status(200).json({ message: "Table status updated successfully", table: updatedTable });
    } catch (error) {
      console.error("Error updating table status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
