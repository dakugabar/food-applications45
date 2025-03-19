import dbConnect from '../../app/lib/dbconnect'; // Utility to connect to MongoDB
import Tablesave from '../../models/tablesave'; // MongoDB model for your table schema

export default async function handler(req, res) {
  await dbConnect(); // Ensure database connection

  const { method } = req;

  if (method === 'PUT') {
    const { tableId, itemId, newStatus } = req.body;

    // Validate request body
    if (!tableId || !itemId || !newStatus) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Find the table and update the item status
      const table = await Tablesave.findOneAndUpdate(
        { _id: tableId, "orderItems._id": itemId },
        {
          $set: {
            "orderItems.$.itemstatus": newStatus, // Update the item status
          },
        },
        { new: true } // Return the updated table document
      );

      if (!table) {
        return res.status(404).json({ error: "Table or item not found" });
      }

      return res.status(200).json({ success: true, table });
    } catch (error) {
      console.error("Error updating item status:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
