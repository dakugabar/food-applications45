import dbConnect from '../../app/lib/dbconnect';
import Item from '../../models/item'; // Replace with your actual item model path

export default async function handler(req, res) {
  try {
    await dbConnect();

    const { category, searchText } = req.query;

    // Build the query object based on the parameters
    let query = {};

    // If a category is provided, filter by category
    if (category) {
      query.category = category;
    }

    // If a searchText is provided, filter by item name using a case-insensitive regex
    if (searchText) {
      query.name = { $regex: searchText, $options: 'i' }; // Case-insensitive match
    }

    // Fetch items matching the query
    const items = await Item.find(query);

    // If no items are found, return an empty array with a message
    if (items.length === 0) {
      return res.status(200).json({ message: "No items found." });
    }

    // Return the found items
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
