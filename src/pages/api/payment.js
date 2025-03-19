import dbConnect from '../../app/lib/dbconnect';
import Payment from '../../models/Payment'; // Adjust the path if necessary
import multer from 'multer';
import AWS from 'aws-sdk';

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
  cb(null, true); // Accept all file types, but you can validate further if needed
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

        const { name, title } = req.body; // Extract title from request body

        if (!name || !title || !req.file) {
          return res.status(400).json({ message: 'All fields and an image are required' });
        }

        // Upload the image to S3
        const params = {
          Bucket: process.env.AWS_BUCKET_NAME, // Your S3 Bucket name
          Key: `payments/${Date.now()}-${req.file.originalname}`, // Key is the file path on S3
          Body: req.file.buffer, // The file buffer
          ContentType: req.file.mimetype, // Mime type
           
        };
        

        try {
          // Upload the file to S3
          const s3Response = await s3.upload(params).promise();

          // Create new payment with the image URL from S3
          const newPayment = new Payment({
            name,
            title, // Include title
            imageUrl: s3Response.Location, // The image URL returned by S3
          });

          await newPayment.save();

          res.status(201).json({ message: 'Payment added successfully', Payment: newPayment });
        } catch (uploadError) {
          res.status(500).json({ message: 'Error uploading image to S3', error: uploadError.message });
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error });
    }
  } else if (req.method === 'GET') {
    try {
      await dbConnect();
      const payments = await Payment.find();
      res.status(200).json(payments);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error });
    }
  } else if (req.method === 'PUT') {
    try {
      await dbConnect();
      const { id } = req.query;
      const { status } = req.body;
      const updatedPayment = await Payment.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      if (!updatedPayment) {
        return res.status(404).json({ message: 'Payment not found' });
      }
      res.status(200).json(updatedPayment);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
