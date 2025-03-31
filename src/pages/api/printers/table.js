import dbConnect from '../../../app/lib/dbconnect';
import TableBillPrinter from '../../../models/TableBillPrinter';

export default async function handler(req, res) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const printers = await TableBillPrinter.find();
        res.status(200).json(printers);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching printers' });
      }
      break;

    case 'POST':
      try {
        const printer = await TableBillPrinter.create(req.body);
        res.status(201).json(printer);
      } catch (error) {
        res.status(400).json({ message: 'Error creating printer' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        await TableBillPrinter.findByIdAndDelete(id);
        res.status(200).json({ message: 'Printer deleted' });
      } catch (error) {
        res.status(400).json({ message: 'Error deleting printer' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}