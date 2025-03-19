import dbConnect from "../../app/lib/dbconnect";
import Tablesave from "../../models/tablesave";
import Table from "../../models/Table";

const handler = async (req, res) => {
  if (req.method === "GET") {
    await dbConnect(); // Ensure the database connection is established

    try {
      // Fetch tables from Tablesave and add status from Table model
      const tables = await Tablesave.find();

      // Fetch the status from the Table model for each Tablesave record
      const tablesWithStatus = await Promise.all(
        tables.map(async (table) => {
          const relatedTable = await Table.findOne({ tableName: table.tableNumber });
          return {
            ...table.toObject(),
            status: relatedTable ? relatedTable.status : "Unknown", // Add status if found
          };
        })
      );

      return res.status(200).json(tablesWithStatus); // Send the enriched data
    } catch (error) {
      return res.status(500).json({ message: "Error fetching tables", error: error.message });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
};

export default handler;
