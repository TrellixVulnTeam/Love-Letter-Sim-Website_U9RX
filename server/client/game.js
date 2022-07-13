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
  updateCards(gusers.find(user => user.name == name));
  setScores(gusers);
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
  console.log(name + '\n' + drawnCardName);
  outputMessage(`${name} has played their drawn card: ${drawnCardName}`);
  socket.emit("playCard", room);
});

socket.on("changeCardInDeck", numOfCards => {
  cardsInDeckTeller.innerText =`Cards Remaining in Deck: ${numOfCards}`;
});

socket.on("setTarget", card => {
  openTargetInput(card);
  console.log("Jesjs");
});

socket.on("guessNumber", () => {
  openNumGuesser()
});

socket.on("gameMessage", msg => {
  outputMessage(msg);
});

function toggleGuideVisibility() {
  const cards = document.querySelectorAll(".guide");
  if(document.getElementById("firstGuide").style.display != "none")
  {
    cards.forEach(guide =>{
      guide.style.display = "none";
    });
  }
  else
  {
    cards.forEach(guide =>{
      guide.style.display = "inline";
    });
  }
}

document.getElementById("seeAllCards").onclick = function() {
  toggleGuideVisibility();
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
}

function updateCards(player) {
  console.log(player.currCard.name);
  if(player.currCard)
    currCardImg.src = `${player.currCard.name}.jpg`;
  else
    currCardImg.src = "";
  if(player.drawnCard)
    drawnCardImg.src = `${player.drawnCard.name}.jpg`;
  else
    drawnCardImg.src = "";
}

function openTargetInput(card) {
  targetArea.style.display = "block";
  targetText.className = card.name;
}

document.getElementById("target-button").onclick = function() {
  const targetMSG = document.getElementById("target-msg").value;
  console.log(targetMSG);
  const cardName = targetText.className;
  socket.emit("targetSet", {name, targetMSG, cardName});
  targetArea.style.display = "none";
} 

function openNumGuesser() {
  numGuessArea.style.display = "block";
}

document.getElementById("numGuessBtn").onclick = function() {
  socket.emit("numberGuessed", { // idk if i need to get the current player name
    number: document.getElementById("numGuessMsg").innerText,
    currPlayerName: playerName
  })
}

function setScores(players)
{
  standings.innerHTML = "";
  for(const player of players)
  {
    standings.innerHTML += `<h2>${player.name}: ${player.points}`;
  }
}