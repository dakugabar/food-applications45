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

    // ✅ POST - Add new item to orderItems
    case "POST": {
      const { tableId, newItem } = req.body;

      try {
        const table = await Tablesave.findById(tableId);
        if (!table) return res.status(404).json({ error: "Table not found" });

        table.orderItems.push(newItem);

        // Update totalPrice
        table.totalPrice += newItem.total;

        await table.save();

        return res.status(201).json({ message: "Item added", table });
      } catch (error) {
        console.error("POST error:", error);
        return res.status(500).json({ error: "Server Error" });
      }
    }

    // ✅ PUT - Update item in orderItems
    case "PUT": {
      const { tableId, itemId, updates } = req.body;

      try {
        const table = await Tablesave.findById(tableId);
        if (!table) return res.status(404).json({ error: "Table not found" });

        const item = table.orderItems.find(
          (i) => i.itemId.toString() === itemId
        );
        if (!item) return res.status(404).json({ error: "Item not found" });

        // Subtract old total from table totalPrice
        table.totalPrice -= item.total;

        // Apply updates
        Object.assign(item, updates);

        // Add updated total to table totalPrice
        table.totalPrice += item.total;

        await table.save();

        return res.status(200).json({ message: "Item updated", table });
      } catch (error) {
        console.error("PUT error:", error);
        return res.status(500).json({ error: "Server Error" });
      }
    }

    // ✅ DELETE - Delete item from orderItems
    case "DELETE": {
      const { tableId, itemId } = req.body;

      try {
        const table = await Tablesave.findById(tableId);
        if (!table) return res.status(404).json({ error: "Table not found" });

        const itemIndex = table.orderItems.findIndex(
          (i) => i.itemId.toString() === itemId
        );
        if (itemIndex === -1)
          return res.status(404).json({ error: "Item not found" });

        // Subtract deleted item's total from totalPrice
        const removedItem = table.orderItems[itemIndex];
        table.totalPrice -= removedItem.total;

        // Remove item
        table.orderItems.splice(itemIndex, 1);
        await table.save();

        return res.status(200).json({ message: "Item deleted", table });
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
