import dbConnect from '../../../app/lib/dbconnect'; // Utility to connect to the database
import Coupon from '../../../models/Coupon'; 

export default async (req, res) => {
  await dbConnect();

  const { id } = req.query;
  if (req.method === 'DELETE') {
    await Coupon.findByIdAndDelete(id);
    res.status(204).end(); // No Content
  } else {
    res.status(405).end(); // Method Not Allowed
  }
};
