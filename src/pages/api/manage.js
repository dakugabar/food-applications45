import Tablesave from "../../models/tablesave";
import dbConnect from "../../app/lib/dbconnect";

export default async function handler(req, res) {
  await dbConnect();
  const method = req.method;

  switch (method) {
    // ✅ GET - Fetch latest table by tableNumber
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

    // ✅ POST - Add one or multiple items
    case "POST": {
      const { tableId, newItems } = req.body; // newItems: array of items

      try {
        const table = await Tablesave.findById(tableId);
        if (!table) return res.status(404).json({ error: "Table not found" });

        const itemsToAdd = Array.isArray(newItems) ? newItems : [newItems];

        for (let item of itemsToAdd) {
          table.orderItems.push(item);
          table.totalPrice += item.total;
        }

        await table.save();

        return res.status(201).json({ message: "Item(s) added", table });
      } catch (error) {
        console.error("POST error:", error);
        return res.status(500).json({ error: "Server Error" });
      }
    }

    // ✅ PUT - Update one or multiple items
    case "PUT": {
      const { tableId, items } = req.body; // items: [{ itemId, updates }]

      try {
        const table = await Tablesave.findById(tableId);
        if (!table) return res.status(404).json({ error: "Table not found" });

        const updatesArray = Array.isArray(items) ? items : [items];

        for (let { itemId, updates } of updatesArray) {
          const item = table.orderItems.find((i) => i.itemId.toString() === itemId);
          if (!item) continue;

          table.totalPrice -= item.total; // Remove old total
          Object.assign(item, updates);
          table.totalPrice += item.total; // Add new total
        }

        await table.save();

        return res.status(200).json({ message: "Item(s) updated", table });
      } catch (error) {
        console.error("PUT error:", error);
        return res.status(500).json({ error: "Server Error" });
      }
    }

    // ✅ DELETE - Delete one or multiple items
    case "DELETE": {
      const { tableId, itemIds } = req.body; // itemIds: array of itemId

      try {
        const table = await Tablesave.findById(tableId);
        if (!table) return res.status(404).json({ error: "Table not found" });

        const idsToDelete = Array.isArray(itemIds) ? itemIds : [itemIds];

        for (let id of idsToDelete) {
          const index = table.orderItems.findIndex((i) => i.itemId.toString() === id);
          if (index !== -1) {
            table.totalPrice -= table.orderItems[index].total;
            table.orderItems.splice(index, 1);
          }
        }

        await table.save();

        return res.status(200).json({ message: "Item(s) deleted", table });
      } catch (error) {
        console.error("DELETE error:", error);
        return res.status(500).json({ error: "Server Error" });
      }
    }

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}
