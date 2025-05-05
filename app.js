const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// middleware
app.use(express.json());
app.use(cors());

// Static file service
app.use(express.static(path.join(__dirname, 'public')));

// all routes return index.html to support SPA frontend routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// server start
if (process.env.NODE_ENV === 'production') {
  // Phusion Passenger will automatically handle the port
  app.listen(() => {
    console.log('Production server is running');
  });
} else {
  // local development use command line specified port
  const defaultPort = 3000;
  const serverPort = process.env.PORT || defaultPort;
  
  app.listen(serverPort, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${serverPort}`);
    console.log(`You can also access it via http://localhost:${serverPort}`);
  });
} 