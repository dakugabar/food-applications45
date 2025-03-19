import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // Assuming the token contains the user id
    next(); // Continue to the next middleware or route handler
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Unauthorized, invalid token' });
  }
};

export default auth;
