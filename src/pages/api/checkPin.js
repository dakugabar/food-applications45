import dbConnect from "../../app/lib/dbconnect";
import User from "../../models/vectory";  
import Table from "../../models/Table";


export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  await dbConnect();

  try {
    const { pin } = req.body;

    // Find the user by PIN
    const user = await User.findOne({ pin });
    if (!user) {
      return res.status(404).json({ error: "Invalid PIN. Captain not found." });
    }

    // Fetch the tables assigned to the user
    const tables = await Table.find({ tableName: { $in: user.tables } });

    return res.status(200).json({
      name: user.name,
      tables: tables.map((table) => ({
        tableName: table.tableName,
        seatNumber: table.seatNumber,
        status: table.status,
      })),
    });
  } catch (error) {
    console.error("Error fetching tables:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
