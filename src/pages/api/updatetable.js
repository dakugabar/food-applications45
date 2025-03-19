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
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { tableId, updatedOrderData } = req.body;

 

  if (!tableId || !updatedOrderData) {
    return res.status(400).json({ message: "Missing tableId or updated data" });
  }

  try {
    // Connect to the database
    await connectToDatabase();

    // Find and update the table order using the tableId
    const updatedTable = await Tablesave.findByIdAndUpdate(
      tableId,
      {
        ...updatedOrderData, // Update the order data with the new values
      },
      { new: true, runValidators: true }
    );

    // Check if the table was found and updated
    if (!updatedTable) {
      return res.status(404).json({ message: "Table not found" });
    }

    // Return the updated table data
    res.status(200).json({ table: updatedTable });
  } catch (error) {
    // Log the detailed validation error
    console.error("Validation Error Details:", error.errors);

    // Return validation error details in response
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }

    // Log and return general server errors
    console.error("Error updating table:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
