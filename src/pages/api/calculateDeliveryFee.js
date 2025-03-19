import dbConnect from '../../app/lib/dbconnect';
import DeliveryRange from '../../models/DeliveryRange';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { userLocation, adminLocation } = req.body;

    if (!userLocation || !adminLocation) {
      return res.status(400).json({ success: false, message: 'Missing locations' });
    }

    // Fetch coordinates for both user and admin locations
    const userCoords = await getCoordinates(userLocation);
    const adminCoords = await getCoordinates(adminLocation);

    if (!userCoords || !adminCoords) {
      return res.status(400).json({ success: false, message: 'Invalid address or unable to fetch coordinates' });
    }

    // Calculate distance between user and admin locations
    const distance = calculateDistance(userCoords, adminCoords);

    // Connect to the database
    await dbConnect();

    // Query the delivery range from the database
    const range = await DeliveryRange.findOne({
      min: { $lte: distance },
      max: { $gte: distance },
    });

    if (!range) {
      // Check for possible nearby range (if distance exceeds defined ranges)
      const nearbyRange = await DeliveryRange.findOne({
        max: { $gte: distance }, // Find if any range has a max greater than or equal to the distance
      });

      if (!nearbyRange) {
        return res.status(400).json({ success: false, message: 'Distance not deliverable' });
      }

      // Return the nearby range's fee
      res.status(200).json({ success: true, fee: nearbyRange.fee, distance });
    } else {
      // If range is found, return the fee
      res.status(200).json({ success: true, fee: range.fee, distance });
    }
  } catch (error) {
    console.error('Error calculating delivery fee:', error.stack || error);
    res.status(500).json({ success: false, message: 'Server error' });
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
