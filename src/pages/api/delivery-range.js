import dbConnect from '../../app/lib/dbconnect';
import DeliveryRange from '../../models/DeliveryRange';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const ranges = await DeliveryRange.find({});
        res.status(200).json({ success: true, data: ranges });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    case 'POST':
      try {
        const range = await DeliveryRange.create(req.body);
        res.status(201).json({ success: true, data: range });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    case 'PUT':
      try {
        const { id, ...updateData } = req.body;
        const range = await DeliveryRange.findByIdAndUpdate(id, updateData, {
          new: true,
          runValidators: true,
        });
        res.status(200).json({ success: true, data: range });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.body;
        await DeliveryRange.findByIdAndDelete(id);
        res.status(200).json({ success: true });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}
