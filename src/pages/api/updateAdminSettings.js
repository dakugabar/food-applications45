// pages/api/adminSettings.js
import dbConnect from '../../app/lib/dbconnect';  // Ensure the correct path for dbConnect
import AdminSettings from '../../models/AdminSettings';  // Import AdminSettings from the correct location

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;

  if (method === 'POST') {
    const { adminLocation, distanceThreshold } = req.body;

    try {
      const updatedSettings = await AdminSettings.findOneAndUpdate(
        {},
        { adminLocation, distanceThreshold },
        { new: true, upsert: true }  // Create if it doesn't exist (upsert)
      );
      res.status(200).json({ success: true, settings: updatedSettings });
    } catch (error) {
      console.error('Error updating admin settings:', error);  // Log the actual error for debugging
      res.status(500).json({ success: false, message: 'Server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
