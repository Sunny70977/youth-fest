const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const Arduino = require('./arduino');
const saveRecord = require('./recordhandler');

const app = express();
const PORT = 8080;

// Middlewares
app.use(express.static(path.join(__dirname, 'static')));
app.use('/home', express.static(path.join(__dirname, 'home')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve Home Page
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'home', 'home.html')); // change name if different
// });

// Serve YFT Data
app.get('/yft-data', (req, res) => {
  res.send(require('./YFTData.json'));
});

// Arduino Control Routes
app.post('/arduino/:action', (req, res) => {
  const action = req.params.action;

  switch (action) {
    case 'red':
      Arduino.sendRedLightSignal();
      return res.send('red');

    case 'green':
      Arduino.sendGreenLightSignal();
      return res.send('green');

    case 'yellow':
      Arduino.sendYellowLightSignal();
      return res.send('yellow');

    case 'off':
      Arduino.sendTurnOffSignal();
      saveRecord(
        req.body.eventCategory,
        req.body.eventName,
        req.body.team,
        req.body.startTime,
        req.body.performanceTime,
        req.body.participant
      );
      return res.send('off');

    case 'connect':
      Arduino.performConnection();
      return res.send('done');

    default:
      return res.send('error');
  }
});

// ✅ Restart Server Route
app.post('/refresh-server', (req, res) => {
  console.log('♻️ Server restarting...');
  res.send('Restarting server...');
  setTimeout(() => process.exit(0), 1000); // nodemon will auto-restart the server
});

app.listen(PORT, () => {
  console.log(`✅ Server started at http://localhost:${PORT}`);
});
