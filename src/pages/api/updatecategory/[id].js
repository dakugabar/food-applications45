import dbConnect from '../../../app/lib/dbconnect';
import Category from '../../../models/category';
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
  if (req.method === 'PUT') {
    try {
      await dbConnect();

      // Use Multer to parse the incoming form data
      upload.single('image')(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ message: 'Error uploading image', error: err.message });
        }

        const { name } = req.body;
        const { id } = req.query; // Get the category ID from the URL parameter

        if (!name) {
          return res.status(400).json({ message: 'Category name is required' });
        }

        try {
          // Find the category by ID
          const category = await Category.findById(id);

          if (!category) {
            return res.status(404).json({ message: 'Category not found' });
          }

          // If a new image is uploaded, upload it to S3 and update the category image
          let imageUrl = category.imageUrl; // Keep the old image if no new one is uploaded
          if (req.file) {
            // Upload the new image to S3
            const params = {
              Bucket: process.env.AWS_BUCKET_NAME, // Your S3 bucket name
              Key: `categories/${Date.now()}-${req.file.originalname}`, // File key in S3 bucket
              Body: req.file.buffer, // File data
              ContentType: req.file.mimetype, // MIME type
            };

            const uploadResult = await s3.upload(params).promise();
            imageUrl = uploadResult.Location; // New image URL from S3
          }

          // Update the category in the database
          category.name = name;
          category.imageUrl = imageUrl; // Update the image URL if a new image was uploaded

          await category.save();

          res.status(200).json({ message: 'Category updated successfully', category });
        } catch (updateError) {
          console.error('Error updating category:', updateError);
          return res.status(500).json({ message: 'Error updating category', error: updateError.message });
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
