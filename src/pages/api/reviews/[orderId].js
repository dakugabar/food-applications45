// pages/api/reviews/[orderId].js
import dbConnect from '../../../app/lib/dbconnect';
import Review from '../../../models/Review';

export default async function handler(req, res) {
  const {
    method,
    query: { orderId },
  } = req;

  await dbConnect(); // Connect to the database

  switch (method) {
    case 'GET':
      try {
        const review = await Review.findOne({ orderId });

        if (!review) {
          return res.status(404).json({ success: false, message: 'Review not found' });
        }

        return res.status(200).json({ success: true, data: review });
      } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
      }

    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }
}
