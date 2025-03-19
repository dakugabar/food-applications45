// pages/api/data/[id].js

import dbConnect from '../../app/lib/dbconnect';
import Item from '../../models/item';

export default async function handler(req, res) {
    await dbConnect();

    if (req.method === 'DELETE') {
        try {
            const { id } = req.query;

            // Delete the item from the database
            const result = await Item.findByIdAndDelete(id);

            if (!result) {
                return res.status(404).json({ message: 'Item not found' });
            }

            res.status(200).json({ message: 'Item deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
