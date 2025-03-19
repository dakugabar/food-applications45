import dbConnect from "../../app/lib/dbconnect"; // Utility to connect to MongoDB
import Item from "../../models/item"; // Mongoose model for Item

export default async function handler(req, res) {
  await dbConnect(); // Ensure database connection is established

  if (req.method === "GET") {
    try {
      const { category } = req.query;
      const query = category ? { category } : {}; // Filter by category if provided
      const items = await Item.find(query);
      res.status(200).json(items);
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({ message: "Failed to fetch items." });
    }
  } else {
    res.status(405).json({ message: "Method not allowed." });
  }
}
