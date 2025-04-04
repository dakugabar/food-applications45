import dbConnect from "../../app/lib/dbconnect";
import Captain from "../../models/hotelverter.js";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      // Fetch all captains with both _id and name fields
      const captains = await Captain.find({}, '_id name');
      
      // Transform data to match frontend expectations
      const formattedCaptains = captains.map(captain => ({
        _id: captain._id,       // MongoDB document ID
        id: captain._id,        
        name: captain.name || `Captain ${captain._id.toString().slice(-4)}` // Fallback name
      }));
      
      return res.status(200).json({ 
        success: true, 
        data: { data: formattedCaptains } // Matching your frontend structure
      });
    } catch (error) {
      console.error("Error fetching captains:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to fetch captains",
        error: error.message 
      });
    }
  }

  return res.status(405).json({ 
    success: false, 
    message: "Method Not Allowed" 
  });
}