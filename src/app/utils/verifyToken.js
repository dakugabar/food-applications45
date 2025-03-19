// utils/verifyToken.js
import jwt from 'jsonwebtoken';

export default function verifyToken(token) {
  if (!token) return null; // Handle absence of token

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    return decoded; // Return the decoded token data (including user ID)
  } catch (error) {
    console.error('Token verification error:', error);
    return null; // Return null if token is invalid
  }
}
