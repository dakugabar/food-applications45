import dbConnect from "../../app/lib/dbconnect";
import Table from "../../models/Table";

const updateTableStatus = async (req, res) => {
  if (req.method === "PUT") {
    const { tableName, status } = req.body;

    // Debugging: Log incoming data
    console.log("Received update request:", req.body);

    // Validate input
    if (!tableName || !status || typeof tableName !== "string" || typeof status !== "string") {
      console.error("Invalid request data:", { tableName, status });
      return res.status(400).json({ message: "Table name and status are required" });
    }

    try {
      // Ensure database connection
      await dbConnect();

      // Update table status
      const updatedTable = await Table.findOneAndUpdate(
        { tableName: tableName },
        { status: status },
        { new: true } // Return the updated table
      );

      if (!updatedTable) {
        console.warn(`Table not found: ${tableName}`);
        return res.status(404).json({ message: "Table not found" });
      }

      console.log("Table status updated successfully:", updatedTable);

      // Return updated table data
      return res.status(200).json({ ok : true, message: "Status updated successfully", data: updatedTable });
    } catch (error) {
      console.error("Error updating table status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    console.warn(`Invalid method: ${req.method}`);
    return res.status(405).json({ message: "Method not allowed" });
  }
};

export default updateTableStatus;
