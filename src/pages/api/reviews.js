// pages/api/reviews.js
import dbConnect from '../../app/lib/dbconnect';
import Review from '../../models/Review';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  await dbConnect(); // Connect to the database

  const { method } = req;

  switch (method) {
    case 'POST': // Create or update a review
      try {
        const { orderId, reviews, comment } = req.body;

        // Validate input
        if (!orderId || !reviews) {
          return res.status(400).json({ success: false, message: 'Missing orderId or review data' });
        }

        // Check if review already exists for the orderId
        let existingReview = await Review.findOne({ orderId });

        if (existingReview) {
          // If it exists, update the review
          existingReview.reviews = reviews;
          existingReview.comment = comment;
          await existingReview.save();
          return res.status(200).json({ success: true, message: 'Review updated successfully' });
        } else {
          // If not, create a new review
          const newReview = new Review({ orderId, reviews, comment });
          await newReview.save();
          return res.status(201).json({ success: true, message: 'Review created successfully' });
        }
      } catch (error) {
        console.error('Error saving review:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
      }

    default:
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }
}
