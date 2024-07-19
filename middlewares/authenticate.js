const jwt = require('jsonwebtoken');
const secretKey = 'noteToken'; 


const authenticate = (request, response, next) => {
  
  const token = request.header('Authorization')?.replace('Bearer ', '');
 
  if (!token) {
    return response.status(401).json({ error: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    request.userId = decoded.id;

    next();
  } catch (error) {
    
    response.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authenticate;
