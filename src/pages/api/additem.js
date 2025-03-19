import dbConnect from '../../app/lib/dbconnect';
import Item from '../../models/item';
import multer from 'multer';
import AWS from 'aws-sdk';
import fs from 'fs';

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION, // e.g., 'us-east-1'
});

const s3 = new AWS.S3();

// Configure Multer storage to store files in memory
const storage = multer.memoryStorage(); // Store the file in memory before uploading to S3

const fileFilter = (req, file, cb) => {
  // Validate file type (optional)
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images are allowed.'));
  }
};

const upload = multer({ storage, fileFilter });

export const config = {
  api: {
    bodyParser: false, // Disables the default body parser
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await dbConnect();

      // Use multer to parse form data
      upload.single('image')(req, res, async (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error uploading image', error: err.message });
        }

        const { name, description, price, discount, category, gstRate, vegOrNonVeg } = req.body;

        // Validate that all required fields are provided
        if (!name || !description || !price || !discount || !category || !gstRate || !vegOrNonVeg) {
          return res.status(400).json({ message: 'All fields are required' });
        }

        // Upload the image to S3
        
        const params = {
          Bucket: process.env.AWS_BUCKET_NAME, // Your S3 bucket name
          Key: `items/${Date.now()}-${req.file.originalname}`, // File key in S3 bucket
          Body: req.file.buffer, // File data
          ContentType: req.file.mimetype, // MIME type
        };

        try {
          // Upload the file to S3
          const s3Response = await s3.upload(params).promise();

          const { name, description, price, discount, category, gstRate, vegOrNonVeg } = req.body;
          
          // Create new item with the image URL from S3
          const newItem = new Item({
            name,
            description,
            price,
            discount,
            category,
            gstRate,
            vegOrNonVeg,
            imageUrl: s3Response.Location, // The image URL returned by S3
          });

          await newItem.save();

          res.status(201).json({ message: 'Item added successfully', item: newItem });
        } catch (uploadError) {
          res.status(500).json({ message: 'Error uploading image to S3', error: uploadError.message });
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
