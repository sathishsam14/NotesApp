const express = require('express');
const db = require('../database/database');
const authenticate = require('../middlewares/authenticate');
const router = express.Router();

//create a new note
router.post('/', authenticate, (request, response) => {

    const { title, content, tags, color } = request.body;
    const userId = request.user.id;
    const timestamp = new Date().toISOString();
    
    const query = `
      INSERT INTO 
      notes (title, content, tags, color, userId, createdAt, updatedAt) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [title, content, tags, color, userId, timestamp, timestamp];
    
    db.run(query, values, function(err) {
      if (err) {
        return response.status(401).json({ error: err.message });
      } else {
        response.status(200).json({
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
  


  router.get('/', authenticate, (request, response) => {
   
    const query = `SELECT * FROM notes WHERE userId = ? AND trashed = 0 AND archived = 0`;
  
    
    db.all(query, [request.user.id], (err, notes) => {
      if (err) {
        return response.status(400).json({ error: err.message });
      }
      response.json(notes);
    });
  });
  
// Update a Note
router.put('/:id', authenticate, (request, response) => {
    const { title, content, tags, color, archived, trashed } = request.body;
    const noteId = request.params.id
    const userId = request.user.id
    
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
    const value = [title, content, tags, color, archived, trashed, timestamp,noteId , userId]
    db.run(query,value , function(err) {
      if (err) {
        return response.status(400).json({ error: err.message });
      }
      
      response.json({
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
  

// Delete a Note
router.delete('/:id', authenticate, (request, response) => {

    const noteId =  request.params.id
    const userId = request.user.id
   
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
  
    const value = [timestamp,noteId, userId ]
    db.run(query, value, function(err) {
      if (err) {
        return response.status(400).json({ error: err.message });
      }
      response.json({
        id: noteId,       
        trashed: 1,               
        updatedAt: timestamp     
      });
    });
  });
  

// Get Archived Notes
router.get('/archived', authenticate, (request, response) => {
    const value =  request.user.id
    const query = `
      SELECT * FROM notes 
      WHERE userId = ? AND archived = 1 AND trashed = 0
    `;
    
    db.all(query,value, (err, notes) => {
      if (err) {
        return response.status(400).json({ error: err.message });
      }
      
     
      response.json(notes);
    });
  });


// Get Trashed Notes
router.get('/trash', authenticate, (request, response) => {
    const userId = request.user.id
    const query = `
      SELECT * FROM notes 
      WHERE userId = ? 
        AND trashed = 1
    `;
  
    db.all(query, userId, (err, notes) => {
      if (err) {
        return response.status(400).json({ error: err.message });
      }
      response.json(notes);
    });
  });
  

module.exports = router;
