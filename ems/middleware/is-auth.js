const jwt = require('jsonwebtoken');
require('dotenv/config');

module.exports = async (req, res, next) => {
  const authHeader = await req.get('Authorization');
  if (!authHeader) {
    return res.status(401).send('Not authenticated.');
  }
  const token = await authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_KEY);
  } catch (err) {
    return res.status(403).send('session expired login again');
  }
  if (!decodedToken) {
    return res.status(402).send('Not authenticated.');
  }
  req.userId=decodedToken.userId;
  req.userEmail=decodedToken.email;
  next();
};