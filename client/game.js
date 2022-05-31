import { io} from 'socket.io-client'
const socket = io('http://localhost:3000');

const imgs = ["Guard.jpg", "Priest.jpg", "Baron.jpg", "Handmaid.jpg", "Prince.jpg", "King.jpg", "Countess.jpg", "Princess.jpg"];
const names = ["Steven", "Kevin", "Jonathan"];
let playerName = "Steven";
var i = 1;
var j = 0;
const currCard = document.getElementById("currCard");
const drawnCard = document.getElementById("drawnCard");
const nameDisplay = document.getElementById("nameDisplay");

function setName(name) {
  nameDisplay.innerHTML = "You are: " + socket.id;
}

socket.on("connect", () => {
  setName(socket.id);  
});

document.getElementById("currCard").onclick = function()
{
  cycleCards("currCardImg");
}

function playCard(id)
{
  alert(document.getElementById(id).src + " has been played!");
}


function cycleCards(id)
{
  document.getElementById(id).src = imgs[i];
  i++;
  if(i == imgs.length)
    i = 0;
}

document.getElementById("drawnCard").onclick = function()
{
  changeTurnTeller();
}

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
