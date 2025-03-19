import dbConnect from '../../app/lib/dbconnect';
import Category from '../../models/category';
import multer from 'multer';
import AWS from 'aws-sdk';

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION, // e.g., 'us-east-1'
});

const s3 = new AWS.S3();

// Configure Multer storage for AWS S3
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

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await dbConnect();

      // Use Multer to parse the incoming form data
      upload.single('image')(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ message: 'Error uploading image', error: err.message });
        }

        const { name } = req.body;

        if (!name || !req.file) {
          return res.status(400).json({ message: 'All fields and an image are required' });
        }

        // Upload the image to S3
        const params = {
          Bucket: process.env.AWS_BUCKET_NAME, // Your S3 bucket name
          Key: `categories/${Date.now()}-${req.file.originalname}`, // File key in S3 bucket
          Body: req.file.buffer, // File data
          ContentType: req.file.mimetype, // MIME type
        };

        try {
          // Upload the file to S3
          const uploadResult = await s3.upload(params).promise();

          // Save the category to the database with the S3 image URL
          const newCategory = new Category({
            name,
            imageUrl: uploadResult.Location, // S3 URL of the uploaded image
          });

          await newCategory.save();

          res.status(201).json({ message: 'Category added successfully', category: newCategory });
        } catch (uploadError) {
          console.error('Error uploading to S3:', uploadError);
          return res.status(500).json({ message: 'Error uploading to S3', error: uploadError.message });
        }
      });
    } catch (error) {
      console.error('Internal server error:', error);
      res.status(500).json({ message: 'Internal server error', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

// Disable the default body parser to allow Multer to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};
