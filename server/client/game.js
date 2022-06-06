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
  updateCards(currUser);
});


function setName(name) {
  nameDisplay.innerHTML = "You are: " + name;
}

document.getElementById("currCard").onclick = function() {
  cycleCards("currCardImg");
}

function playCard(id) {
  alert(document.getElementById(id).src + " has been played!");
}

var i = 1;
var j = 0;

function cycleCards(id) {
  document.getElementById(id).src = imgs[i];
  i++;
  if(i == imgs.length)
    i = 0;
}

document.getElementById("drawnCard").onclick = function() {
  socket.emit("drawnCard", {name, room});
}

socket.on("playDrawnCard", (name, drawnCardName) => {
  outputMessage(`${name} has played their drawn card: ${drawnCardName}`);
  changeTurnTeller();
});

function changeTurnTeller() {
  j++;
  if(j == names.length)
  {
    j = 0;
  }
  if(names[j] == playerName)
  {
    document.getElementById("turnteller").innerHTML = "It is your turn, your cards:"
  }
  else
  {
    document.getElementById("turnteller").innerHTML = "It is " + names[j] + "'s turn, your card:";
  }
}

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
  currCardImg.src = `${player.currCard.name}.jpg`;
  if(player.drawnCard)
    drawnCardImg.src = player.drawnCard.name;
}