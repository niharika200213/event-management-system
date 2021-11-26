const jwt = require('jsonwebtoken');
require('dotenv/config');

module.exports = async (req, res, next) => {
  const authHeader = await req.get('Authorization');
  if (!authHeader){
    req.userId=null;
  }
  else{
    const token = await authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_KEY);
      } catch (err) {
        req.userId=null;
      }
      if (!decodedToken) {
        req.userId=null;
      }
      else{
        req.userId=decodedToken.userId;
      }
  }
  next();
};