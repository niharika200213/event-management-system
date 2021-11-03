const jwt = require('jsonwebtoken');
require('dotenv/config');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    return res.status(401).send('Not authenticated.');
  }
  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_KEY);
  } catch (err) {
    return res.status(500).send(err);
  }
  if (!decodedToken) {
    return res.status(402).send('Not authenticated.');
  }
  next();
};