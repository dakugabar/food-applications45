import dbConnect from '../../../app/lib/dbconnect';

import User from '../../../models/user';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    await dbConnect();

    const { id } = req.query;

    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json({ success: true, user });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch user' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
