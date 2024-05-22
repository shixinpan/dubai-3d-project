require('dotenv').config();
const mom = require('moment');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const app = express();
const moment = require('moment');

// Enable CORS
app.use(cors());
app.use(express.json());
const jsonData = require('./data/3d/onegeo-DM-revised-id.json'); // Assuming your JSON data is in a file called data.json


app.get('/api/3d', (req, res) => {
  res.json(jsonData);
});

// Set up the database connection
const connection = mysql.createConnection({
  host: "dubaisensor.cwpeasuaysxh.us-east-2.rds.amazonaws.com",
  user: "admin",
  password: "poi-09qwe123",
  database: "Sensors",
  port: 3306,
});


connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');

  // Now you can perform queries here
  connection.query('SELECT * FROM Mastertable;', (error, results, fields) => {
    if (error) {
      console.error('Error querying database:', error);
      return;
    }
    console.log('Query result:', results);
  });
});


app.get('/api/getuuid', (req, res) => {
  const { buildingId } = req.query;

  const query = `SELECT uuid FROM Mastertable WHERE BuildingID = ?`;

  connection.query(query, [buildingId], (error, results, fields) => {
    if (error) {
      console.error('Error retrieving data from database:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      if (results.length > 0) {
        const uuid = results[0].uuid;
        res.json({ uuid });
      } else {
        res.json({ uuid: null });
      }
    }
  });
});


app.get('/api/dbdata/last24hours', (req, res) => {
  const { uuid } = req.query;
  const currentTime = new Date();
  const twentyFourHoursAgo = new Date(currentTime - 24 * 60 * 60 * 1000);
  const query = `SELECT * FROM ${uuid} WHERE timestamp >= ?`;
  const params = [twentyFourHoursAgo.toISOString()];
  
  connection.query(query, params, (error, results, fields) => {
    if (error) {
      console.error('Error retrieving data from database:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      const formattedResults = results.map(result => ({
        ...result,
        timestamp: moment(result.timestamp).format('YYYY-MM-DD HH:mm:ss')
      }));
      
      console.log('Formatted Results:', formattedResults);
      
      res.json(formattedResults);
    }
  });
});



app.get('/api/dbdata', (req, res) => {
  const { uuid, startDate, endDate } = req.query;
  const isoStartDate = moment(startDate, 'YYYY-MM-DD').toISOString();
  const isoEndDate = moment(endDate, 'YYYY-MM-DD').add(1, 'days').toISOString();

  const query = `SELECT * FROM ${uuid} WHERE timestamp >= ? AND timestamp < ?`;
  const params = [isoStartDate, isoEndDate];

  connection.query(query, params, (error, results, fields) => {
    if (error) {
      console.error('Error retrieving data from database:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      console.log('Query results:', results);
      res.json(results);
    }
  });
});




app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  // validate username and password
  if (username === process.env.USERNAME && (await bcrypt.compareSync(password, process.env.PASSWORD))) {
    // Create a token
    const token = jwt.sign({ username }, process.env.SECRET_KEY, { expiresIn: '1h' });

    res.json({ success: true, token });
  } else {
    res.json({ success: false });
  }
});

const port = 3001; // Set the desired port number
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
