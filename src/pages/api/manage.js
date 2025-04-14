import Tablesave from "../../models/tablesave";
import dbConnect from "../../app/lib/dbconnect";
 
export default async function handler(req, res) {
  await dbConnect();
  const method = req.method;
 
  switch (method) {
    // ✅ GET latest table by tableNumber
    case "GET": {
      const { tableNumber } = req.query;
 
      try {
        const table = await Tablesave.findOne({ tableNumber })
          .sort({ createdAt: -1 })
          .exec();
 
        if (!table) return res.status(404).json({ error: "Table not found" });
 
        return res.status(200).json(table);
      } catch (error) {
        console.error("GET error:", error);
        return res.status(500).json({ error: "Server Error" });
      }
    }
 
    // ✅ POST - Add one or more items
    case "POST": {
      const { tableId, newItem } = req.body;
 
      try {
        const table = await Tablesave.findById(tableId);
        if (!table) return res.status(404).json({ error: "Table not found" });
 
        const items = Array.isArray(newItem) ? newItem : [newItem];
 
        items.forEach((item) => {
          table.orderItems.push(item);
          table.totalPrice += item.total;
        });
 
        await table.save();
        return res.status(201).json({ message: "Item(s) added", table });
      } catch (error) {
        console.error("POST error:", error);
        return res.status(500).json({ error: "Server Error" });
      }
    }
 
    // ✅ PUT - Update one or more items
    case "PUT": {
      const { tableId, updates } = req.body;
 
      try {
        const table = await Tablesave.findById(tableId);
        if (!table) return res.status(404).json({ error: "Table not found" });
 
        const updateList = Array.isArray(updates) ? updates : [updates];
 
        updateList.forEach(({ itemId, fields }) => {
          const item = table.orderItems.find(
            (i) => i.itemId.toString() === itemId
          );
          if (item) {
            table.totalPrice -= item.total; // remove old total
            Object.assign(item, fields);
            table.totalPrice += item.total; // add new total
          }
        });
 
        await table.save();
        return res.status(200).json({ message: "Item(s) updated", table });
      } catch (error) {
        console.error("PUT error:", error);
        return res.status(500).json({ error: "Server Error" });
      }
    }
 
    // ✅ DELETE - Delete one or more items
    case "DELETE": {
      const { tableId, itemIds } = req.body;
 
      try {
        const table = await Tablesave.findById(tableId);
        if (!table) return res.status(404).json({ error: "Table not found" });
 
        const idsToDelete = Array.isArray(itemIds) ? itemIds : [itemIds];
 
        idsToDelete.forEach((id) => {
          const index = table.orderItems.findIndex(
            (i) => i.itemId.toString() === id
          );
          if (index !== -1) {
            table.totalPrice -= table.orderItems[index].total;
            table.orderItems.splice(index, 1);
          }
        });
 
        await table.save();
        return res.status(200).json({ message: "Item(s) deleted", table });
      } catch (error) {
        console.error("DELETE error:", error);
        return res.status(500).json({ error: "Server Error" });
      }
    }
 
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      return res.status(405).json({ error: Method ${method} Not Allowed });
  }
}