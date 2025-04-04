import dbConnect from "../../app/lib/dbconnect";
import Vectory from "../../models/vectory";
import Captain from "../../models/hotelverter.js";

export default async function handler(req, res) {
  await dbConnect();

  switch (req.method) {
    case "GET":
      try {
        const vectoryCaptains = await Vectory.find();
        
        // Get all captains to map names to IDs
        const allCaptains = await Captain.find({}, '_id name');
        const captainMap = {};
        allCaptains.forEach(captain => {
          captainMap[captain._id] = captain.name;
        });

        // Format the response to match frontend expectations
        const formattedData = vectoryCaptains.map(assignment => ({
          _id: assignment._id,
          id: assignment.captain,  // Using the captain ID directly
          name: captainMap[assignment.captain] || 'Unknown Captain',
          tables: assignment.tables || []
        }));

        res.status(200).json({ success: true, data: formattedData });
      } catch (error) {
        res.status(400).json({ success: false, message: "Failed to fetch captains" });
      }
      break;

    case "POST":
      try {
        const { id, tables } = req.body;  // Now expecting ID instead of name

        if (!id) {
          return res.status(400).json({ success: false, message: "Captain ID is required." });
        }

        // Check if captain exists
        const captain = await Captain.findById(id);
        if (!captain) {
          return res.status(404).json({ success: false, message: "Captain not found" });
        }

        // Check if this captain already has an assignment
        const existingAssignment = await Vectory.findOne({ captain: id });
        if (existingAssignment) {
          return res.status(400).json({ success: false, message: "Captain already assigned." });
        }

        const newAssignment = new Vectory({ 
          captain: id,
          tables: tables || []
        });
        await newAssignment.save();

        // Format the response to match frontend expectations
        const result = {
          _id: newAssignment._id,
          id: newAssignment.captain,
          name: captain.name,
          tables: newAssignment.tables
        };

        res.status(201).json({ 
          success: true, 
          message: "Captain assigned successfully", 
          data: result 
        });
      } catch (error) {
        res.status(500).json({ 
          success: false, 
          message: error.message || "Server error" 
        });
      }
      break;

    case "PUT":
      try {
        const { id: assignmentId, id: newCaptainId, tables } = req.body;

        if (!assignmentId) {
          return res.status(400).json({ success: false, message: "Assignment ID is required." });
        }

        const updateData = { tables };
        
        // If changing the assigned captain
        if (newCaptainId) {
          // Check if new captain exists
          const newCaptain = await Captain.findById(newCaptainId);
          if (!newCaptain) {
            return res.status(404).json({ success: false, message: "New captain not found" });
          }
          
          // Check if new captain is already assigned elsewhere
          const existingAssignment = await Vectory.findOne({ 
            captain: newCaptainId,
            _id: { $ne: assignmentId }
          });
          
          if (existingAssignment) {
            return res.status(400).json({ 
              success: false, 
              message: "New captain already has an assignment" 
            });
          }
          
          updateData.captain = newCaptainId;
        }

        const updatedAssignment = await Vectory.findByIdAndUpdate(
          assignmentId,
          updateData,
          { new: true }
        );

        if (!updatedAssignment) {
          return res.status(404).json({ success: false, message: "Assignment not found" });
        }

        // Get the captain name for the response
        const captain = await Captain.findById(updatedAssignment.captain);
        const result = {
          _id: updatedAssignment._id,
          id: updatedAssignment.captain,
          name: captain?.name || 'Unknown Captain',
          tables: updatedAssignment.tables
        };

        res.status(200).json({ 
          success: true, 
          message: "Assignment updated successfully", 
          data: result 
        });
      } catch (error) {
        res.status(500).json({ 
          success: false, 
          message: error.message || "Server error" 
        });
      }
      break;

    case "DELETE":
      try {
        const { id } = req.body;

        if (!id) {
          return res.status(400).json({ success: false, message: "Assignment ID is required." });
        }

        const deletedAssignment = await Vectory.findByIdAndDelete(id);

        if (!deletedAssignment) {
          return res.status(404).json({ success: false, message: "Assignment not found" });
        }

        res.status(200).json({ 
          success: true, 
          message: "Assignment deleted successfully" 
        });
      } catch (error) {
        res.status(500).json({ 
          success: false, 
          message: error.message || "Server error" 
        });
      }
      break;

    default:
      res.status(405).json({ success: false, message: "Method not allowed" });
      break;
  }
}