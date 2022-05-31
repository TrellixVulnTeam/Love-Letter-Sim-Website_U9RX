const { instrument } = require("@socket.io/admin-ui");


const io = require("socket.io")(3000, {
    cors: {
        origin: ["http://localhost:8080", "https://admin.socket.io"]
    }
});

io.on("connection", socket =>{
    console.log(socket.id);
})

instrument(io, { auth: false});