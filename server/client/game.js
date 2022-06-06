const socket = io();

const imgs = ["Guard.jpg", "Priest.jpg", "Baron.jpg", "Handmaid.jpg", "Prince.jpg", "King.jpg", "Countess.jpg", "Princess.jpg"];
const names = ["Steven", "Kevin", "Jonathan"];
let playerName = "Steven";
const currCard = document.getElementById("currCard");
const drawnCard = document.getElementById("drawnCard");
const nameDisplay = document.getElementById("nameDisplay");


const {name, room} = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

socket.on("startGame", () => {
  setName(name);
});

function setName(name) {
  nameDisplay.innerHTML = "You are: " + name;
}

document.getElementById("currCard").onclick = function()
{
  cycleCards("currCardImg");
}

function playCard(id)
{
  alert(document.getElementById(id).src + " has been played!");
}

var i = 1;
var j = 0;

function cycleCards(id)
{
  document.getElementById(id).src = imgs[i];
  i++;
  if(i == imgs.length)
    i = 0;
}

document.getElementById("drawnCard").onclick = function()
{
  socket.emit("drawnCard", {name, room});
}

socket.on("playDrawnCard", (name) => {
  console.log(name + " played their drawn card!");
});

function changeTurnTeller()
{
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

function toggleGuideVisibility()
{
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

document.getElementById("seeAllCards").onclick = function()
{
  toggleGuideVisibility();
}
