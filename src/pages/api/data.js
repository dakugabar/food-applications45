// pages/api/data.js

import dbConnect from '../../app/lib/dbconnect';
import Item from '../../models/item';

export default async function handler(req, res) {
    try {
        await dbConnect();

        // Fetch data from the items collection
        const items = await Item.find({}).lean(); // `.lean()` returns plain JavaScript objects

        // Send response
        res.status(200).json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
