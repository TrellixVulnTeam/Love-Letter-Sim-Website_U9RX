const socket = io();

const form = document.getElementById("form");
const chatMessage = document.querySelector(".chat-message");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const startGameForm = document.getElementById("startGameForm");
const startGameBtn = document.getElementById("startGameBtn");

const {name, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});


socket.emit('joinRoom', {name, room});

socket.on("roomUsers", ({room, users, currUser}) => {
    outputRoomName(room);
    outputUsers(users);
    outputHost(users);
});

socket.on("connection", (name) => {
    setName(name);
})


// On typing a message
socket.on("message", message => {
    outputMessage(message);

    //Scrolls to the bottom
    chatMessage.scrollTop = chatMessage.scrollHeight;
});

socket.on("startGame", () => {
    window.location.href = `game.html?name=${name}&room=${room}`;
});

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const msg = e.target.elements.msg.value;
    socket.emit("chatMessage", msg);

    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
});

// Outputs a message to the chat box
function outputMessage(message) {
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `<p class="nameArea">${message.username}</p> <p class="text">${message.text}</p>`;
    chatMessage.appendChild(div);
  }

function outputRoomName(room) {
    roomName.innerText = "You are in Room: " + room;
}

function outputUsers(users) {
    userList.innerHTML = "Players in Lobby: ";
    for(const user of users)
    {
        userList.innerHTML += user.name + ", ";
    }
    userList.innerHTML = userList.innerHTML.slice(0, -2);
}

function outputHost(users) {
    const hostName = users.find(user => user.host).name;
    if(name == hostName)
    {
        host.innerHTML = "You are the host.";
        if(startGameForm.innerHTML === "")
        {
            startGameForm.innerHTML = `<button id="startGameBtn">Start Game</button>`;
        }
    }
    else
    {
        startGameForm.innerHTML = "";
        host.innerHTML = hostName + " is the host.";
    }
}

startGameBtn.onclick = function() {
    socket.emit("gameStart", room);
}