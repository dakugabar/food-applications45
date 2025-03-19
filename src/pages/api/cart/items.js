import jwt from "jsonwebtoken";
import dbConnect from "../../../app/lib/dbconnect";
import Cart from "../../../models/Cart";
import Food from "../../../models/item"; // Assuming you have a Food model

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;

  if (method === "GET") { // Handle GET request to fetch cart items
    const token = req.headers.authorization?.split(" ")[1]; // Extract the token from Authorization header

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      // Verify the token and extract the user ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id; // Assuming the token contains the user's ID as `id`

      // Retrieve the cart items for the user
      const cartItems = await Cart.find({ userId });

      if (!cartItems) {
        return res.status(404).json({ error: "No items found in the cart" });
      }

      // For each cart item, fetch the associated food item and the quantity
      const cartDetails = [];
      for (let item of cartItems) {
        // Find the food item associated with the cart item
        const foodItem = await Food.findById(item.itemId); // Assuming the `itemId` refers to the Food ID

        if (foodItem) {
          cartDetails.push({
            foodItem,
            quantity: item.quantity, // The quantity from the cart
          });
        }
      }

      res.status(200).json(cartDetails);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      res.status(401).json({ error: "Invalid or expired token" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
