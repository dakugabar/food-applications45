// pages/api/getcategories.js
import dbConnect from '../../app/lib/dbconnect'; // Adjust the path to your DB connection
import Category from '../../models/category'; // Adjust the path to your category model

export default async function handler(req, res) {
  await dbConnect();

  try {
    const categories = await Category.find({}); // Fetch all categories
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
}
