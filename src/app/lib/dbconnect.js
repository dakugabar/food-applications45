import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI; // Your MongoDB connection string
const dbName = process.env.DB_NAME; // Your database name (optional)

let cachedDb = null;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

export default async function dbConnect() {
  if (cachedDb) {
    console.log('Using cached database connection');
    return 'Using cached database connection';
  }

  try {
    // Connect to MongoDB using Mongoose
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: dbName, // Optional: specify the database name if needed
    });

    // Get the database connection
    const db = mongoose.connection;

    // Check if the connection is successful
    db.once('open', () => {
      console.log('Successfully connected to MongoDB');
    });

    db.on('error', (err) => {
      console.error('Error connecting to MongoDB:', err.message);
    });

    // Cache the database connection
    cachedDb = db;

    return 'Successfully connected to MongoDB';
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    return `Error connecting to MongoDB: ${error.message}`; // Return full error message as a string
  }
}
