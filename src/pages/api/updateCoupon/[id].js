// pages/api/updateCoupon/[id].js
import dbConnect from '../../../app/lib/dbconnect'; // Utility to connect to the database
import Coupon from '../../../models/Coupon'; 

export default async (req, res) => {
  await dbConnect();

  const { id } = req.query;
  if (req.method === 'PATCH') {
    const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedCoupon);
  } else {
    res.status(405).end(); // Method Not Allowed
  }
};
