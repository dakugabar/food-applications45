// pages/api/categories.js
import dbConnect from '../../app/lib/dbconnect'; // Adjust the path to your dbConnect function
import Category from '../../models/category'; // Adjust the path to your Category model

export default async function handler(req, res) {
  await dbConnect();

  try {
    const categories = await Category.find({}); // Fetch all categories
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}
