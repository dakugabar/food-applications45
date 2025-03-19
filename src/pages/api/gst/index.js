import dbConnect from '../../../app/lib/dbconnect'; // Adjust the path to your dbConnect
import Gst from '../../../models/Gst'; // Adjust the path to your Gst model


export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const gstList = await Gst.find({});
      res.status(200).json(gstList);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching GST list', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
