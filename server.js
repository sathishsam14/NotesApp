const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/user');
const noteRoutes = require('./routes/note');

const app = express();

app.use(bodyParser.json());


app.use('/api/user', userRoutes);
app.use('/api/notes', noteRoutes);



const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
