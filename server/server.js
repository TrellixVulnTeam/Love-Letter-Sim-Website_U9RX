const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const admin = "Admin";

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const users = [];

const gameUsers = [];


// Set static folder
app.use(express.static(path.join(__dirname, 'client')));



// Run when client connects
io.on('connection', socket => {
  // Lobby Code

  socket.on("joinRoom", ({name, room}) => {
    const user = userJoin(socket.id, name, room);
    socket.join(user.room);

    socket.emit("message", formatMessage(admin, "Welcome to Love Letter!")); // Only User
    socket.broadcast.to(user.room).emit("message", formatMessage(admin, `${user.name} has joined the lobby`)); // All except user


    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
      currUser: getCurrUser(socket.id)
    });


    // When a user leaves the lobby
    socket.on("disconnect", () => {
      const user = userLeave(socket.id);
      if(user) {
        io.to(user.room).emit("message", formatMessage(admin, `${user.name} has left the lobby`));
        io.to(user.room).emit("roomUsers", {
          room: user.room,
          users: getRoomUsers(user.room),
          currUser: getCurrUser(socket.id)
        }); 
      }
    });
  });

  // io.emit(); - > All users


  // Game Code
  socket.on("chatMessage", (msg) => {
    const user = getCurrUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.name, msg));
  });

  socket.on("gameStart", (room) => {
    for(var i = 0; i < users.length; i++)
    {
      // Need to change because right now it just pushes the user into the thingy with no connection to the client
      if(users[i].room == room)
      {
        gameUsers.push(users[i]);
      }
    }
    io.to(room).emit("startGame");
  })

  socket.on("drawnCard", ({name, room}) => {
    console.log(name + " played " + room);
    io.to(room).emit("playDrawnCard", name);
  });

});


const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

function formatMessage(username, text) {
  return {
      username,
      text
  }
}

function userJoin(id, name, room) {
  // Temp sol
  const roomUsers = users.filter(user => user.room === room);
  let host = roomUsers.length == 0;
  if(roomUsers.length > 0 && !roomUsers[0].host)
    host = true;
  const user = {id, name, room, host};
  users.push(user);
  return user;
}

function getCurrUser(id) {
  return users.find(user => user.id === id);
}

function userLeave(id) {
  const index = users.findIndex(user => user.id === id);
  if(index !== -1) {
      return users.splice(index, 1)[0];
  }
}

function getRoomUsers(room) {
  return users.filter(user => user.room == room);
}
