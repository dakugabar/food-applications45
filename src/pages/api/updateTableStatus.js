import dbConnect from "../../app/lib/dbconnect";
import Table from "../../models/Table";

const updateTableStatus = async (req, res) => {
  if (req.method === "PUT") {
    const { tableName, status } = req.body;

   

    // Validate input
    if (!tableName || !status || typeof tableName !== "string" || typeof status !== "string") {
   
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
        
        return res.status(404).json({ message: "Table not found" });
      }

      // Save the status to the database
      await updatedTable.save();

     

      // Return updated table data
      return res.status(200).json({ ok: true, message: "Status updated successfully", data: updatedTable });
    } catch (error) {
    
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
  
    return res.status(405).json({ message: "Method not allowed" });
  }
};

export default updateTableStatus;
