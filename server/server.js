const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'client')));


// Run when client connects
io.on('connection', socket => {
  console.log(socket.id);

  socket.emit("message", "Welcome to Love Letter!"); // Only User

  socket.broadcast.emit("message", "A user has joined the lobby"); // All except user

  // io.emit(); - > All cients

  socket.on("disconnect", () => {
    io.emit("message", "A user has left the lobby")
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));