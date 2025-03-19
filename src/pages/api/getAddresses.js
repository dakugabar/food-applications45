// pages/api/delivery/getAddresses.js
import dbConnect from '../../app/lib/dbconnect';
import Address from '../../models/Address';
import jwt from 'jsonwebtoken';
import AdminSettings from '../../models/AdminSettings';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      await dbConnect();

      // Extract token from authorization header
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Verify and decode token to get user ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      // Fetch the admin settings to get the admin location and distance threshold
      const adminSettings = await AdminSettings.findOne({});
      if (!adminSettings) {
        return res.status(500).json({ success: false, message: 'Admin settings not found' });
      }

      const { adminLocation, distanceThreshold } = adminSettings;

      // Fetch the user's addresses
      const deliveries = await Address.find({ userId }).sort({ createdAt: -1 });

      // Filter the deliveries by distance
      const filteredDeliveries = [];

      for (const delivery of deliveries) {
        // Fetch coordinates for the delivery and admin location
        const deliveryCoords = await getCoordinates(delivery.location);
        const adminCoords = await getCoordinates(adminLocation);

        if (!deliveryCoords || !adminCoords) {
          continue; // Skip if coordinates are not found
        }

        // Calculate the distance between the delivery address and admin location
        const distance = calculateDistance(deliveryCoords, adminCoords);

        // If the distance is within the threshold, add the delivery to the filtered list
        if (distance <= distanceThreshold) {
          filteredDeliveries.push(delivery);
        }
      }

      return res.status(200).json({ success: true, deliveries: filteredDeliveries });
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch deliveries.' });
    }
  } else {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }
}

// Function to fetch coordinates using the Google Maps Geocoding API
async function getCoordinates(address) {
  const apiKey = 'AIzaSyCuro_Das6SA4HRZzGnqR6VHHgyfprryCg'; // Replace with your API key
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

  try {
    const response = await axios.get(url);

    if (response.data.status === 'OK') {
      const location = response.data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    } else {
      console.error('Geocoding API Error:', response.data.status);
      return null;
    }
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    return null;
  }
}

// Function to calculate distance between two locations using Haversine formula
function calculateDistance(loc1, loc2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(loc2.lat - loc1.lat);
  const dLon = toRad(loc2.lng - loc1.lng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(loc1.lat)) * Math.cos(toRad(loc2.lat)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}
