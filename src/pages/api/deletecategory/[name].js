// pages/api/deletecategory/[name].js
import dbConnect from '../../../app/lib/dbconnect';
import Category from '../../../models/category';

export default async function handler(req, res) {
  await dbConnect();
  const { name } = req.query;

  if (req.method === 'DELETE') {
    try {
      await Category.findOneAndDelete({ name });
      res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete category' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
