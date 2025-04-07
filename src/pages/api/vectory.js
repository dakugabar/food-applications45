import dbConnect from "../../app/lib/dbconnect";
import Vectory from "../../models/vectory";
import Captain from "../../models/hotelverter.js";

export default async function handler(req, res) {
  await dbConnect();

  switch (req.method) {
    case "GET":
      try {
        // Get all assignments with populated captain names
        const assignments = await Vectory.find().lean();
        
        // Get all captains for name mapping
        const captains = await Captain.find({}, '_id name').lean();
        const captainMap = {};
        captains.forEach(c => captainMap[c._id] = c.name);

        // Format response with captain names
        const formattedData = assignments.map(assignment => ({
          _id: assignment._id,
          captain: assignment.captain,
          name: captainMap[assignment.captain] || 'Unknown Captain',
          tables: assignment.tables || []
        }));

        res.status(200).json({ 
          success: true, 
          data: formattedData 
        });
      } catch (error) {
        res.status(400).json({ 
          success: false, 
          message: "Failed to fetch assignments",
          error: error.message 
        });
      }
      break;

    case "POST":
      try {
        const { captain, tables } = req.body;

        // Validate input
        if (!captain) {
          return res.status(400).json({ 
            success: false, 
            message: "Captain ID is required" 
          });
        }

        // Verify captain exists
        const captainExists = await Captain.exists({ _id: captain });
        if (!captainExists) {
          return res.status(404).json({ 
            success: false, 
            message: "Captain not found" 
          });
        }

        // Check for existing assignment
        const existingAssignment = await Vectory.findOne({ captain });
        if (existingAssignment) {
          return res.status(400).json({ 
            success: false, 
            message: "Captain already assigned" 
          });
        }

        // Create new assignment
        const newAssignment = await Vectory.create({ 
          captain,
          tables: tables || []
        });

        // Get captain name for response
        const captainDoc = await Captain.findById(captain, 'name');

        res.status(201).json({
          success: true,
          data: {
            _id: newAssignment._id,
            captain: newAssignment.captain,
            name: captainDoc?.name || 'Unknown Captain',
            tables: newAssignment.tables
          }
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
        // Support both query params and body for ID
        const assignmentId = req.query.id || req.body.id;
        const { captain: newCaptainId, tables } = req.body;

        // Validate input
        if (!assignmentId) {
          return res.status(400).json({ 
            success: false, 
            message: "Assignment ID is required" 
          });
        }

        const updateData = { tables };

        // Handle captain change if provided
        if (newCaptainId) {
          // Verify new captain exists
          const newCaptainExists = await Captain.exists({ _id: newCaptainId });
          if (!newCaptainExists) {
            return res.status(404).json({ 
              success: false, 
              message: "New captain not found" 
            });
          }

          // Check if new captain is already assigned
          const existingAssignment = await Vectory.findOne({ 
            captain: newCaptainId,
            _id: { $ne: assignmentId }
          });
          
          if (existingAssignment) {
            return res.status(400).json({ 
              success: false, 
              message: "Captain already assigned to another table" 
            });
          }

          updateData.captain = newCaptainId;
        }

        // Update assignment
        const updatedAssignment = await Vectory.findByIdAndUpdate(
          assignmentId,
          updateData,
          { new: true }
        );

        if (!updatedAssignment) {
          return res.status(404).json({ 
            success: false, 
            message: "Assignment not found" 
          });
        }

        // Get captain name for response
        const captainDoc = await Captain.findById(
          updatedAssignment.captain, 
          'name'
        );

        res.status(200).json({
          success: true,
          data: {
            _id: updatedAssignment._id,
            captain: updatedAssignment.captain,
            name: captainDoc?.name || 'Unknown Captain',
            tables: updatedAssignment.tables
          }
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
        // Support both query params and body for ID
        const assignmentId = req.query.id || req.body.id;

        if (!assignmentId) {
          return res.status(400).json({ 
            success: false, 
            message: "Assignment ID is required" 
          });
        }

        const deletedAssignment = await Vectory.findByIdAndDelete(assignmentId);

        if (!deletedAssignment) {
          return res.status(404).json({ 
            success: false, 
            message: "Assignment not found" 
          });
        }

        res.status(200).json({ 
          success: true,
          data: { _id: assignmentId }
        });

      } catch (error) {
        res.status(500).json({ 
          success: false, 
          message: error.message || "Server error" 
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).json({ 
        success: false, 
        message: `Method ${req.method} not allowed` 
      });
      break;
  }
}