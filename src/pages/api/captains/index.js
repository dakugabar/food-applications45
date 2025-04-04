import connectDB from "../../../app/lib/dbconnect";
import Captain from "../../../models/hotelverter.js";



export default async function handler(req, res) {
  await connectDB();

  // GET - Fetch all captains
  if (req.method === "GET") {
    try {
      const captains = await Captain.find({});
      res.status(200).json(captains);
    } catch (error) {
      res.status(500).json({ 
        message: "Error fetching captains",
        error: error.message 
      });
    }
  }
  // POST - Create new captain
  else if (req.method === "POST") {
    try {
      const { name, pin } = req.body;

      if (!name || !pin) {
        return res.status(400).json({ message: "Name and PIN are required" });
      }

      if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        return res.status(400).json({ message: "PIN must be exactly 4 digits" });
      }

      const newCaptain = new Captain({ name, pin });
      await newCaptain.save();

      res.status(201).json(newCaptain);
    } catch (error) {
      if (error.code === 11000) {
        const field = error.keyPattern.name ? "name" : "pin";
        res.status(400).json({ message: `Captain ${field} already exists` });
      } else {
        res.status(500).json({ 
          message: "Error creating captain",
          error: error.message 
        });
      }
    }
  }
  // PUT - Update captain
  else if (req.method === "PUT") {
    try {
      const { id, name, pin } = req.body;

      if (!id) return res.status(400).json({ message: "Captain ID is required" });
      if (pin && (pin.length !== 4 || !/^\d{4}$/.test(pin))) {
        return res.status(400).json({ message: "PIN must be exactly 4 digits" });
      }

      const updateData = { name };
      if (pin) updateData.pin = pin;

      const updatedCaptain = await Captain.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      );

      if (!updatedCaptain) {
        return res.status(404).json({ message: "Captain not found" });
      }

      res.status(200).json(updatedCaptain);
    } catch (error) {
      if (error.code === 11000) {
        const field = error.keyPattern.name ? "name" : "pin";
        res.status(400).json({ message: `Captain ${field} already exists` });
      } else {
        res.status(500).json({ 
          message: "Error updating captain",
          error: error.message 
        });
      }
    }
  }
  // DELETE - Remove captain
  else if (req.method === "DELETE") {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ message: "Captain ID is required" });

      const deletedCaptain = await Captain.findByIdAndDelete(id);
      if (!deletedCaptain) {
        return res.status(404).json({ message: "Captain not found" });
      }

      res.status(200).json({ message: "Captain deleted successfully" });
    } catch (error) {
      res.status(500).json({ 
        message: "Error deleting captain",
        error: error.message 
      });
    }
  }
  else {
    res.status(405).json({ message: "Method not allowed" });
  }
}