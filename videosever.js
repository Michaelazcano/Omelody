const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static frontend files
app.use(express.static(path.join(__dirname, "public")));

let rooms = {}; // Stores room data

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("join-room", (roomId) => {
        if (!rooms[roomId]) {
            rooms[roomId] = [];
        }

        if (rooms[roomId].length < 2) {
            rooms[roomId].push(socket.id);
            socket.join(roomId);
            console.log(`User ${socket.id} joined room ${roomId}`);

            if (rooms[roomId].length === 2) {
                io.to(roomId).emit("room-ready");
            }
        } else {
            socket.emit("room-full");
        }
    });

    socket.on("signal", (data) => {
        io.to(data.target).emit("signal", {
            sender: socket.id,
            signal: data.signal,
        });
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);

        for (let room in rooms) {
            rooms[room] = rooms[room].filter(id => id !== socket.id);
            if (rooms[room].length === 0) {
                delete rooms[room];
            }
        }
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});