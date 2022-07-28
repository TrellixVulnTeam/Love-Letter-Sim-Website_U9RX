const socket = io();

const imgs = ["Guard.jpg", "Priest.jpg", "Baron.jpg", "Handmaid.jpg", "Prince.jpg", "King.jpg", "Countess.jpg", "Princess.jpg"];
const names = ["Steven", "Kevin", "Jonathan"];
let playerName = "Steven";
const currCard = document.getElementById("currCard");
const drawnCard = document.getElementById("drawnCard");
const currCardImg = document.getElementById("currCardImg");
const drawnCardImg = document.getElementById("drawnCardImg");
const nameDisplay = document.getElementById("nameDisplay");
const userList = document.getElementById("userList");
const cardsInDeckTeller = document.getElementById("cardsInDeck");
const chatMessage = document.querySelector(".chat-message");

const targetArea = document.getElementById("target-box");
const targetText = document.getElementById("target-msg");

const numGuessArea = document.getElementById("numGuesser");
const numgGuessText = document.getElementById("numGuessMsg");

const standings = document.getElementById("standings");
const turnTeller = document.getElementById("turnteller")
const aliveTeller = document.getElementById("aliveTeller")

let roundOver = false;
const {name, room} = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

socket.emit('joinGameRoom', {name, room});

socket.on("startGame", () => {
  setName(name);
});

// When the game starts, update everything clientside
socket.on("gameUsers", ({room, users, currUser}) => {
  outputUsers(users);
  updateCards(users.find(user => user.name == name));
});

// gusers are the users in the room
socket.on("updateVisuals", gusers => {
  const guser = gusers.find(user => user.name == name);
  updateCards(guser);
  setScores(gusers);
  changeAliveness(guser.alive);
});

function setName(name) {
  nameDisplay.innerHTML = "You are: " + name;
}

// When currCard is clicked
document.getElementById("currCard").onclick = function() {
  socket.emit("currCard", {name, room});
}

function playCard(id) {
  alert(document.getElementById(id).src + " has been played!");
}

// When drawnCard is clicked
document.getElementById("drawnCard").onclick = function() {
  socket.emit("drawnCard", {name, room});
}

socket.on("playDrawnCard", ({name, drawnCardName}) => {
  outputMessage(`${name} has played their drawn card: ${drawnCardName}`);
  socket.emit("playCard", room);
});

socket.on("playCurrCard", ({name, currCardName}) => {
  outputMessage(`${name} has played their held card: ${currCardName}`);
  socket.emit("playCard", room);
});

socket.on("changeCardInDeck", numOfCards => {
  cardsInDeckTeller.innerText =`Cards Remaining in Deck: ${numOfCards}`;
});

socket.on("setTarget", cardName => {
  openTargetInput(cardName);
});

socket.on("guessNumber", (selectedPlayer) => {
  openNumGuesser(selectedPlayer);
});

socket.on("gameMessage", msg => {
  outputMessage(msg);
});

socket.on("winRound", (winningPlayerName) => {
  turnTeller.innerText = `${winningPlayerName} has won the round!`;
  roundOver = true;
  console.log("hi");
  console.log(roundOver);
});

socket.on("turn", () => {
  if(!roundOver)
    turnTeller.innerText = "It is your turn, your cards:";
});

socket.on("notTurn", () => {
  if(!roundOver)
    turnTeller.innerText = "It is not your turn, your card:";
});

function toggleGuideVisibility() {
  const cards = document.querySelectorAll(".guide");
  if(document.getElementById("firstGuide").style.display == "none")
  {
    cards.forEach(guide =>{
      guide.style.display = "inline";
    });
  }
  else
  {
    cards.forEach(guide =>{
      guide.style.display = "none";
    });
  }
}

document.getElementById("seeAllCards").onclick = function() {
  toggleGuideVisibility();
  socket.emit("showCurrGameUsers");
}

function outputUsers(users) {
  userList.innerHTML = "Players in Game: ";
  for(const user of users)
  {
      userList.innerHTML += user.name + ", ";
  }
  userList.innerHTML = userList.innerHTML.slice(0, -2);
}

function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="text">${message}</p>`;
  chatMessage.appendChild(div);
  chatMessage.scrollTop = chatMessage.scrollHeight;
}

function updateCards(player) {
  if(player.currCard)
    currCardImg.src = `${player.currCard.name}.jpg`;
  else
    currCardImg.src = "";
  if(player.drawnCard)
    drawnCardImg.src = `${player.drawnCard.name}.jpg`;
  else
    drawnCardImg.src = "";
}

function openTargetInput(cardName) {
  targetArea.style.display = "block";
  targetText.className = cardName;
  console.log(cardName);
}

document.getElementById("target-button").onclick = function() {
  const targetMSG = document.getElementById("target-msg").value;
  const cardName = targetText.className;
  socket.emit("targetSet", {name, targetMSG, cardName});
  targetArea.style.display = "none";
} 

function openNumGuesser(selectedPlayer) {
  numGuessArea.style.display = "block";
  numGuessArea.className = selectedPlayer.name;
}

document.getElementById("numGuessBtn").onclick = function() {
  const number = document.getElementById("numGuessMsg").value;
  if(number < 2 || number > 8) {
    outputMessage("(To you) This is not a valid number. Try again!");
  }
  else {
    socket.emit("numberGuessed", {
      number,
      selectedPlayerName: numGuessArea.className,
      name
    });
    numGuessArea.style.display = "none";
  }
}

function setScores(players) {
  standings.innerHTML = "";
  for(const player of players)
  {
    standings.innerHTML += `<h2>${player.name}: ${player.points}`;
  }
}

function changeAliveness(isAlive) {
  if(isAlive)
    aliveTeller.innerText = "You are alive. You may still play this round.";
  else
    aliveTeller.innerText = "You are dead. You many no longer play for this round.";
}