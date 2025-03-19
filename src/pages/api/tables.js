// pages/api/tables.js
import dbConnect from "../../app/lib/dbconnect"; // Correct path to the database utility
import Table from "../../models/Table"; // Correct path to the Table model

export default async function handler(req, res) {
  await dbConnect(); // Establish database connection

  if (req.method === "POST") {
    const { tableName, seatNumber } = req.body;

    // Validate input
    if (!tableName || !seatNumber) {
      return res.status(400).json({ error: "Table name and seat number are required." });
    }

    try {
      // Create a new table with default status
      const newTable = await Table.create({ 
        tableName, 
        seatNumber, 
        status: "available" // Add default status
      });

      return res.status(201).json({ 
        message: "Table added successfully!", 
        table: newTable 
      });
    } catch (error) {
      console.error("Error saving table:", error);
      return res.status(500).json({ 
        error: "Failed to add table. Please try again." 
      });
    }
  } else {
    // Method not allowed
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
