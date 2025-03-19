// pages/api/categories.js
import Category from '../../models/category';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const categories = await Category.find(); // Fetch all categories from the database
      res.status(200).json(categories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
