import dbConnect from '../../app/lib/dbconnect'; // Utility to connect to MongoDB
import Tablesave from '../../models/tablesave';

export default async function handler(req, res) {
  await dbConnect(); // Ensure database connection

  const { method } = req;

  if (method === 'PUT') {
    const { tableId, itemId, newStatus } = req.body;

    if (!tableId || !itemId || !newStatus) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Find the table document and update the specific item's status
      const table = await Tablesave.findOneAndUpdate(
        { _id: tableId, "orderItems._id": itemId }, // Match using orderItems._id
        {
          $set: {
            "orderItems.$.itemstatus": newStatus, // Update the matched item's status
          },
        },
        { new: true } // Return the updated document
      );
      
       if (!table) {
         return res.status(404).json({ error: "Table or item not found" });
       }

      return res.status(200).json({ success: true, table });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
