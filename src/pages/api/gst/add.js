import dbConnect from '../../../app/lib/dbconnect';
import Gst from '../../../models/Gst';



export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { gstName, gstRate } = req.body;
      const newGst = new Gst({ gstName, gstRate });
      await newGst.save();
      res.status(201).json(newGst);
    } catch (error) {
      res.status(500).json({ message: 'Error adding GST item', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
