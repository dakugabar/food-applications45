import dbConnect from '../../../../app/lib/dbconnect';
import Gst from '../../../../models/Gst';



export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;

  switch (method) {
    case 'DELETE':
      try {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ message: 'No ID provided' });
        }
        
        const result = await  Gst.findByIdAndDelete(id);

        if (!result) {
          return res.status(404).json({ message: 'GST item not found' });
        }

        res.status(200).json({ message: 'GST item deleted successfully' });
      } catch (error) {
        console.error('Error deleting GST item:', error);
        res.status(500).json({ message: 'Error deleting GST item', error: error.message });
      }
      break;
    default:
      res.setHeader('Allow', ['DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
