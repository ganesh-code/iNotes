const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/appConfig');

const fetchuser = (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const data = jwt.verify(token, getJwtSecret());
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Access denied. Invalid token.' });
  }
};

module.exports = fetchuser;
