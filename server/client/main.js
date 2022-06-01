const socket = io();

const form = document.getElementById("");

socket.on("message", message => {
    console.log(message);
});