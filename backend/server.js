const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const { auth, isAdmin } = require('./middleware/auth');
const cors = require('cors');
const WebSocket = require('ws');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

// Example of an admin-only route
app.get('/api/admin', auth, isAdmin, (req, res) => {
  res.json({ msg: 'Admin access granted' });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Set up WebSocket server
const wss = new WebSocket.Server({ server });

let auctionTimers = {};

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const { auctionId, action, timeStep } = JSON.parse(message);

    if (action === 'start') {
      if (!auctionTimers[auctionId]) {
        auctionTimers[auctionId] = {
          timeLeft: timeStep,
          interval: setInterval(() => {
            if (auctionTimers[auctionId].timeLeft > 0) {
              auctionTimers[auctionId].timeLeft -= 1;
              wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({ auctionId, timeLeft: auctionTimers[auctionId].timeLeft }));
                }
              });
            } else {
              clearInterval(auctionTimers[auctionId].interval);
              delete auctionTimers[auctionId];
            }
          }, 1000)
        };
      }
    } else if (action === 'reset') {
      if (auctionTimers[auctionId]) {
        clearInterval(auctionTimers[auctionId].interval);
        delete auctionTimers[auctionId];
      }
      // Start a new timer with the initial timeStep
      auctionTimers[auctionId] = {
        timeLeft: timeStep,
        interval: setInterval(() => {
          if (auctionTimers[auctionId].timeLeft > 0) {
            auctionTimers[auctionId].timeLeft -= 1;
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ auctionId, timeLeft: auctionTimers[auctionId].timeLeft }));
              }
            });
          } else {
            clearInterval(auctionTimers[auctionId].interval);
            delete auctionTimers[auctionId];
          }
        }, 1000)
      };
      // Broadcast the reset timeLeft to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ auctionId, timeLeft: timeStep }));
        }
      });
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
