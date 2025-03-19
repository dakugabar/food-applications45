import dbConnect from "../../app/lib/dbconnect";
import Tablesave from "../../models/tablesave";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    try {
      const {
        customerName,
        mobileNumber,
        seatNumber,
        tableNumber,
        maxPax,
        orderItems,
        totalPrice,
        
      } = req.body;

      // Validate tableNumber
      

       
      const newOrder = new Tablesave({
        customerName,
        mobileNumber,
        seatNumber,
        tableNumber,
        maxPax,
        orderItems,
        totalPrice,
        
      });

      const savedOrder = await newOrder.save();

      return res.status(201).json({
        message: "Order created successfully",
        order: savedOrder,
      });
    } catch (error) {
      console.error("Error creating order:", error);
      return res.status(500).json({
        message: "Error creating order",
        error: error.message,
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
