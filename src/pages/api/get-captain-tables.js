import connectDB from "../../app/lib/dbconnect";
import Vectory from "../../models/vectory";
import Table from "../../models/Table";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ 
      message: `Method ${req.method} not allowed`,
      allowedMethods: ['GET'] 
    });
  }

  const { captainId } = req.query;

  // Validate captainId
  if (!captainId) {
    return res.status(400).json({ 
      success: false,
      message: "Captain ID is required",
      error: "Missing captainId parameter"
    });
  }

  try {
    await connectDB();

    // 1. Find the captain's assigned tables in Vectory
    const vectory = await Vectory.findOne({ captain: captainId })
      .select('tables')
      .lean();

    if (!vectory?.tables?.length) {
      return res.status(200).json({ 
        success: true,
        message: "No tables assigned to this captain",
        tables: []
      });
    }

    // 2. Get complete table details from Table model
    const tables = await Table.find({
      tableName: { $in: vectory.tables },
      tablestatus: "active"
    })
    .select('tableName seatNumber status')
    .lean();

    return res.status(200).json({
      success: true,
      message: "Successfully retrieved captain tables",
      tables: tables.map(table => ({
        tableName: table.tableName,
        seatNumber: table.seatNumber,
        status: table.status
      }))
    });

  } catch (error) {
    console.error("Error in get-captain-details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}
