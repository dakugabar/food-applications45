import dbConnect from '../../app/lib/dbconnect'; // Adjust the path if necessary
import HeaderImage from '../../models/headerImageModel'; // Adjust the path if necessary
import multer from 'multer';
import AWS from 'aws-sdk';
import path from 'path';

// Configure AWS SDK with your credentials (ensure you have the correct IAM permissions for S3)
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION, // e.g., 'us-east-1'
});

const s3 = new AWS.S3();

// Configure Multer storage to store files in memory (for S3 upload)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/; // Allowed file types
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: File upload only supports the following filetypes - ' + filetypes));
  }
};

const upload = multer({ storage, fileFilter });

export const config = {
  api: {
    bodyParser: false, // Disables the default body parser to allow multer to handle file uploads
  },
};

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    upload.single('image')(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error uploading image', error: err.message });
      }

      const { title, description, url } = req.body;

      if (!title || !description || !url || !req.file) {
        return res.status(400).json({ message: 'All fields and an image are required' });
      }

      // Ensure AWS_BUCKET_NAME is correctly defined
      if (!process.env.AWS_BUCKET_NAME) {
        return res.status(500).json({ message: 'AWS_BUCKET_NAME is not set' });
      }

      // Upload the image to AWS S3
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME, // Make sure AWS_BUCKET_NAME is set correctly
        Key: `header-images/${Date.now()}-${req.file.originalname}`, // S3 object key (unique path)
        Body: req.file.buffer, // The file buffer
        ContentType: req.file.mimetype, // Mime type
      };

      try {
        const s3Response = await s3.upload(params).promise();

        // Create new HeaderImage entry in MongoDB with the S3 URL
        const newHeaderImage = new HeaderImage({
          title,
          description,
          url,
          imagePath: s3Response.Location, // The URL returned by S3
        });

        await newHeaderImage.save();
        res.status(201).json({ message: 'Header Image added successfully', headerImage: newHeaderImage });
      } catch (uploadError) {
        res.status(500).json({ message: 'Error uploading image to S3', error: uploadError.message });
      }
    });
  } else if (req.method === 'GET') {
    try {
      const headerImages = await HeaderImage.find();
      res.status(200).json(headerImages);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else if (req.method === 'PUT') {
    const { id } = req.query;

    upload.single('image')(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error uploading image', error: err.message });
      }

      try {
        const updatedData = {
          ...(req.body.title && { title: req.body.title }),
          ...(req.body.description && { description: req.body.description }),
          ...(req.body.url && { url: req.body.url }),
        };

        if (req.file) {
          // If a new file is uploaded, update the image path in S3
          const params = {
            Bucket: process.env.AWS_BUCKET_NAME, // Ensure the correct bucket is passed here
            Key: `header-images/${Date.now()}-${req.file.originalname}`,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
          };

          const s3Response = await s3.upload(params).promise();
          updatedData.imagePath = s3Response.Location; // Update with new image URL from S3
        }

        const updatedHeaderImage = await HeaderImage.findByIdAndUpdate(id, updatedData, { new: true });

        if (!updatedHeaderImage) {
          return res.status(404).json({ message: 'Header Image not found' });
        }

        res.status(200).json({ message: 'Header Image updated successfully', headerImage: updatedHeaderImage });
      } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
      }
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
