const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/database');
const router = express.Router();

const secretKey = 'noteToken';

// Register Route
router.post('/register', (request, response) => {
  const { username, email, password } = request.body;
  
  const checkUserQuery = `SELECT * FROM users WHERE email = ?`;
  
  db.get(checkUserQuery, [email], (err, row) => {
    if (err) {
      return response.status(401).json({ error: 'Database error' });
    }
    
    if (row) {
    
       response.status(400).json({ message: 'User already registered' });
    } else {
  
      const hashedPassword = bcrypt.hashSync(password, 8);
      
      const insertUserQuery = `
        INSERT INTO 
        users (username, email, password)
        VALUES 
        (?, ?, ?)`;
      
      const values = [username, email, hashedPassword];
      
      db.run(insertUserQuery, values, function(err) {
        if (err) {
          return response.status(401).json({ error: 'Error creating user' });
        }
        response.status(200).json({ message: 'User created successfully' });
      });
    }
  });
});

module.exports = router;


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
