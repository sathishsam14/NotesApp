const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/database');
const router = express.Router();

const secretKey = 'noteToken';

// Register Route
router.post('/register', (request, response) => {
   
    const { username, email, password } = request.body;
  
    const hashedPassword = bcrypt.hashSync(password, 8);
  
    const query = `
    INSERT INTO 
    users (username, email, password)
     VALUES 
     (?, ?, ?)`;
   const value =  [username, email, hashedPassword]

    db.run(query,value, function(err) {
      if (err) {
        // If there is an error, send a 400 status with the error message
        return response.status(401).json({ error: err.message });
      }
      response.status(200).json({ message: 'User created successfully' });
    });
  });
  


// Login Route

router.post('/login', (request, response) => {
    const { email, password } = request.body;
  
    const query = `
    SELECT *
     FROM users
     WHERE email = ?`;
  
    db.get(query, [email], (err, user) => {
      if (err) {
        return response.status(500).json({ error: 'Database error' });
      }
      const comparePassword = bcrypt.compareSync(password, user.password)
      if (!user || !comparePassword) {
        return response.status(401).json({ error: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: '1h' });
      response.json({ token });
    });
  });

module.exports = router;
