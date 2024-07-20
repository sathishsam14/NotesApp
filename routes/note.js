const express = require('express');
const db = require('../database/database');
const authenticate = require('../middlewares/authenticate');
const router = express.Router();

// Create a new note
router.post('/', authenticate, (req, res) => {
  console.log('Request Body:', req.body); // Log the request body
  console.log('User:', req.user); // Log user info from authentication

  const { title, content, tags, color } = req.body;
  const userId = req.user.id;
  const timestamp = new Date().toISOString();
  
  const query = `
    INSERT INTO 
    notes (title, content, tags, color, userId, createdAt, updatedAt) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [title, content, tags, color, userId, timestamp, timestamp];
  
  db.run(query, values, function(err) {
    if (err) {
      console.error('Database Error:', err.message); // Log database errors
      return res.status(401).json({ error: err.message });
    } else {
      res.status(200).json({
        id: this.lastID, 
        title,
        content,
        tags,
        color,
        userId,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
  });
});

// Get all notes
router.get('/', authenticate, (req, res) => {
  const query = `SELECT * FROM notes WHERE userId = ? AND trashed = 0 AND archived = 0`;

  db.all(query, [req.user.id], (err, notes) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json(notes);
  });
});

// Update a note
router.put('/:id', authenticate, (req, res) => {
  const { title, content, tags, color, archived, trashed } = req.body;
  const noteId = req.params.id;
  const userId = req.user.id;
  
  const query = `
    UPDATE notes
    SET 
      title = ?, 
      content = ?, 
      tags = ?, 
      color = ?, 
      archived = ?, 
      trashed = ?, 
      updatedAt = ?
    WHERE 
      id = ? 
      AND userId = ?
  `;
  
  const timestamp = new Date().toISOString();
  const values = [title, content, tags, color, archived, trashed, timestamp, noteId, userId];
  
  db.run(query, values, function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    res.json({
      id: noteId,        
      title,
      content,
      tags,
      color,
      archived,
      trashed,
      updatedAt: timestamp    
    });
  });
});

// Delete a note
router.delete('/:id', authenticate, (req, res) => {
  const noteId = req.params.id;
  const userId = req.user.id;
  
  const query = `
    UPDATE notes
    SET 
      trashed = 1, 
      updatedAt = ?
    WHERE 
      id = ? 
      AND userId = ?
  `;
  
  const timestamp = new Date().toISOString();
  const values = [timestamp, noteId, userId];
  
  db.run(query, values, function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({
      id: noteId,       
      trashed: 1,               
      updatedAt: timestamp     
    });
  });
});

// Get archived notes
router.get('/archived', authenticate, (req, res) => {
  const query = `
    SELECT * FROM notes 
    WHERE userId = ? AND archived = 1 AND trashed = 0
  `;
  
  db.all(query, [req.user.id], (err, notes) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json(notes);
  });
});

// Get trashed notes
router.get('/trash', authenticate, (req, res) => {
  const query = `
    SELECT * FROM notes 
    WHERE userId = ? 
      AND trashed = 1
  `;
  
  db.all(query, [req.user.id], (err, notes) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json(notes);
  });
});

module.exports = router;
