const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { isObject } = require('util');
const admin = "Admin";

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const users = [];

// gameUser = {id, name, room, points, currCard, drawnCard, alive};
const gameUsers = [];

const decks = [];

let currPlayersInRoom = 0;

let currPlayerIndex = null;
let isCurrCard = null;

// Set static folder
app.use(express.static(path.join(__dirname, 'client')));



// Run when client connects
io.on('connection', socket => {
  // Lobby Code

  // When a user joins the lobby
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


  // Upon a player joining a game room
  socket.on("joinGameRoom", ({name, room}) => {
    
    // Create a deck if there isn't one
    if(decks.length == 0 || decks.find(deck => deck.room != room))
    {
      let deck = new Deck(currPlayersInRoom);
      deck.createDeck();
      deck.shuffleDeck();
      deck.drawCard();
      decks.push({room, deck});
    }

    // User joins and socket remembers them for the room
    const gameUser = userJoinGame(socket.id, name, room);
    socket.join(gameUser.room);

    io.to(gameUser.room).emit("gameUsers", {
      room: gameUser.room,
      users: getGameRoomUsers(gameUser.room),
      currUser: getCurrGameUser(socket.id)
    });
    startGame(room);
    const numOfCards = decks.find(dec => dec.room == room).deck.deckOfCards.length;
    socket.emit("changeCardInDeck", numOfCards);
    const gusers = getGameRoomUsers(gameUser.room);
    io.to(room).emit("updateVisuals", gusers);
  });

  // Upon a host pressing the start button
  socket.on("gameStart", (room) => {
    let numOfPlayers = 0;
    for(let i = 0; i < users.length; i++)
    {
      if(users[i].room == room)
        numOfPlayers++;
    }

    // Create a deck if there isn't one
    if(decks.length == 0 || decks.find(deck => deck.room != room))
    {
      let deck = new Deck(currPlayersInRoom);
      deck.createDeck();
      deck.shuffleDeck();
      deck.drawCard();
      decks.push({room, deck});
    }

    // Set the first player as the first one in the thingy
    currPlayerIndex = 0;

    io.to(room).emit("startGame");
    currPlayersInRoom = numOfPlayers;
  });

  socket.on("currCard", ({name, room}) => {
    gameUser = findGameUser(name);
    io.to(room).emit("playCurrCard", {name, currCardName: gameUser.currCard.name});
    gameUser.currCard.discard(findGameUser(name), gameUser.currCard);
    gameUser.currCard = gameUser.drawnCard;
    gameUser.drawnCard = null;
    const gusers = getGameRoomUsers(gameUser.room);
    io.to(room).emit("updateVisuals", gusers);
  });

  socket.on("drawnCard", ({name, room}) => {
    //TODO SERVERSIDE
    gameUser = findGameUser(name);
    io.to(room).emit("playDrawnCard", {name, drawnCardName: gameUser.drawnCard.name});
    gameUser.drawnCard.discard(findGameUser(name), gameUser.drawnCard);
    gameUser.drawnCard = null;
    const gusers = getGameRoomUsers(gameUser.room);
    io.to(room).emit("updateVisuals", gusers);
  });


  // When a card is played
  socket.on("playCard", (room) => {
    const numOfCards = decks.find(dec => dec.room == room).deck.deckOfCards.length;
    socket.emit("changeCardInDeck", numOfCards);
    const gusers = getGameRoomUsers(gameUser.room);
    io.to(room).emit("updateVisuals", gusers);
  });

  //TODO Have to figure out how to differentiate cards, could make global var
  socket.on("targetSet", ({name, targetMSG, cardName}) => {
    const selectedPlayer = gameUsers.find(user => user.name == targetMSG);
    const currPlayer = gameUsers.find(user => user.name == name);
    if(!selectedPlayer)
    {
      io.to(currPlayer.id).emit("gameMessage", `(To you) Player not found. Try again!`);
      io.to(currPlayer.id).emit("setTarget", cardName);
    }
    else if(!selectedPlayer.alive)
    {
      io.to(currPlayer.id).emit("gameMessage", `(To you) Player not alive. Try again!`);
      io.to(currPlayer.id).emit("setTarget", cardName);
    }
    else if(selectedPlayer.immune)
    {
      io.to(currPlayer.id).emit("gameMessage", `(To you) Player is immune due to Handmaid. Try again!`);
      io.to(currPlayer.id).emit("setTarget", cardName);
    }
    else if(cardName == "Guard")
    {
      io.to(currPlayer.id).emit("guessNumber", selectedPlayer);
    }
    else if(cardName == "Priest")
    {
      const priestMsg = `(To you) ${selectedPlayer.name} has a ${selectedPlayer.currCard.name}`;
      io.to(gameUsers.find(user => user.name == name).id).emit("gameMessage", priestMsg);
      changeTurn(selectedPlayer.room);
      io.to(currPlayer.room).emit("gameMessage", `${currPlayer.name} has looked at ${selectedPlayer.name}'s hand.`);

    }
    else if(cardName == "Baron")
    {
      io.to(currPlayer.room).emit("gameMessage", `${currPlayer.name} is battling ${selectedPlayer.name}.`);
      let currPlayerCardNum = 0;
      if(currPlayer.currCard)
        currPlayerCardNum = currPlayer.currCard.num;
      else
        currPlayerCardNum = currPlayer.drawnCard.num;
      io.to(currPlayer.id).emit("gameMessage", `(To you) ${selectedPlayer.name} has a ${selectedPlayer.currCard.name}`);
      if(currPlayerCardNum < selectedPlayer.currCard.num)
        killPlayer(currPlayer)
      else if (currPlayerCardNum > selectedPlayer.currCard.num)
        killPlayer(selectedPlayer)
      changeTurn(selectedPlayer.room);
    }
    else if(cardName == "Prince")
    {
      const currDeck = decks.find(deck => deck.room == selectedPlayer.room);
      io.to(currPlayer.room).emit("gameMessage", `${currPlayer.name} is discarding ${selectedPlayer.name}'s hand.`);
      if(selectedPlayer.currCard)
      {
        io.to(currPlayer.room).emit("gameMessage", `${selectedPlayer.name} discarded a ${selectedPlayer.currCard.name}`);
        if (selectedPlayer.currCard.name == "Princess")
          killPlayer(selectedPlayer);
        selectedPlayer.currCard = currDeck.deck.drawCard();
      }
      else
      {
        io.to(currPlayer.room).emit("gameMessage", `${selectedPlayer.name} discarded a ${selectedPlayer.drawnCard}`);
        if (selectedPlayer.drawnCard.name == "Princess")
          killPlayer(selectedPlayer);
        selectedPlayer.drawnCard = null;
        selectedPlayer.currCard = currDeck.deck.drawCard();
      }
      changeTurn(selectedPlayer.room);
    }
    else if(cardName == "King")
    {
      io.to(currPlayer.room).emit("gameMessage", `${currPlayer.name} has swapped their card with ${selectedPlayer.name}.`)
      if(currPlayer.currCard)
      {
        const temp = currPlayer.currCard;
        currPlayer.currCard = selectedPlayer.currCard;
        selectedPlayer.currCard = temp;
      }
      else {
        const temp = currPlayer.drawnCard;
        currPlayer.currCard = selectedPlayer.currCard;
        selectedPlayer.currCard = temp;
        currPlayer.drawnCard = null;
      }
      changeTurn(selectedPlayer.room);
    }
  });

  socket.on("numberGuessed", ({number, selectedPlayerName, name}) => {
    selectedPlayer = gameUsers.find(user => user.name == selectedPlayerName);
    io.to(selectedPlayer.room).emit("gameMessage", `${name} guessed that ${selectedPlayer.name} has a card with the number ${number}`)
    if(number == selectedPlayer.currCard.num) {
      killPlayer(selectedPlayer);
    }
    else {
      io.to(selectedPlayer.room).emit("gameMessage", `${selectedPlayer.name} did not have this card.`);
    }
    changeTurn(selectedPlayer.room);
  });

  socket.on("showCurrGameUsers", () => {
    console.log(gameUsers);
  });

  socket.on("resetTheGame", room =>{
    resetGame(room);
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

function userJoinGame(id, name, room) {
  let indexOfUser = gameUsers.findIndex(user => user.name == name);
  if(indexOfUser != -1)
  {
    gameUsers[indexOfUser].id = id;
    return gameUsers[indexOfUser];
  }
  const points = 0;
  const currDeck = decks.find(dec => dec.room == room);
  const currCard = currDeck.deck.drawCard();
  const drawnCard = null;
  const alive = true;
  const immune = false;
  const user = {id, name, room, points, currCard, drawnCard, alive, immune};
  gameUsers.push(user);
  return user;
}

function getCurrUser(id) {
  return users.find(user => user.id === id);
}

function getCurrGameUser(id) {
  return gameUsers.find(user => user.id == id);
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

function getGameRoomUsers(room) {
  return gameUsers.filter(user => user.room == room);
}


function getNextPlayer(currPlayerName, room) {
  var i = gameUsers.findIndex(player => player.room == room && player.name == currPlayerName);
  if(i == -1)
  {
    var i = gameUsers.findIndex(player => player.room == room);
    return gameUsers[i];
  }
  i++;
  while(gameUsers[i].room != room)
  {
    i++;
    if(i == gameUsers.length)
      i = 0;
  }
  return gameUsers[i];
}

function findGameUser(name) {
  return gameUsers.find(user => user.name == name);
}

//TODO
function startGame(room) {
  const currPlayer = getNextPlayer("", room);
  if(!currPlayer)
    return;
  if(!currPlayer.drawnCard)
  {
    const currDeck = decks.find(deck => deck.room == room);
    currPlayer.drawnCard = currDeck.deck.drawCard();
  }
  io.to(currPlayer.room).emit("notTurn");
  io.to(currPlayer.id).emit("turn");
}

function changeTurn(room) {
  const originalIndex = currPlayerIndex;
  currPlayerIndex++;
  const gameRoomUsers = getGameRoomUsers(room);
  if (currPlayerIndex == gameRoomUsers.length)
    currPlayerIndex = 0;
  while(!(gameRoomUsers[currPlayerIndex].alive)) {
    currPlayerIndex++;
    if (currPlayerIndex == gameRoomUsers.length)
      currPlayerIndex = 0;
    if(currPlayerIndex == originalIndex) {
      endGame(room, gameRoomUsers[currPlayerIndex]);
    }
  }
  gameRoomUsers[currPlayerIndex].immune = false;
  const currDeck = decks.find(deck => deck.room == room);
  gameRoomUsers[currPlayerIndex].drawnCard = currDeck.deck.drawCard();
  selectedPlayerIndex = null;
  isCurrCard = null;
  const gusers = getGameRoomUsers(gameUser.room);
  io.to(room).emit("updateVisuals", gusers);
  // What happens when theres no cards left
  if(currDeck.deck.deckOfCards.length == 0) {
    let maxPlayer = gameRoomUsers[0];
    let maxNum = gameRoomUsers[0].currCard.num;
    for(let i = 0; i < gameRoomUsers.length; i++) {
      if(gameRoomUsers[i].currCard && maxNum < gameRoomUsers[i].currCard.num)
      {
        maxNum = gameRoomUsers[i].currCard.num;
        maxPlayer = gameRoomUsers[i];
      }
    }
    endGame(room, maxPlayer);
  }
  // If there's only one player left alive
  if(currPlayerIndex == originalIndex) {
    endGame(room, gameRoomUsers[currPlayerIndex]);
  }
  io.to(gameRoomUsers[currPlayerIndex].room).emit("notTurn");
  io.to(gameRoomUsers[currPlayerIndex].id).emit("turn");
}

function endGame(room, winningPlayer) {
  winningPlayer.points++;
  console.log("endgame");
  io.to(room).emit("winRound", winningPlayer.name);
}

function resetGame(room) {
  const gameRoomUsers = getGameRoomUsers(room);
  const currDeck = decks.find(dec => dec.room == room);
  currDeck.deck.reset();
  currDeck.deck.createDeck();
  currDeck.deck.discard();
  for(let i = 0; i < gameRoomUsers.length; i++) {
    gameRoomUsers[i].alive = true;
    gameRoomUsers[i].currCard = currDeck.deck.drawCard();
    gameRoomUsers[i].drawnCard = null;
  }
  startGame(room);
}

function killPlayer(player) {
  player.alive = false;
  io.to(player.room).emit("gameMessage", `${player.name} died. The card in their hand was ${player.currCard.name}`);
  player.currCard = null;
  const gusers = getGameRoomUsers(gameUser.room);
  io.to(player.room).emit("updateVisuals", gusers);
}

// Deck class
class Deck {
  constructor(numOfPlayers) {
      if(numOfPlayers > 4)
          this.expansion = true;
      else
          this.expansion = false;
      this.deckOfCards = [];
      this.discardPlie = [];
  }

  createDeck() {
      //Todo
      if(this.expansion) {

      }
      else {
          for(let i = 0; i < 5; i++)
              this.deckOfCards.push(new Guard());

          this.deckOfCards.push(new Priest());
          this.deckOfCards.push(new Priest());
          this.deckOfCards.push(new Baron());
          this.deckOfCards.push(new Baron());
          this.deckOfCards.push(new Handmaid());
          this.deckOfCards.push(new Handmaid());
          this.deckOfCards.push(new Prince());
          this.deckOfCards.push(new Prince());
          this.deckOfCards.push(new King());
          this.deckOfCards.push(new Countess());
          this.deckOfCards.push(new Princess());
      }
  }

  deleteDeck() {
      this.deckOfCards = [];
  }

  deleteDiscardPile() {
      this.discardPlie = [];
  }

  reset() {
      this.deleteDeck();
      this.deleteDiscardPile();
  }

  shuffleDeck() {
      this.deckOfCards = this.deckOfCards.sort((a, b) => 0.5 - Math.random());
  }

  drawCard() {
      return this.deckOfCards.pop();
  }

  discard(card) {
      this.discardPlie.push(card);
  }
}

// Card 
class Card {
  constructor(name, desc, num, img) {
      this.name = name;
      this.desc = desc;
      this.num = num;
      this.img = img;
      this.player = null;
  }
  
  discard(currPlayer, currCard) {}


  targetPlayer(currPlayer, cardName) {
    io.to(currPlayer.id).emit("setTarget", cardName);
  }
}

class Guard extends Card {
  constructor() {
      super("Guard", "Name a number other than 1 and choose another player."
          + "\nIf they have that number in their hand, they are knocked out of the round.", 1, "Guard.jpg");
  }
  
  discard(currPlayer, currCard) {
    this.targetPlayer(currPlayer, currCard.name);
    
  }
  

};

class Priest extends Card {
  constructor() {
      super("Priest", "Look at another player's hand.", 2, "Priest.jpg");
  }

  discard(currPlayer, currCard) {
    this.targetPlayer(currPlayer, currCard.name);
  }
}

class Baron extends Card {
  constructor() {
      super("Baron", "You and another player secretly compare hands. "
       + "\nThe player with the lower value is out of the round.", 3, "Baron.jpg");
  }

  discard(currPlayer, currCard) {
    this.targetPlayer(currPlayer, currCard.name);
  }
}

class Handmaid extends Card {
  constructor() {
      super("Handmaid", "Until your next turn, "
       + "ignore all effects from the other players' cards.", 4, "Handmaid.jpg");
  }

  discard(currPlayer, currCard) {
    currPlayer.immune = true;
    changeTurn(currPlayer.room);
  }
}

class Prince extends Card {
  constructor() {
      super("Prince", "Choose any player (including yourself) "
      + "to discard his or her hand and draw a new card.", 5, "Prince.jpg");
  }

  discard(currPlayer, currCard) {
    this.targetPlayer(currPlayer, currCard.name);
  }
}


class King extends Card {
  constructor() {
      super("King", "Trade hands with another player of your choice.", 6, "King.jpg")
  }

  discard(currPlayer, currCard) {
    this.targetPlayer(currPlayer, currCard.name);
  }
}

class Countess extends Card {
  constructor() {
      super("Countess", "If you have this card and the King or Prince in your hand, "
      + "you must discard this card.", 7, "Countess.jpg");
  }

  discard(currPlayer, currCard) {
    changeTurn(currPlayer.room);
  }
}

class Princess extends Card {
  constructor() {
      super("Princess", "If you discard this card, you are out of the round.", 8, "Princess.jpg");
  }

  discard(currPlayer, currCard) {
    killPlayer(currPlayer);
    changeTurn(currPlayer.room);
  }
}