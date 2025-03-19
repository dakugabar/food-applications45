import dbConnect from '../../app/lib/dbconnect';
import Item from '../../models/item';

export default async function handler(req, res) {
    try {
        await dbConnect();

        // Fetch data from the Item model
        const items = await Item.find({});

        // Send response
        res.status(200).json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
