import dbConnect from '../../app/lib/dbconnect';  // Ensure the correct path for dbConnect
import AdminSettings from '../../models/AdminSettings';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const settings = await AdminSettings.findOne(); // Fetch the first admin settings
      if (settings) {
        return res.status(200).json({ success: true, adminLocation: settings.adminLocation, distanceThreshold: settings.distanceThreshold });
      } else {
        return res.status(404).json({ success: false, message: 'Admin settings not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  } else if (req.method === 'POST') {
    const { adminLocation, distanceThreshold } = req.body;

    try {
      let settings = await AdminSettings.findOne();
      if (settings) {
        // Update existing settings
        settings.adminLocation = adminLocation;
        settings.distanceThreshold = distanceThreshold;
        await settings.save();
      } else {
        // Create new settings
        settings = new AdminSettings({ adminLocation, distanceThreshold });
        await settings.save();
      }
      return res.status(200).json({ success: true, message: 'Settings saved' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
}
