const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const rooms = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('create-room', ({ roomId, username }) => {
        if (rooms[roomId]) {
            socket.emit('room-full');
        } else {
            rooms[roomId] = {
                players: [username],
                boards: [generateBoard(), generateBoard()],
                markedCells: [Array(25).fill(false), Array(25).fill(false)],
                currentTurn: 0 // Player 1 starts
            };
            socket.join(roomId);
            socket.emit('room-created', {
                roomId,
                board: rooms[roomId].boards[0],
                playerIndex: 0,
                turn: 0
            });
        }
    });

    socket.on('join-room', ({ roomId, username }) => {
        const room = rooms[roomId];
        if (room && room.players.length < 2) {
            const playerIndex = room.players.length;
            room.players.push(username);
            socket.join(roomId);
            socket.emit('room-created', {
                roomId,
                board: room.boards[playerIndex],
                playerIndex,
                turn: room.currentTurn
            });
            io.to(roomId).emit('start-game', {
                boards: room.boards,
                turn: room.currentTurn
            });
        } else {
            socket.emit('room-full');
        }
    });

    socket.on('mark-cell', ({ roomId, cellIndex, playerIndex }) => {
        const room = rooms[roomId];
        if (room && playerIndex === room.currentTurn) {
            room.markedCells[playerIndex][cellIndex] = true;
            io.to(roomId).emit('cell-marked', { cellIndex, number: room.boards[playerIndex][cellIndex], playerIndex });
            room.currentTurn = 1 - room.currentTurn; // Switch turn
            io.to(roomId).emit('turn-changed', { turn: room.currentTurn });
        }
    });

    socket.on('bingo', ({ roomId, playerIndex, board, markedCells }) => {
        const room = rooms[roomId];
        if (room) {
            const combinedMarkedCells = combineMarkedCells(room.markedCells);
            const playerMarkedCells = markedCells;
            const hasBingo = checkBingo(playerMarkedCells);
            console.log(`Player ${playerIndex} claimed bingo. Result: ${hasBingo}`);
            if (hasBingo) {
                io.to(roomId).emit('bingo-confirmed', { playerIndex });
            } else {
                socket.emit('bingo-invalid');
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
        // Optionally handle room cleanup here
    });
});

// Generate a random Bingo board
function generateBoard() {
    const board = Array.from({ length: 25 }, (_, i) => i + 1);
    for (let i = board.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [board[i], board[j]] = [board[j], board[i]];
    }
    return board;
}

// Combine marked cells from both players
function combineMarkedCells(markedCells) {
    const combined = Array(25).fill(false);
    for (let i = 0; i < 25; i++) {
        combined[i] = markedCells[0][i] || markedCells[1][i];
    }
    return combined;
}

// Check if the player's Bingo board has Bingo
function checkBingo(markedCells) {
    const size = 5;

    const checkLine = (indices) => indices.every(index => markedCells[index]);

    let completedLines = 0;

    // Check rows
    for (let i = 0; i < size; i++) {
        const rowIndices = [...Array(size).keys()].map(j => i * size + j);
        if (checkLine(rowIndices)) {
            completedLines++;
            console.log(`Completed row: ${rowIndices}`);
        }
    }

    // Check columns
    for (let i = 0; i < size; i++) {
        const columnIndices = [...Array(size).keys()].map(j => j * size + i);
        if (checkLine(columnIndices)) {
            completedLines++;
            console.log(`Completed column: ${columnIndices}`);
        }
    }

    // Check diagonals
    const diagonal1Indices = [...Array(size).keys()].map(i => i * size + i);
    if (checkLine(diagonal1Indices)) {
        completedLines++;
        console.log(`Completed diagonal: ${diagonal1Indices}`);
    }

    const diagonal2Indices = [...Array(size).keys()].map(i => (size - 1 - i) * size + i);
    if (checkLine(diagonal2Indices)) {
        completedLines++;
        console.log(`Completed diagonal: ${diagonal2Indices}`);
    }

    console.log(`Marked cells: ${markedCells}`);
    console.log(`Completed lines: ${completedLines}`);
    return completedLines >= 5;
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
