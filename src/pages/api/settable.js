import Table from '../../models/Table';
import dbConnect from '../../app/lib/dbconnect';

dbConnect();

export default async (req, res) => {
  switch (req.method) {
    case 'GET':
      try {
        const tables = await Table.find();
        res.status(200).json(tables);
      } catch (error) {
        res.status(500).json({ message: 'Failed to fetch tables', error });
      }
      break;

    case 'PATCH':
      try {
        const { id } = req.query;
        const { tablestatus } = req.body;
        const updatedTable = await Table.findByIdAndUpdate(id, { tablestatus }, { new: true });
        if (!updatedTable) {
          res.status(404).json({ message: 'Table not found' });
        } else {
          res.status(200).json(updatedTable);
        }
      } catch (error) {
        res.status(500).json({ message: 'Failed to update table status', error });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        const result = await Table.findByIdAndDelete(id);
        if (!result) {
          res.status(404).json({ message: 'Table not found' });
        } else {
          res.status(204).end();
        }
      } catch (error) {
        res.status(500).json({ message: 'Failed to delete table', error });
      }
      break;

    case 'PUT':
      try {
        const { id } = req.query;
        const updatedTable = await Table.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedTable) {
          
          res.status(404).json({ message: 'Table not found' });
        } else {
          res.status(200).json(updatedTable);
        }
      } catch (error) {
        res.status(500).json({ message: 'Failed to update table', error });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
};
